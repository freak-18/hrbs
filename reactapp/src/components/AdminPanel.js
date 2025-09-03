import React, { useEffect, useState } from 'react';
import { getBookings, updateBookingStatus } from '../utils/api';
import { eventBus, EVENTS } from '../utils/eventBus';

function AdminPanel() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const fetchData = async () => {
    try {
      const res = await getBookings();
      const apiBookings = res.data || [];
      
      // Merge with localStorage bookings - Admin sees ALL bookings
      const localBookings = JSON.parse(localStorage.getItem('hotelBookings') || '[]');
      const mergedBookings = [...apiBookings];
      
      localBookings.forEach(localBooking => {
        const exists = apiBookings.some(apiBooking => 
          apiBooking.bookingId === localBooking.bookingId
        );
        if (!exists) {
          mergedBookings.push(localBooking);
        }
      });
      
      setBookings(mergedBookings.filter(b => b.status?.toUpperCase() === 'PENDING'));
      setError(null);
    } catch {
      setError('Error loading bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Listen for new bookings from main website
    const handleNewBooking = () => {
      fetchData();
    };
    
    const handleBookingUpdate = (data) => {
      if (data.status === 'CANCELLED') {
        // Remove cancelled booking from state
        setBookings(prev => prev.filter(b => b.bookingId !== data.bookingId));
      }
    };
    
    const handleDataRefresh = () => {
      fetchData();
    };
    
    eventBus.on(EVENTS.BOOKING_CREATED, handleNewBooking);
    eventBus.on(EVENTS.BOOKING_UPDATED, handleBookingUpdate);
    eventBus.on(EVENTS.DATA_REFRESH, handleDataRefresh);
    
    return () => {
      eventBus.off(EVENTS.BOOKING_CREATED, handleNewBooking);
      eventBus.off(EVENTS.BOOKING_UPDATED, handleBookingUpdate);
      eventBus.off(EVENTS.DATA_REFRESH, handleDataRefresh);
    };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setLoading(true);
        async function refreshData() {
          try {
            const res = await getBookings();
            setBookings(res.data.filter(b => b.status?.toUpperCase() === 'PENDING'));
            setError(null);
          } catch {
            setError('Error loading bookings');
          } finally {
            setLoading(false);
          }
        }
        refreshData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const handleUpdate = async (id, status) => {
    setProcessingId(id);
    try {
      await updateBookingStatus(id, status);
      setMessage(`Booking ${id} has been ${status.toLowerCase()}`);
      
      // Update local state
      setBookings(prev => prev.filter(b => b.bookingId !== id));
      
      // Update localStorage to persist changes
      const existingBookings = JSON.parse(localStorage.getItem('hotelBookings') || '[]');
      const updatedBookings = existingBookings.map(booking => 
        booking.bookingId === id ? { ...booking, status } : booking
      );
      localStorage.setItem('hotelBookings', JSON.stringify(updatedBookings));
      
      // Update room availability if approved
      if (status === 'APPROVED') {
        const booking = existingBookings.find(b => b.bookingId === id);
        if (booking && booking.roomId) {
          const existingRooms = JSON.parse(localStorage.getItem('hotelRooms') || '[]');
          const updatedRooms = existingRooms.map(room => 
            room.roomId === booking.roomId ? { ...room, available: false } : room
          );
          localStorage.setItem('hotelRooms', JSON.stringify(updatedRooms));
          eventBus.emit(EVENTS.ROOM_UPDATED, { roomId: booking.roomId, available: false });
        }
      }
      
      // Emit events for real-time updates
      eventBus.emit(EVENTS.BOOKING_UPDATED, { bookingId: id, status });
      eventBus.emit(EVENTS.DATA_REFRESH, { source: 'admin' });
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Update error';
      setMessage(errorMessage);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return (
    <div className="container py-5 text-center">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading bookings...</span>
      </div>
      <p className="mt-3 text-muted">Loading admin dashboard...</p>
    </div>
  );
  
  if (error) return (
    <div className="container py-5 text-center">
      <div className="alert alert-danger" role="alert">
        <i className="fas fa-exclamation-triangle me-2"></i>
        {error}
      </div>
    </div>
  );

  return (
    <div className="container py-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="card bg-primary text-white border-0">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <h2 className="mb-1">
                    <i className="fas fa-shield-alt me-2"></i>
                    Admin Dashboard
                  </h2>
                  <p className="mb-0 opacity-75">Manage hotel bookings and reservations</p>
                </div>
                <div className="col-md-4 text-md-end">
                  <div className="d-flex justify-content-md-end gap-3">
                    <div className="text-center">
                      <div className="h4 mb-0">{bookings.length}</div>
                      <small>Pending</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className="row mb-4">
          <div className="col-12">
            <div className={`alert ${message.includes('failed') ? 'alert-danger' : 'alert-success'} alert-dismissible fade show`} role="alert">
              <i className={`fas ${message.includes('failed') ? 'fa-times-circle' : 'fa-check-circle'} me-2`}></i>
              {message}
              <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
            </div>
          </div>
        </div>
      )}

      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-light">
              <h5 className="mb-0">
                <i className="fas fa-clock me-2 text-warning"></i>
                Pending Bookings ({bookings.length})
              </h5>
            </div>
            <div className="card-body p-0">
              {bookings.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-check-circle fa-4x text-success mb-4"></i>
                  <h4 className="text-muted mb-3">No pending bookings</h4>
                  <p className="text-muted">There are currently no reservations waiting for approval.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="border-0 fw-semibold">
                          <i className="fas fa-user me-1"></i> Guest Details
                        </th>
                        <th className="border-0 fw-semibold">
                          <i className="fas fa-door-open me-1"></i> Room Info
                        </th>
                        <th className="border-0 fw-semibold">
                          <i className="fas fa-calendar me-1"></i> Stay Dates
                        </th>
                        <th className="border-0 fw-semibold">
                          <i className="fas fa-rupee-sign me-1"></i> Amount
                        </th>
                        <th className="border-0 fw-semibold text-center">
                          <i className="fas fa-cogs me-1"></i> Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map(booking => (
                        <tr key={booking.bookingId}>
                          <td className="py-3">
                            <div>
                              <div className="fw-semibold">{booking.guestName}</div>
                              <small className="text-muted">
                                <i className="fas fa-envelope me-1"></i>
                                {booking.guestEmail || 'guest@example.com'}
                              </small>
                              <br />
                              <small className="text-muted">
                                ID: #{booking.bookingId}
                              </small>
                              <br />
                              <span className={`badge ${booking.status === 'PENDING' ? 'bg-warning' : 'bg-success'} mt-1`}>
                                {booking.status}
                              </span>
                            </div>
                          </td>
                          <td className="py-3">
                            <div>
                              <div className="fw-semibold">Room <span>{booking.room?.roomNumber || booking.roomNumber || 'N/A'}</span></div>
                              <small className="text-muted">{booking.room?.roomType || 'Deluxe Room'}</small>
                            </div>
                          </td>
                          <td className="py-3">
                            <div>
                              <div className="small">
                                <i className="fas fa-calendar-plus text-success me-1"></i>
                                {booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString() : 'TBD'}
                              </div>
                              <div className="small">
                                <i className="fas fa-calendar-minus text-danger me-1"></i>
                                {booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString() : 'TBD'}
                              </div>
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="fw-bold text-primary">
                              ₹{booking.totalPrice?.toLocaleString() || '0'}
                            </div>
                          </td>
                          <td className="py-3 text-center">
                            <div className="btn-group" role="group">
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleUpdate(booking.bookingId, 'APPROVED')}
                                disabled={processingId === booking.bookingId}
                                title="Approve Booking"
                              >
                                {processingId === booking.bookingId ? (
                                  <span className="spinner-border spinner-border-sm"></span>
                                ) : (
                                  <>
                                    <i className="fas fa-check"></i>
                                    <span className="visually-hidden">Approve</span>
                                  </>
                                )}
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleUpdate(booking.bookingId, 'REJECTED')}
                                disabled={processingId === booking.bookingId}
                                title="Reject Booking"
                              >
                                {processingId === booking.bookingId ? (
                                  <span className="spinner-border spinner-border-sm"></span>
                                ) : (
                                  <>
                                    <i className="fas fa-times"></i>
                                    <span className="visually-hidden">Reject</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;