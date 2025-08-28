import React, { useEffect, useState } from 'react';
import { getBookings, updateBookingStatus, getRooms } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = ({ onLogout }) => {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [adminUser, setAdminUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get admin user info
    const user = localStorage.getItem('adminUser');
    if (user) {
      setAdminUser(JSON.parse(user));
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsRes, roomsRes] = await Promise.all([
        getBookings(),
        getRooms()
      ]);
      
      setBookings(bookingsRes.data || []);
      setRooms(roomsRes.data || []);
    } catch (err) {
      setError('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUser');
    onLogout(false);
    navigate('/admin');
  };

  const handleUpdateBooking = async (id, status) => {
    setProcessingId(id);
    try {
      await updateBookingStatus(id, status);
      setMessage(`Booking #${id} has been ${status.toLowerCase()} successfully`);
      setBookings(prev => prev.map(b => 
        b.bookingId === id ? {...b, status} : b
      ));
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Update failed');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setProcessingId(null);
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
    
    return { pending, approved, rejected, available, totalRooms: Array.isArray(rooms) ? rooms.length : 0, totalRevenue };
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
        <div className="admin-sidebar" style={{width: '250px', position: 'fixed', height: '100vh', zIndex: 1000}}>
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
                <button className="btn btn-outline-primary btn-sm">
                  <i className="fas fa-bell me-1"></i>
                  Notifications
                  {stats.pending > 0 && (
                    <span className="badge bg-danger ms-1">{stats.pending}</span>
                  )}
                </button>
                <button className="btn btn-outline-secondary btn-sm">
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
                    <div className="stats-card">
                      <div className="d-flex align-items-center">
                        <div className="flex-grow-1">
                          <h2 className="mb-0 fw-bold">{stats.pending}</h2>
                          <p className="mb-0 opacity-75">Pending Bookings</p>
                        </div>
                        <i className="fas fa-clock fa-2x opacity-50"></i>
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
                            <h2 className="mb-0 fw-bold">{stats.available}</h2>
                            <p className="mb-0 opacity-75">Available Rooms</p>
                          </div>
                          <i className="fas fa-bed fa-2x opacity-50"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6">
                    <div className="card bg-warning text-white border-0 h-100">
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
                                    className="btn btn-success"
                                    onClick={() => handleUpdateBooking(booking.bookingId, 'APPROVED')}
                                    disabled={processingId === booking.bookingId}
                                    title="Approve Booking"
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
                    <button className="btn btn-primary btn-sm">
                      <i className="fas fa-plus me-1"></i>
                      Add New Room
                    </button>
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
                              <span className={`badge ${room.available ? 'bg-success' : 'bg-danger'}`}>
                                {room.available ? 'Available' : 'Occupied'}
                              </span>
                            </td>
                            <td>
                              <span className="badge bg-info">
                                {Array.isArray(bookings) ? bookings.filter(b => b.room?.roomId === room.roomId).length : 0} bookings
                              </span>
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button className="btn btn-outline-primary" title="Edit Room">
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button className="btn btn-outline-info" title="View Details">
                                  <i className="fas fa-eye"></i>
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
            {activeTab === 'analytics' && (
              <div className="row g-4">
                <div className="col-12">
                  <div className="card shadow-sm border-0">
                    <div className="card-header bg-light">
                      <h6 className="mb-0">
                        <i className="fas fa-chart-bar me-2"></i>
                        Analytics Dashboard
                      </h6>
                    </div>
                    <div className="card-body text-center py-5">
                      <i className="fas fa-chart-line fa-4x text-muted mb-3"></i>
                      <h5 className="text-muted">Analytics Coming Soon</h5>
                      <p className="text-muted">Detailed analytics and reporting features will be available here.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="row g-4">
                <div className="col-12">
                  <div className="card shadow-sm border-0">
                    <div className="card-header bg-light">
                      <h6 className="mb-0">
                        <i className="fas fa-cog me-2"></i>
                        System Settings
                      </h6>
                    </div>
                    <div className="card-body text-center py-5">
                      <i className="fas fa-cogs fa-4x text-muted mb-3"></i>
                      <h5 className="text-muted">Settings Panel</h5>
                      <p className="text-muted">System configuration and settings will be available here.</p>
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