import React, { useEffect, useState } from 'react';
import { getBookings } from '../utils/api';

function BookingList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchBookings() {
      try {
        const res = await getBookings();
        setBookings(res.data);
      } catch {
        setError('Could not load bookings');
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-warning text-dark';
      case 'APPROVED': return 'bg-success';
      case 'REJECTED': return 'bg-danger';
      default: return 'bg-warning text-dark';
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'PENDING': return { background: '#facc15' };
      case 'APPROVED': return { background: '#22c55e' };
      case 'REJECTED': return { background: '#ef4444' };
      default: return { background: '#facc15' };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return 'fas fa-clock';
      case 'APPROVED': return 'fas fa-check-circle';
      case 'REJECTED': return 'fas fa-times-circle';
      default: return 'fas fa-clock';
    }
  };

  if (loading) return (
    <div className="container py-5 text-center">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading bookings...</span>
      </div>
      <p className="mt-3 text-muted">Loading your bookings...</p>
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
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h2 className="mb-1">
                <i className="fas fa-calendar-check me-2 text-primary"></i>
                My Bookings
              </h2>
              <p className="text-muted mb-0">Manage and track your hotel reservations</p>
            </div>
            <div className="text-end">
              <span className="badge bg-primary fs-6">{bookings.length} Bookings</span>
            </div>
          </div>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-5">
          <i className="fas fa-calendar-times fa-4x text-muted mb-4"></i>
          <h4 className="text-muted mb-3">No Bookings Found</h4>
          <p className="text-muted mb-4">You haven't made any bookings yet. Start exploring our amazing hotels!</p>
          <a href="/" className="btn btn-primary">
            <i className="fas fa-search me-2"></i>
            Browse Hotels
          </a>
        </div>
      ) : (
        <div className="row">
          {bookings.map(booking => (
            <div key={booking.bookingId} className="col-lg-6 col-xl-4 mb-4">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body">
                  {/* Status Badge */}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <span className={`badge ${getStatusBadge(booking.status)} px-3 py-2`} style={getStatusStyle(booking.status)}>
                      <i className={`${getStatusIcon(booking.status)} me-1`}></i>
                      {booking.status ? (booking.status.charAt(0) + booking.status.slice(1).toLowerCase()) : 'Pending'}
                    </span>
                    <small className="text-muted">
                      ID: #{booking.bookingId}
                    </small>
                  </div>

                  {/* Guest Info */}
                  <div className="mb-3">
                    <h5 className="card-title mb-2 fw-bold">
                      <i className="fas fa-user me-2 text-primary"></i>
                      {booking.guestName}
                    </h5>
                    <p className="text-muted small mb-0">
                      <i className="fas fa-envelope me-1"></i>
                      {booking.guestEmail || 'guest@example.com'}
                    </p>
                  </div>

                  {/* Room Details */}
                  <div className="mb-3">
                    <div className="row g-2">
                      <div className="col-6">
                        <div className="d-flex align-items-center">
                          <i className="fas fa-door-open text-muted me-2"></i>
                          <div>
                            <small className="text-muted d-block">Room</small>
                            <span className="fw-semibold">{booking.room?.roomNumber || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="d-flex align-items-center">
                          <i className="fas fa-bed text-muted me-2"></i>
                          <div>
                            <small className="text-muted d-block">Type</small>
                            <span className="fw-semibold">{booking.room?.roomType || 'Deluxe'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="mb-3">
                    <div className="row g-2">
                      <div className="col-6">
                        <div className="d-flex align-items-center">
                          <i className="fas fa-calendar-plus text-success me-2"></i>
                          <div>
                            <small className="text-muted d-block">Check-in</small>
                            <span className="fw-semibold small">
                              {booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString() : 'TBD'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="d-flex align-items-center">
                          <i className="fas fa-calendar-minus text-danger me-2"></i>
                          <div>
                            <small className="text-muted d-block">Check-out</small>
                            <span className="fw-semibold small">
                              {booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString() : 'TBD'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="border-top pt-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted">Total Amount</span>
                      <span className="h5 mb-0 text-primary fw-bold">
                        ₹{booking.totalPrice?.toLocaleString() || '0'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="card-footer bg-light border-0">
                  <div className="d-flex gap-2">
                    <button className="btn btn-outline-primary btn-sm flex-fill">
                      <i className="fas fa-eye me-1"></i>
                      View Details
                    </button>
                    {booking.status === 'APPROVED' && (
                      <button className="btn btn-outline-success btn-sm flex-fill">
                        <i className="fas fa-download me-1"></i>
                        Download
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BookingList;
