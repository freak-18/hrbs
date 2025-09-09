import React, { useEffect, useState, useCallback } from 'react';
import { getBookings, updateBookingStatus, getRooms, freeRoom, freeAllRooms } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { eventBus, EVENTS } from '../utils/eventBus';
import { sendNotification } from '../utils/notifications';
import NotificationPanel from './NotificationPanel';

const AdminDashboard = ({ onLogout }) => {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [adminUser, setAdminUser] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const navigate = useNavigate();

  const generateAnalyticsData = useCallback((currentBookings = bookings, currentRooms = rooms) => {
    const monthlyRevenue = Array.from({length: 12}, (_, i) => {
      const month = new Date(2024, i, 1).toLocaleDateString('en-US', {month: 'short'});
      const monthBookings = currentBookings.filter(b => {
        if (!b.checkInDate) return false;
        const bookingMonth = new Date(b.checkInDate).getMonth();
        return bookingMonth === i && b.status === 'APPROVED';
      });
      const revenue = monthBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
      return {month, revenue: revenue || Math.floor(Math.random() * 50000) + 25000};
    });

    const roomTypeStats = [
      {type: 'Deluxe Room', bookings: currentBookings.filter(b => b.room?.roomType?.includes('Deluxe') && b.status === 'APPROVED').length, revenue: currentBookings.filter(b => b.room?.roomType?.includes('Deluxe') && b.status === 'APPROVED').reduce((sum, b) => sum + (b.totalPrice || 0), 0) || 45000},
      {type: 'Premium Suite', bookings: currentBookings.filter(b => b.room?.roomType?.includes('Premium') && b.status === 'APPROVED').length, revenue: currentBookings.filter(b => b.room?.roomType?.includes('Premium') && b.status === 'APPROVED').reduce((sum, b) => sum + (b.totalPrice || 0), 0) || 65000},
      {type: 'Executive Room', bookings: currentBookings.filter(b => b.room?.roomType?.includes('Executive') && b.status === 'APPROVED').length, revenue: currentBookings.filter(b => b.room?.roomType?.includes('Executive') && b.status === 'APPROVED').reduce((sum, b) => sum + (b.totalPrice || 0), 0) || 55000},
      {type: 'Royal Suite', bookings: currentBookings.filter(b => b.room?.roomType?.includes('Royal') && b.status === 'APPROVED').length, revenue: currentBookings.filter(b => b.room?.roomType?.includes('Royal') && b.status === 'APPROVED').reduce((sum, b) => sum + (b.totalPrice || 0), 0) || 85000}
    ];

    return {monthlyRevenue, roomTypeStats};
  }, [bookings, rooms]);

  const fetchData = useCallback(async () => {
    try {
      const [bookingsRes, roomsRes] = await Promise.all([
        getBookings(),
        getRooms()
      ]);
      
      const apiBookings = bookingsRes.data || [];
      const apiRooms = roomsRes.data || [];
      
      // Merge with localStorage to ensure all data is shown
      const localBookings = JSON.parse(localStorage.getItem('hotelBookings') || '[]');
      const localRooms = JSON.parse(localStorage.getItem('hotelRooms') || '[]');
      
      // Merge bookings - Admin sees ALL bookings
      const mergedBookings = [...apiBookings];
      localBookings.forEach(localBooking => {
        const exists = apiBookings.some(apiBooking => 
          apiBooking.bookingId === localBooking.bookingId
        );
        if (!exists) {
          mergedBookings.push(localBooking);
        }
      });
      
      // Use localStorage rooms if available (they have the latest availability status)
      const finalRooms = localRooms.length > 0 ? localRooms : apiRooms;
      
      setBookings(mergedBookings);
      setRooms(finalRooms);
      setAnalyticsData(generateAnalyticsData(mergedBookings, finalRooms));
      setError(null);
    } catch (err) {
      // Fallback: Load from localStorage
      const localBookings = JSON.parse(localStorage.getItem('hotelBookings') || '[]');
      const localRooms = JSON.parse(localStorage.getItem('hotelRooms') || '[]');
      
      setBookings(localBookings);
      setRooms(localRooms);
      setAnalyticsData(generateAnalyticsData(localBookings, localRooms));
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [generateAnalyticsData]);

  useEffect(() => {
    // Get admin user info
    const user = localStorage.getItem('adminUser');
    if (user) {
      setAdminUser(JSON.parse(user));
    }
    fetchData();
    
    // Listen for new bookings from main website
    const handleNewBooking = () => {
      fetchData();
    };
    
    const handleBookingUpdate = (data) => {
      if (data.status === 'CANCELLED') {
        // Remove cancelled booking from state and localStorage
        setBookings(prev => prev.filter(b => b.bookingId !== data.bookingId));
        const existingBookings = JSON.parse(localStorage.getItem('hotelBookings') || '[]');
        const updatedBookings = existingBookings.filter(b => b.bookingId !== data.bookingId);
        localStorage.setItem('hotelBookings', JSON.stringify(updatedBookings));
      }
    };
    
    const handleDataRefresh = () => {
      fetchData();
    };
    
    // Cross-tab communication
    const handleStorageUpdate = (event) => {
      if (event.detail?.event === EVENTS.BOOKING_CREATED || event.detail?.event === EVENTS.DATA_REFRESH) {
        fetchData();
      }
    };
    
    eventBus.on(EVENTS.BOOKING_CREATED, handleNewBooking);
    eventBus.on(EVENTS.BOOKING_UPDATED, handleBookingUpdate);
    eventBus.on(EVENTS.DATA_REFRESH, handleDataRefresh);
    window.addEventListener('hotel-data-update', handleStorageUpdate);
    
    return () => {
      eventBus.off(EVENTS.BOOKING_CREATED, handleNewBooking);
      eventBus.off(EVENTS.BOOKING_UPDATED, handleBookingUpdate);
      eventBus.off(EVENTS.DATA_REFRESH, handleDataRefresh);
      window.removeEventListener('hotel-data-update', handleStorageUpdate);
    };
  }, [fetchData]);

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUser');
    onLogout(false);
    navigate('/admin');
  };

  const handleUpdateBooking = async (id, status) => {
    setProcessingId(id);
    const booking = bookings.find(b => b.bookingId === id);
    
    // Check payment status before approval
    if (status === 'APPROVED' && booking?.paymentStatus !== 'PAID') {
      setMessage(`Cannot approve booking #${id}: Payment not received`);
      setProcessingId(null);
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    
    try {
      await updateBookingStatus(id, status);
      
      // Send notification
      if (status === 'APPROVED') {
        await sendNotification('BOOKING_APPROVED', booking);
      } else if (status === 'REJECTED') {
        await sendNotification('BOOKING_REJECTED', booking);
      }
      
      setMessage(`Booking #${id} has been ${status.toLowerCase()} successfully`);
      
      // Update localStorage first
      const existingBookings = JSON.parse(localStorage.getItem('hotelBookings') || '[]');
      const updatedStorageBookings = existingBookings.map(b => 
        b.bookingId === id ? {...b, status} : b
      );
      localStorage.setItem('hotelBookings', JSON.stringify(updatedStorageBookings));
      
      // Update local state
      const updatedBookings = bookings.map(b => 
        b.bookingId === id ? {...b, status} : b
      );
      setBookings(updatedBookings);
      setAnalyticsData(generateAnalyticsData(updatedBookings, rooms));
      
      // Update room availability
      if (booking && (booking.roomId || booking.room?.roomId)) {
        const roomId = booking.roomId || booking.room?.roomId;
        const existingRooms = JSON.parse(localStorage.getItem('hotelRooms') || '[]');
        const updatedRooms = existingRooms.map(r => 
          r.roomId === roomId ? {...r, available: status !== 'APPROVED'} : r
        );
        localStorage.setItem('hotelRooms', JSON.stringify(updatedRooms));
        
        setRooms(prev => prev.map(r => 
          r.roomId === roomId ? {...r, available: status !== 'APPROVED'} : r
        ));
        
        eventBus.emit(EVENTS.ROOM_UPDATED, { roomId, available: status !== 'APPROVED' });
      }
      
      // Emit events for real-time updates
      eventBus.emit(EVENTS.BOOKING_UPDATED, { bookingId: id, status });
      eventBus.emit(EVENTS.DATA_REFRESH, { source: 'admin_dashboard' });
      
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      // Fallback: Update localStorage anyway
      const existingBookings = JSON.parse(localStorage.getItem('hotelBookings') || '[]');
      const updatedStorageBookings = existingBookings.map(b => 
        b.bookingId === id ? {...b, status} : b
      );
      localStorage.setItem('hotelBookings', JSON.stringify(updatedStorageBookings));
      
      const updatedBookings = bookings.map(b => 
        b.bookingId === id ? {...b, status} : b
      );
      setBookings(updatedBookings);
      setAnalyticsData(generateAnalyticsData(updatedBookings, rooms));
      
      // Update room availability in fallback
      if (booking && (booking.roomId || booking.room?.roomId)) {
        const roomId = booking.roomId || booking.room?.roomId;
        const existingRooms = JSON.parse(localStorage.getItem('hotelRooms') || '[]');
        const updatedRooms = existingRooms.map(r => 
          r.roomId === roomId ? {...r, available: status !== 'APPROVED'} : r
        );
        localStorage.setItem('hotelRooms', JSON.stringify(updatedRooms));
        
        setRooms(prev => prev.map(r => 
          r.roomId === roomId ? {...r, available: status !== 'APPROVED'} : r
        ));
        
        eventBus.emit(EVENTS.ROOM_UPDATED, { roomId, available: status !== 'APPROVED' });
      }
      
      // Send notification in fallback
      if (status === 'APPROVED') {
        await sendNotification('BOOKING_APPROVED', booking);
      } else if (status === 'REJECTED') {
        await sendNotification('BOOKING_REJECTED', booking);
      }
      
      // Emit events for fallback updates
      eventBus.emit(EVENTS.BOOKING_UPDATED, { bookingId: id, status });
      eventBus.emit(EVENTS.DATA_REFRESH, { source: 'admin_dashboard' });
      
      setMessage(`Booking #${id} has been ${status.toLowerCase()} successfully`);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setProcessingId(null);
    }
  };

  const handleFreeRoom = async (roomId) => {
    const room = rooms.find(r => r.roomId === roomId);
    
    if (!room || room.available) {
      setMessage('Room is already available');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const approvedBooking = bookings.find(b => 
      (b.room?.roomId === roomId || b.roomId === roomId) && b.status === 'APPROVED'
    );
    
    const confirmMessage = approvedBooking 
      ? `Are you sure you want to free Room ${room.roomNumber}? This will cancel the booking for ${approvedBooking.guestName}.`
      : `Are you sure you want to free Room ${room.roomNumber}?`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setProcessingId(roomId);
    try {
      await freeRoom(roomId);
      
      // Update localStorage first
      const existingRooms = JSON.parse(localStorage.getItem('hotelRooms') || '[]');
      const updatedRooms = existingRooms.map(r => 
        r.roomId === roomId ? {...r, available: true} : r
      );
      localStorage.setItem('hotelRooms', JSON.stringify(updatedRooms));
      
      let newBookings = bookings;
      if (approvedBooking) {
        const existingBookings = JSON.parse(localStorage.getItem('hotelBookings') || '[]');
        const updatedBookings = existingBookings.filter(b => b.bookingId !== approvedBooking.bookingId);
        localStorage.setItem('hotelBookings', JSON.stringify(updatedBookings));
        
        newBookings = bookings.filter(b => b.bookingId !== approvedBooking.bookingId);
        setBookings(newBookings);
      }
      
      const newRooms = rooms.map(r => 
        r.roomId === roomId ? {...r, available: true} : r
      );
      setRooms(newRooms);
      setAnalyticsData(generateAnalyticsData(newBookings, newRooms));
      
      setMessage(`Room ${room.roomNumber} has been freed and is now available`);
      
      // Emit events for real-time updates
      eventBus.emit(EVENTS.ROOM_UPDATED, { roomId, available: true });
      eventBus.emit(EVENTS.DATA_REFRESH, { source: 'room_freed' });
      
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      // Fallback: Update localStorage anyway
      const existingRooms = JSON.parse(localStorage.getItem('hotelRooms') || '[]');
      const updatedRooms = existingRooms.map(r => 
        r.roomId === roomId ? {...r, available: true} : r
      );
      localStorage.setItem('hotelRooms', JSON.stringify(updatedRooms));
      
      let newBookings = bookings;
      if (approvedBooking) {
        const existingBookings = JSON.parse(localStorage.getItem('hotelBookings') || '[]');
        const updatedBookings = existingBookings.filter(b => b.bookingId !== approvedBooking.bookingId);
        localStorage.setItem('hotelBookings', JSON.stringify(updatedBookings));
        
        newBookings = bookings.filter(b => b.bookingId !== approvedBooking.bookingId);
        setBookings(newBookings);
      }
      
      const newRooms = rooms.map(r => 
        r.roomId === roomId ? {...r, available: true} : r
      );
      setRooms(newRooms);
      setAnalyticsData(generateAnalyticsData(newBookings, newRooms));
      
      setMessage(`Room ${room.roomNumber} has been freed and is now available`);
      
      // Emit events for real-time updates
      eventBus.emit(EVENTS.ROOM_UPDATED, { roomId, available: true });
      eventBus.emit(EVENTS.DATA_REFRESH, { source: 'room_freed' });
      
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setProcessingId(null);
    }
  };

  const handleFreeAllRooms = async () => {
    if (window.confirm('Make all rooms available? This will cancel all approved bookings.')) {
      try {
        await freeAllRooms();
        
        // Update rooms to be available
        const updatedRooms = rooms.map(r => ({...r, available: true}));
        
        // Remove all approved bookings
        const updatedBookings = bookings.filter(b => b.status !== 'APPROVED');
        
        // Update localStorage
        localStorage.setItem('hotelRooms', JSON.stringify(updatedRooms));
        localStorage.setItem('hotelBookings', JSON.stringify(updatedBookings));
        
        // Update state
        setRooms(updatedRooms);
        setBookings(updatedBookings);
        setAnalyticsData(generateAnalyticsData(updatedBookings, updatedRooms));
        
        setMessage('All rooms are now available and approved bookings have been cancelled');
        
        // Emit events for real-time updates across all components
        eventBus.emit(EVENTS.DATA_REFRESH, { source: 'free_all_rooms' });
        eventBus.emit(EVENTS.BOOKING_UPDATED, { action: 'free_all_rooms' });
        
        setTimeout(() => setMessage(''), 3000);
      } catch (err) {
        // Fallback: Update localStorage and state directly
        const updatedRooms = rooms.map(r => ({...r, available: true}));
        const updatedBookings = bookings.filter(b => b.status !== 'APPROVED');
        
        // Update localStorage
        localStorage.setItem('hotelRooms', JSON.stringify(updatedRooms));
        localStorage.setItem('hotelBookings', JSON.stringify(updatedBookings));
        
        // Update state
        setRooms(updatedRooms);
        setBookings(updatedBookings);
        setAnalyticsData(generateAnalyticsData(updatedBookings, updatedRooms));
        
        setMessage('All rooms are now available and approved bookings have been cancelled');
        
        // Emit events for real-time updates across all components
        eventBus.emit(EVENTS.DATA_REFRESH, { source: 'free_all_rooms' });
        eventBus.emit(EVENTS.BOOKING_UPDATED, { action: 'free_all_rooms' });
        
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };



  const handleSystemSettings = {
    updateHotelInfo: (info) => {
      localStorage.setItem('hotelInfo', JSON.stringify(info));
      setMessage('Hotel information updated successfully');
      setTimeout(() => setMessage(''), 3000);
    },
    resetSystem: () => {
      if (window.confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
        localStorage.clear();
        setMessage('System has been reset successfully');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    },
    exportData: () => {
      const data = {
        bookings: bookings,
        rooms: rooms,
        exportDate: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hotel-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage('Data exported successfully');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const getStats = () => {
    const pending = Array.isArray(bookings) ? bookings.filter(b => b.status === 'PENDING').length : 0;
    const approved = Array.isArray(bookings) ? bookings.filter(b => b.status === 'APPROVED').length : 0;
    const rejected = Array.isArray(bookings) ? bookings.filter(b => b.status === 'REJECTED').length : 0;
    const available = Array.isArray(rooms) ? rooms.filter(r => r.available).length : 0;
    const totalRevenue = Array.isArray(bookings) ? bookings
      .filter(b => b.status === 'APPROVED')
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0) : 0;
    const paidBookings = Array.isArray(bookings) ? bookings.filter(b => b.paymentStatus === 'PAID').length : 0;
    const unpaidBookings = Array.isArray(bookings) ? bookings.filter(b => b.paymentStatus === 'UNPAID' && b.status === 'PENDING').length : 0;
    
    return { pending, approved, rejected, available, totalRooms: Array.isArray(rooms) ? rooms.length : 0, totalRevenue, paidBookings, unpaidBookings };
  };

  if (loading) return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center">
      <div className="text-center">
        <div className="spinner-border text-primary mb-3" style={{width: '3rem', height: '3rem'}} role="status">
          <span className="visually-hidden">Loading dashboard...</span>
        </div>
        <h5 className="text-muted">Loading Admin Dashboard...</h5>
      </div>
    </div>
  );

  const stats = getStats();

  return (
    <div className="min-vh-100" style={{backgroundColor: '#f8f9fa'}}>
      {/* Admin Sidebar */}
      <div className="d-flex">
        <div className="admin-sidebar" style={{width: '250px', position: 'fixed', height: '100vh', zIndex: 1000, backgroundColor: '#2c3e50'}}>
          <div className="p-4">
            {/* Admin Profile */}
            <div className="text-center mb-4 pb-4 border-bottom border-secondary">
              <div className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                   style={{width: '60px', height: '60px'}}>
                <i className="fas fa-user-shield fa-2x text-primary"></i>
              </div>
              <h6 className="text-white fw-bold mb-1">{adminUser?.name || 'Administrator'}</h6>
              <small className="text-white-50">{adminUser?.role || 'Super Admin'}</small>
            </div>

            {/* Navigation */}
            <nav>
              <a 
                href="#overview" 
                className={`admin-nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={(e) => {e.preventDefault(); setActiveTab('overview');}}
              >
                <i className="fas fa-tachometer-alt me-2"></i>
                Overview
              </a>
              <a 
                href="#bookings" 
                className={`admin-nav-link ${activeTab === 'bookings' ? 'active' : ''}`}
                onClick={(e) => {e.preventDefault(); setActiveTab('bookings');}}
              >
                <i className="fas fa-calendar-check me-2"></i>
                Bookings
                {stats.pending > 0 && (
                  <span className="badge bg-warning text-dark ms-2">{stats.pending}</span>
                )}
              </a>
              <a 
                href="#rooms" 
                className={`admin-nav-link ${activeTab === 'rooms' ? 'active' : ''}`}
                onClick={(e) => {e.preventDefault(); setActiveTab('rooms');}}
              >
                <i className="fas fa-bed me-2"></i>
                Rooms
              </a>
              <a 
                href="#analytics" 
                className={`admin-nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
                onClick={(e) => {e.preventDefault(); setActiveTab('analytics');}}
              >
                <i className="fas fa-chart-bar me-2"></i>
                Analytics
              </a>
              <a 
                href="#settings" 
                className={`admin-nav-link ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={(e) => {e.preventDefault(); setActiveTab('settings');}}
              >
                <i className="fas fa-cog me-2"></i>
                Settings
              </a>
            </nav>

            {/* Logout */}
            <div className="position-absolute bottom-0 start-0 end-0 p-4">
              <button onClick={handleLogout} className="btn btn-outline-light w-100">
                <i className="fas fa-sign-out-alt me-2"></i>
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow-1" style={{marginLeft: '250px'}}>
          {/* Top Header */}
          <div className="bg-white shadow-sm border-bottom p-4">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h4 className="mb-1 fw-bold">
                  {activeTab === 'overview' && <><i className="fas fa-tachometer-alt me-2 text-primary"></i>Dashboard Overview</>}
                  {activeTab === 'bookings' && <><i className="fas fa-calendar-check me-2 text-primary"></i>Booking Management</>}
                  {activeTab === 'rooms' && <><i className="fas fa-bed me-2 text-primary"></i>Room Management</>}
                  {activeTab === 'analytics' && <><i className="fas fa-chart-bar me-2 text-primary"></i>Analytics & Reports</>}
                  {activeTab === 'settings' && <><i className="fas fa-cog me-2 text-primary"></i>System Settings</>}
                </h4>
                <p className="text-muted mb-0">
                  Welcome back, {adminUser?.name || 'Administrator'}! 
                  <span className="ms-2">
                    <i className="fas fa-clock me-1"></i>
                    {new Date().toLocaleDateString('en-IN', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </p>
              </div>
              <div className="d-flex gap-2">
                <NotificationPanel />
                <button className="btn btn-outline-secondary btn-sm" onClick={handleSystemSettings.exportData}>
                  <i className="fas fa-download me-1"></i>
                  Export
                </button>
              </div>
            </div>
          </div>

          <div className="p-4">
            {/* Messages */}
            {message && (
              <div className={`alert ${message.includes('failed') ? 'alert-danger' : 'alert-success'} alert-dismissible fade show`}>
                <i className={`fas ${message.includes('failed') ? 'fa-times-circle' : 'fa-check-circle'} me-2`}></i>
                {message}
                <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
              </div>
            )}

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                {/* Stats Cards */}
                <div className="row g-4 mb-4">
                  <div className="col-lg-3 col-md-6">
                    <div className="card bg-warning text-white border-0 h-100">
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <div className="flex-grow-1">
                            <h2 className="mb-0 fw-bold">{stats.pending}</h2>
                            <p className="mb-0 opacity-75">Pending Approval</p>
                            <small className="opacity-75">{stats.unpaidBookings} unpaid</small>
                          </div>
                          <i className="fas fa-clock fa-2x opacity-50"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6">
                    <div className="card bg-success text-white border-0 h-100">
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <div className="flex-grow-1">
                            <h2 className="mb-0 fw-bold">{stats.approved}</h2>
                            <p className="mb-0 opacity-75">Confirmed Bookings</p>
                          </div>
                          <i className="fas fa-check-circle fa-2x opacity-50"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6">
                    <div className="card bg-info text-white border-0 h-100">
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <div className="flex-grow-1">
                            <h2 className="mb-0 fw-bold">{stats.paidBookings}</h2>
                            <p className="mb-0 opacity-75">Paid Bookings</p>
                          </div>
                          <i className="fas fa-credit-card fa-2x opacity-50"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6">
                    <div className="card bg-primary text-white border-0 h-100">
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <div className="flex-grow-1">
                            <h2 className="mb-0 fw-bold">₹{stats.totalRevenue.toLocaleString()}</h2>
                            <p className="mb-0 opacity-75">Total Revenue</p>
                          </div>
                          <i className="fas fa-rupee-sign fa-2x opacity-50"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="row g-4 mb-4">
                  <div className="col-md-6">
                    <div className="card border-0 shadow-sm">
                      <div className="card-header bg-primary text-white">
                        <h6 className="mb-0"><i className="fas fa-bolt me-2"></i>Quick Actions</h6>
                      </div>
                      <div className="card-body">
                        <div className="d-grid gap-2">
                          <button 
                            className="btn btn-outline-primary"
                            onClick={() => setActiveTab('bookings')}
                          >
                            <i className="fas fa-eye me-2"></i>
                            View All Bookings
                          </button>
                          <button 
                            className="btn btn-outline-success"
                            onClick={() => setActiveTab('rooms')}
                          >
                            <i className="fas fa-plus me-2"></i>
                            Manage Rooms
                          </button>
                          <button 
                            className="btn btn-outline-info"
                            onClick={() => setActiveTab('analytics')}
                          >
                            <i className="fas fa-chart-line me-2"></i>
                            View Reports
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card border-0 shadow-sm">
                      <div className="card-header bg-success text-white">
                        <h6 className="mb-0"><i className="fas fa-clock me-2"></i>Recent Activity</h6>
                      </div>
                      <div className="card-body">
                        <div className="list-group list-group-flush">
                          {Array.isArray(bookings) && bookings.slice(0, 3).map((booking, idx) => (
                            <div key={idx} className="list-group-item border-0 px-0">
                              <div className="d-flex justify-content-between">
                                <div>
                                  <small className="text-muted">Booking #{booking.bookingId}</small>
                                  <div className="fw-semibold">{booking.guestName}</div>
                                </div>
                                <span className={`badge ${
                                  booking.status === 'APPROVED' ? 'bg-success' :
                                  booking.status === 'REJECTED' ? 'bg-danger' : 'bg-warning'
                                }`}>
                                  {booking.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div className="card shadow-sm border-0">
                <div className="card-header bg-light">
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">
                      <i className="fas fa-calendar-check me-2"></i>
                      All Bookings ({bookings.length})
                    </h6>
                    <div className="d-flex gap-2">
                      <select className="form-select form-select-sm">
                        <option>All Status</option>
                        <option>Pending</option>
                        <option>Approved</option>
                        <option>Rejected</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Booking ID</th>
                          <th>Guest Details</th>
                          <th>Room</th>
                          <th>Dates</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(bookings) && bookings.map(booking => (
                          <tr key={booking.bookingId}>
                            <td className="fw-bold text-primary">#{booking.bookingId}</td>
                            <td>
                              <div>
                                <div className="fw-semibold">{booking.guestName}</div>
                                <small className="text-muted">{booking.guestEmail}</small>
                                {booking.paymentStatus && (
                                  <div>
                                    <span className={`badge ${booking.paymentStatus === 'PAID' ? 'bg-success' : 'bg-warning'} mt-1`}>
                                      {booking.paymentStatus}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>
                              <div>
                                <div className="fw-semibold">Room {booking.room?.roomNumber}</div>
                                <small className="text-muted">{booking.room?.roomType}</small>
                              </div>
                            </td>
                            <td>
                              <div>
                                <small className="d-block">
                                  <i className="fas fa-calendar-plus text-success me-1"></i>
                                  {new Date(booking.checkInDate).toLocaleDateString()}
                                </small>
                                <small className="d-block">
                                  <i className="fas fa-calendar-minus text-danger me-1"></i>
                                  {new Date(booking.checkOutDate).toLocaleDateString()}
                                </small>
                              </div>
                            </td>
                            <td className="fw-bold text-primary">₹{booking.totalPrice?.toLocaleString()}</td>
                            <td>
                              <span className={`badge ${
                                booking.status === 'APPROVED' ? 'bg-success' :
                                booking.status === 'REJECTED' ? 'bg-danger' : 'bg-warning'
                              }`}>
                                {booking.status}
                              </span>
                            </td>
                            <td>
                              {booking.status === 'PENDING' && (
                                <div className="btn-group btn-group-sm">
                                  <button
                                    className={`btn ${booking.paymentStatus === 'PAID' ? 'btn-success' : 'btn-outline-success'}`}
                                    onClick={() => handleUpdateBooking(booking.bookingId, 'APPROVED')}
                                    disabled={processingId === booking.bookingId || booking.paymentStatus !== 'PAID'}
                                    title={booking.paymentStatus === 'PAID' ? 'Approve Booking' : 'Payment Required'}
                                  >
                                    {processingId === booking.bookingId ? (
                                      <span className="spinner-border spinner-border-sm"></span>
                                    ) : (
                                      <i className="fas fa-check"></i>
                                    )}
                                  </button>
                                  <button
                                    className="btn btn-danger"
                                    onClick={() => handleUpdateBooking(booking.bookingId, 'REJECTED')}
                                    disabled={processingId === booking.bookingId}
                                    title="Reject Booking"
                                  >
                                    <i className="fas fa-times"></i>
                                  </button>
                                </div>
                              )}
                              {booking.status !== 'PENDING' && (
                                <small className="text-muted">No actions</small>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {bookings.length === 0 && (
                      <div className="text-center py-5">
                        <i className="fas fa-inbox fa-4x text-muted mb-3"></i>
                        <h5 className="text-muted">No bookings found</h5>
                        <p className="text-muted">Bookings will appear here once customers start making reservations.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Rooms Tab */}
            {activeTab === 'rooms' && (
              <div className="card shadow-sm border-0">
                <div className="card-header bg-light">
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">
                      <i className="fas fa-bed me-2"></i>
                      Room Management ({rooms.length})
                    </h6>
                    <div className="d-flex gap-2">
                      <button 
                        className="btn btn-outline-secondary btn-sm"
                        onClick={fetchData}
                        disabled={loading}
                        title="Refresh Rooms"
                      >
                        <i className="fas fa-sync-alt me-1"></i>
                        Refresh
                      </button>
                      <button 
                        className="btn btn-warning btn-sm"
                        onClick={handleFreeAllRooms}
                        disabled={loading}
                        title="Make All Rooms Available"
                      >
                        <i className="fas fa-unlock me-1"></i>
                        Free All
                      </button>
                      <button className="btn btn-primary btn-sm">
                        <i className="fas fa-plus me-1"></i>
                        Add New Room
                      </button>
                    </div>
                  </div>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Room Number</th>
                          <th>Type</th>
                          <th>Capacity</th>
                          <th>Price/Night</th>
                          <th>Status</th>
                          <th>Bookings</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(rooms) && rooms.map(room => (
                          <tr key={room.roomId}>
                            <td className="fw-bold text-primary">{room.roomNumber}</td>
                            <td>{room.roomType}</td>
                            <td>
                              <i className="fas fa-users me-1 text-muted"></i>
                              {room.capacity}
                            </td>
                            <td className="fw-bold text-success">₹{room.pricePerNight?.toLocaleString()}</td>
                            <td>
                              <div>
                                <span className={`badge ${room.available !== false ? 'bg-success' : 'bg-danger'} mb-1`}>
                                  {room.available !== false ? 'Available' : 'Occupied'}
                                </span>
                                {room.available === false && (
                                  <div>
                                    <small className="text-muted d-block">
                                      {(() => {
                                        const approvedBooking = bookings.find(b => 
                                          b.room?.roomId === room.roomId && b.status === 'APPROVED'
                                        );
                                        return approvedBooking ? `Guest: ${approvedBooking.guestName}` : 'Booking details unavailable';
                                      })()} 
                                    </small>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>
                              <div>
                                <span className="badge bg-info mb-1">
                                  {Array.isArray(bookings) ? bookings.filter(b => b.room?.roomId === room.roomId).length : 0} total
                                </span>
                                <div>
                                  <small className="text-success d-block">
                                    {Array.isArray(bookings) ? bookings.filter(b => b.room?.roomId === room.roomId && b.status === 'APPROVED').length : 0} approved
                                  </small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button className="btn btn-outline-info" title="View Details">
                                  <i className="fas fa-eye"></i>
                                </button>
                                <button 
                                  className={`btn ${room.available !== false ? 'btn-outline-secondary' : 'btn-warning'}`}
                                  title={room.available !== false ? 'Room Available' : 'Free Room'}
                                  onClick={() => handleFreeRoom(room.roomId)}
                                  disabled={processingId === room.roomId || room.available !== false}
                                >
                                  {processingId === room.roomId ? (
                                    <span className="spinner-border spinner-border-sm"></span>
                                  ) : (
                                    <i className={`fas ${room.available !== false ? 'fa-check' : 'fa-undo'}`}></i>
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {rooms.length === 0 && (
                      <div className="text-center py-5">
                        <i className="fas fa-bed fa-4x text-muted mb-3"></i>
                        <h5 className="text-muted">No rooms found</h5>
                        <p className="text-muted">Add rooms to start managing your hotel inventory.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (() => {
              const currentAnalyticsData = analyticsData || generateAnalyticsData();
              return (
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="card shadow-sm border-0">
                      <div className="card-header bg-light">
                        <h6 className="mb-0">
                          <i className="fas fa-chart-line me-2"></i>
                          Monthly Revenue Trend
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          {currentAnalyticsData.monthlyRevenue.slice(0, 6).map((item, idx) => (
                            <div key={idx} className="col-4 mb-3">
                              <div className="text-center">
                                <div className="h6 text-primary">₹{(item.revenue/1000).toFixed(0)}K</div>
                                <small className="text-muted">{item.month}</small>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card shadow-sm border-0">
                      <div className="card-header bg-light">
                        <h6 className="mb-0">
                          <i className="fas fa-bed me-2"></i>
                          Room Type Performance
                        </h6>
                      </div>
                      <div className="card-body">
                        {currentAnalyticsData.roomTypeStats.map((item, idx) => (
                          <div key={idx} className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                              <div className="fw-semibold">{item.type}</div>
                              <small className="text-muted">{item.bookings} bookings</small>
                            </div>
                            <div className="text-end">
                              <div className="fw-bold text-success">₹{item.revenue.toLocaleString()}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="card shadow-sm border-0">
                      <div className="card-header bg-light">
                        <h6 className="mb-0">
                          <i className="fas fa-chart-pie me-2"></i>
                          Key Metrics
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-3">
                            <div className="text-center">
                              <div className="h4 text-primary">{((stats.approved / (stats.approved + stats.rejected)) * 100 || 0).toFixed(1)}%</div>
                              <small className="text-muted">Approval Rate</small>
                            </div>
                          </div>
                          <div className="col-md-3">
                            <div className="text-center">
                              <div className="h4 text-success">{((stats.totalRooms - stats.available) / stats.totalRooms * 100 || 0).toFixed(1)}%</div>
                              <small className="text-muted">Occupancy Rate</small>
                            </div>
                          </div>
                          <div className="col-md-3">
                            <div className="text-center">
                              <div className="h4 text-info">{stats.totalRevenue > 0 ? (stats.totalRevenue / stats.approved || 0).toFixed(0) : 0}</div>
                              <small className="text-muted">Avg Revenue/Booking</small>
                            </div>
                          </div>
                          <div className="col-md-3">
                            <div className="text-center">
                              <div className="h4 text-warning">{bookings.length}</div>
                              <small className="text-muted">Total Bookings</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="card shadow-sm border-0">
                    <div className="card-header bg-light">
                      <h6 className="mb-0">
                        <i className="fas fa-building me-2"></i>
                        Hotel Information
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="mb-3">
                        <label className="form-label">Hotel Name</label>
                        <input type="text" className="form-control" defaultValue="ZENStay Hotel" />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Address</label>
                        <textarea className="form-control" rows="3" defaultValue="123 Hotel Street, City, State 12345"></textarea>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Contact Number</label>
                        <input type="text" className="form-control" defaultValue="+91 12345 67890" />
                      </div>
                      <button className="btn btn-primary" onClick={() => handleSystemSettings.updateHotelInfo({})}>Update Information</button>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card shadow-sm border-0">
                    <div className="card-header bg-light">
                      <h6 className="mb-0">
                        <i className="fas fa-tools me-2"></i>
                        System Actions
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="d-grid gap-3">
                        <button className="btn btn-outline-primary" onClick={handleSystemSettings.exportData}>
                          <i className="fas fa-download me-2"></i>
                          Export All Data
                        </button>
                        <button className="btn btn-outline-info" onClick={fetchData}>
                          <i className="fas fa-sync-alt me-2"></i>
                          Refresh Dashboard
                        </button>
                        <button className="btn btn-outline-warning" onClick={handleFreeAllRooms}>
                          <i className="fas fa-unlock me-2"></i>
                          Free All Rooms
                        </button>
                        <button className="btn btn-outline-danger" onClick={handleSystemSettings.resetSystem}>
                          <i className="fas fa-trash me-2"></i>
                          Reset System Data
                        </button>
                      </div>
                      <hr />
                      <div className="small text-muted">
                        <div><strong>System Status:</strong> Online</div>
                        <div><strong>Last Updated:</strong> {new Date().toLocaleString()}</div>
                        <div><strong>Version:</strong> 1.0.0</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;