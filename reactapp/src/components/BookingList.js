import React, { useEffect, useState } from 'react';
import { getBookings } from '../utils/api';

function BookingList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return 'fas fa-clock';
      case 'APPROVED': return 'fas fa-check-circle';
      case 'REJECTED': return 'fas fa-times-circle';
      default: return 'fas fa-clock';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter.toUpperCase();
  });

  const getBookingStats = () => {
    const pending = bookings.filter(b => b.status === 'PENDING').length;
    const approved = bookings.filter(b => b.status === 'APPROVED').length;
    const rejected = bookings.filter(b => b.status === 'REJECTED').length;
    const totalAmount = bookings
      .filter(b => b.status === 'APPROVED')
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    
    return { pending, approved, rejected, totalAmount };
  };

  if (loading) return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center">
      <div className="text-center">
        <div className="spinner-border text-primary mb-3" style={{width: '3rem', height: '3rem'}} role="status">
          <span className="visually-hidden">Loading bookings...</span>
        </div>
        <h5 className="text-muted">Loading your bookings...</h5>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="container py-5 text-center">
      <div className="alert alert-danger border-0 rounded-3" role="alert">
        <i className="fas fa-exclamation-triangle me-2"></i>
        {error}
      </div>
    </div>
  );

  const stats = getBookingStats();

  return (
    <div style={{backgroundColor: '#f8f9fa', minHeight: '100vh'}}>
      {/* Hero Section */}
      <div className="hero-section text-white py-5" style={{
        background: 'linear-gradient(135deg, #0066cc 0%, #004499 100%)',
        minHeight: '30vh',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h1 className="display-5 fw-bold mb-3">
                <i className="fas fa-calendar-check me-3"></i>
                My Bookings
              </h1>
              <p className="lead mb-4">Manage and track all your hotel reservations in one place</p>
              <div className="d-flex gap-4">
                <div className="text-center">
                  <div className="h4 fw-bold mb-0">{bookings.length}</div>
                  <small>Total Bookings</small>
                </div>
                <div className="text-center">
                  <div className="h4 fw-bold mb-0">{stats.approved}</div>
                  <small>Confirmed</small>
                </div>
                <div className="text-center">
                  <div className="h4 fw-bold mb-0">₹{stats.totalAmount.toLocaleString()}</div>
                  <small>Total Spent</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-4">
        {/* Stats Cards */}
        <div className="row g-4 mb-4">
          <div className="col-lg-3 col-md-6">
            <div className="card border-0 shadow-sm h-100" style={{background: 'linear-gradient(135deg, #facc15 0%, #eab308 100%)'}}>
              <div className="card-body text-white">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <h3 className="mb-0 fw-bold">{stats.pending}</h3>
                    <p className="mb-0 opacity-75">Pending Approval</p>
                  </div>
                  <i className="fas fa-clock fa-2x opacity-50"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6">
            <div className="card border-0 shadow-sm h-100" style={{background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'}}>
              <div className="card-body text-white">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <h3 className="mb-0 fw-bold">{stats.approved}</h3>
                    <p className="mb-0 opacity-75">Confirmed Bookings</p>
                  </div>
                  <i className="fas fa-check-circle fa-2x opacity-50"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6">
            <div className="card border-0 shadow-sm h-100" style={{background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'}}>
              <div className="card-body text-white">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <h3 className="mb-0 fw-bold">{stats.rejected}</h3>
                    <p className="mb-0 opacity-75">Cancelled</p>
                  </div>
                  <i className="fas fa-times-circle fa-2x opacity-50"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6">
            <div className="card border-0 shadow-sm h-100" style={{background: 'linear-gradient(135deg, #0066cc 0%, #004499 100%)'}}>
              <div className="card-body text-white">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <h3 className="mb-0 fw-bold">₹{stats.totalAmount.toLocaleString()}</h3>
                    <p className="mb-0 opacity-75">Total Amount</p>
                  </div>
                  <i className="fas fa-rupee-sign fa-2x opacity-50"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-0 fw-bold">
                      <i className="fas fa-filter me-2 text-primary"></i>
                      Filter Bookings
                    </h6>
                  </div>
                  <div className="d-flex gap-2">
                    <button 
                      className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
                      onClick={() => setFilter('all')}
                    >
                      All ({bookings.length})
                    </button>
                    <button 
                      className={`btn ${filter === 'pending' ? 'btn-warning' : 'btn-outline-warning'} btn-sm`}
                      onClick={() => setFilter('pending')}
                    >
                      Pending ({stats.pending})
                    </button>
                    <button 
                      className={`btn ${filter === 'approved' ? 'btn-success' : 'btn-outline-success'} btn-sm`}
                      onClick={() => setFilter('approved')}
                    >
                      Confirmed ({stats.approved})
                    </button>
                    <button 
                      className={`btn ${filter === 'rejected' ? 'btn-danger' : 'btn-outline-danger'} btn-sm`}
                      onClick={() => setFilter('rejected')}
                    >
                      Cancelled ({stats.rejected})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="text-center py-5">
            <div className="card border-0 shadow-sm">
              <div className="card-body py-5">
                <i className="fas fa-calendar-times fa-4x text-muted mb-4"></i>
                <h4 className="text-muted mb-3">
                  {filter === 'all' ? 'No Bookings Found' : `No ${filter} Bookings`}
                </h4>
                <p className="text-muted mb-4">
                  {filter === 'all' 
                    ? "You haven't made any bookings yet. Start exploring our amazing hotels!" 
                    : `You don't have any ${filter} bookings at the moment.`
                  }
                </p>
                <div className="d-flex gap-2 justify-content-center">
                  <a href="/rooms" className="btn btn-primary">
                    <i className="fas fa-search me-2"></i>
                    Browse Hotels
                  </a>
                  {filter !== 'all' && (
                    <button className="btn btn-outline-secondary" onClick={() => setFilter('all')}>
                      <i className="fas fa-list me-2"></i>
                      View All Bookings
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="row">
            {filteredBookings.map(booking => (
              <div key={booking.bookingId} className="col-lg-6 col-xl-4 mb-4">
                <div className="card h-100 shadow-sm border-0 fade-in">
                  {/* Card Header */}
                  <div className="card-header bg-light border-0">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className={`badge ${getStatusBadge(booking.status)} px-3 py-2`}>
                        <i className={`${getStatusIcon(booking.status)} me-1`}></i>
                        {booking.status ? (booking.status.charAt(0) + booking.status.slice(1).toLowerCase()) : 'Pending'}
                      </span>
                      <small className="text-muted fw-semibold">
                        Booking #{booking.bookingId}
                      </small>
                    </div>
                  </div>

                  <div className="card-body">
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

                    {/* Hotel Image */}
                    <div className="mb-3">
                      <img 
                        src={`https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=300&h=150&fit=crop&crop=center&sig=${booking.bookingId}`}
                        className="img-fluid rounded"
                        alt="Hotel Room"
                        style={{height: '120px', width: '100%', objectFit: 'cover'}}
                      />
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

                    {/* Amenities */}
                    <div className="mb-3">
                      <div className="d-flex flex-wrap gap-1">
                        <span className="amenity-badge">WiFi</span>
                        <span className="amenity-badge">AC</span>
                        <span className="amenity-badge">Breakfast</span>
                        <span className="amenity-badge">Parking</span>
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
                        <button className="btn btn-primary btn-sm flex-fill">
                          <i className="fas fa-download me-1"></i>
                          E-Ticket
                        </button>
                      )}
                      {booking.status === 'PENDING' && (
                        <button className="btn btn-outline-danger btn-sm flex-fill">
                          <i className="fas fa-times me-1"></i>
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Help Section */}
        {filteredBookings.length > 0 && (
          <div className="row mt-5">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center py-4">
                  <h5 className="fw-bold mb-3">
                    <i className="fas fa-question-circle me-2 text-primary"></i>
                    Need Help with Your Booking?
                  </h5>
                  <p className="text-muted mb-4">Our customer support team is here to assist you 24/7</p>
                  <div className="d-flex gap-2 justify-content-center">
                    <button className="btn btn-outline-primary">
                      <i className="fas fa-phone me-2"></i>
                      Call Support
                    </button>
                    <button className="btn btn-outline-info">
                      <i className="fas fa-comments me-2"></i>
                      Live Chat
                    </button>
                    <button className="btn btn-outline-secondary">
                      <i className="fas fa-envelope me-2"></i>
                      Email Us
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingList;