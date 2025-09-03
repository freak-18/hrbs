import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const [searchData, setSearchData] = useState({
    destination: '',
    checkIn: '',
    checkOut: '',
    guests: 2,
    rooms: 1
  });

  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);

  const offers = [
    { title: '50% OFF on Weekend Getaways', subtitle: 'Book now and save big!', color: '#ff6b35' },
    { title: 'Flat ₹2000 OFF on Luxury Hotels', subtitle: 'Use code: LUXURY2000', color: '#0066cc' },
    { title: 'Early Bird Special - 30% OFF', subtitle: 'Book 30 days in advance', color: '#22c55e' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentOfferIndex((prev) => (prev + 1) % offers.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [offers.length]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Navigate to room listing with search params
    window.location.href = '/rooms';
  };

  return (
    <div>
      {/* Offers Banner */}
      <div className="offers-banner py-2" style={{backgroundColor: offers[currentOfferIndex].color}}>
        <div className="container">
          <div className="text-center text-white">
            <small className="fw-bold">
              <i className="fas fa-fire me-2"></i>
              {offers[currentOfferIndex].title} - {offers[currentOfferIndex].subtitle}
            </small>
          </div>
        </div>
      </div>

      {/* Hero Section with Search */}
      <div className="hero-section position-relative" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '75vh',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="text-center text-white mb-5 fade-in-up">
                <h1 className="display-3 fw-bold mb-3">
                  <i className="fas fa-map-marker-alt me-3" style={{color: '#ff6b35'}}></i>
                  Find Your Perfect Stay
                </h1>
                <p className="lead fs-4 mb-4">Discover amazing hotels at unbeatable prices worldwide</p>
                <div className="d-flex justify-content-center gap-4 mb-4">
                  <div className="text-center">
                    <div className="h4 fw-bold mb-0">50,000+</div>
                    <small>Hotels</small>
                  </div>
                  <div className="text-center">
                    <div className="h4 fw-bold mb-0">1M+</div>
                    <small>Happy Customers</small>
                  </div>
                  <div className="text-center">
                    <div className="h4 fw-bold mb-0">200+</div>
                    <small>Cities</small>
                  </div>
                </div>
              </div>

              {/* Search Form */}
              <div className="card shadow-lg border-0 rounded-4 search-form">
                <div className="card-body p-4">
                  <div className="text-center mb-3">
                    <h5 className="fw-bold text-primary mb-0">
                      <i className="fas fa-search me-2"></i>
                      Search Hotels
                    </h5>
                  </div>
                  <form onSubmit={handleSearch}>
                    <div className="row g-4">
                      <div className="col-lg-3 col-md-6">
                        <label className="form-label fw-semibold">
                          <i className="fas fa-map-marker-alt me-2 text-primary"></i>
                          Destination
                        </label>
                        <div className="position-relative">
                          <input
                            type="text"
                            className="form-control form-control-lg search-input"
                            placeholder="Delhi, Mumbai, Goa..."
                            value={searchData.destination}
                            onChange={(e) => setSearchData({...searchData, destination: e.target.value})}
                          />
                          <i className="fas fa-search position-absolute" style={{right: '15px', top: '50%', transform: 'translateY(-50%)', color: '#999'}}></i>
                        </div>
                      </div>
                      <div className="col-lg-2 col-md-6">
                        <label className="form-label fw-semibold">
                          <i className="fas fa-calendar-plus me-2 text-success"></i>
                          Check-in
                        </label>
                        <input
                          type="date"
                          className="form-control form-control-lg"
                          value={searchData.checkIn}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setSearchData({...searchData, checkIn: e.target.value})}
                        />
                      </div>
                      <div className="col-lg-2 col-md-6">
                        <label className="form-label fw-semibold">
                          <i className="fas fa-calendar-minus me-2 text-danger"></i>
                          Check-out
                        </label>
                        <input
                          type="date"
                          className="form-control form-control-lg"
                          value={searchData.checkOut}
                          min={searchData.checkIn || new Date().toISOString().split('T')[0]}
                          onChange={(e) => setSearchData({...searchData, checkOut: e.target.value})}
                        />
                      </div>
                      <div className="col-lg-2 col-md-6">
                        <label className="form-label fw-semibold">
                          <i className="fas fa-users me-2 text-info"></i>
                          Guests & Rooms
                        </label>
                        <div className="d-flex gap-1">
                          <select 
                            className="form-select form-select-lg"
                            value={searchData.guests}
                            onChange={(e) => setSearchData({...searchData, guests: e.target.value})}
                          >
                            {[1,2,3,4,5,6].map(n => (
                              <option key={n} value={n}>{n} Guest{n>1?'s':''}</option>
                            ))}
                          </select>
                          <select 
                            className="form-select form-select-lg"
                            value={searchData.rooms}
                            onChange={(e) => setSearchData({...searchData, rooms: e.target.value})}
                          >
                            {[1,2,3,4].map(n => (
                              <option key={n} value={n}>{n} Room{n>1?'s':''}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-lg-3 col-md-12">
                        <label className="form-label fw-semibold text-white">.</label>
                        <button type="submit" className="btn btn-primary btn-lg w-100 fw-semibold">
                          <i className="fas fa-search me-2"></i>
                          Search Hotels
                        </button>
                      </div>
                    </div>
                    
                    {/* Quick Filters */}
                    <div className="row mt-3">
                      <div className="col-12">
                        <div className="d-flex flex-wrap gap-2 justify-content-center">
                          <span className="badge bg-light text-dark px-3 py-2">
                            <i className="fas fa-wifi me-1"></i> Free WiFi
                          </span>
                          <span className="badge bg-light text-dark px-3 py-2">
                            <i className="fas fa-swimming-pool me-1"></i> Pool
                          </span>
                          <span className="badge bg-light text-dark px-3 py-2">
                            <i className="fas fa-car me-1"></i> Free Parking
                          </span>
                          <span className="badge bg-light text-dark px-3 py-2">
                            <i className="fas fa-utensils me-1"></i> Restaurant
                          </span>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Special Offers Section */}
      <div className="py-5" style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'}}>
        <div className="container">
          <div className="row text-center mb-5">
            <div className="col-12">
              <h2 className="fw-bold mb-3">
                <i className="fas fa-fire me-2 text-danger"></i>
                Hot Deals & Offers
              </h2>
              <p className="text-muted">Limited time offers you can't miss!</p>
            </div>
          </div>
          <div className="row g-4">
            <div className="col-lg-4 col-md-6">
              <div className="card border-0 shadow-sm h-100" style={{background: 'linear-gradient(135deg, #ff6b35 0%, #ff4500 100%)'}}>
                <div className="card-body text-white text-center p-4">
                  <i className="fas fa-percentage fa-3x mb-3"></i>
                  <h4 className="fw-bold">Weekend Special</h4>
                  <h2 className="display-4 fw-bold">50% OFF</h2>
                  <p className="mb-3">On all weekend bookings</p>
                  <Link to="/rooms" className="btn btn-light btn-lg fw-semibold">
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="card border-0 shadow-sm h-100" style={{background: 'linear-gradient(135deg, #0066cc 0%, #004499 100%)'}}>
                <div className="card-body text-white text-center p-4">
                  <i className="fas fa-crown fa-3x mb-3"></i>
                  <h4 className="fw-bold">Luxury Hotels</h4>
                  <h2 className="display-4 fw-bold">₹2000</h2>
                  <p className="mb-3">Flat discount on luxury stays</p>
                  <Link to="/rooms" className="btn btn-light btn-lg fw-semibold">
                    Explore
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="card border-0 shadow-sm h-100" style={{background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'}}>
                <div className="card-body text-white text-center p-4">
                  <i className="fas fa-clock fa-3x mb-3"></i>
                  <h4 className="fw-bold">Early Bird</h4>
                  <h2 className="display-4 fw-bold">30% OFF</h2>
                  <p className="mb-3">Book 30 days in advance</p>
                  <Link to="/rooms" className="btn btn-light btn-lg fw-semibold">
                    Save Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-5 bg-white">
        <div className="container">
          <div className="row text-center mb-5">
            <div className="col-12">
              <h2 className="fw-bold mb-3">Why Choose ZENStay?</h2>
              <p className="text-muted">Experience the best in hospitality with our premium services</p>
            </div>
          </div>
          <div className="row g-4">
            <div className="col-lg-3 col-md-6">
              <div className="text-center fade-in">
                <div className="feature-icon bg-primary mb-3">
                  <i className="fas fa-shield-alt fa-2x text-white"></i>
                </div>
                <h5 className="fw-bold">Secure Booking</h5>
                <p className="text-muted">100% secure payment with instant confirmation</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="text-center fade-in">
                <div className="feature-icon bg-success mb-3">
                  <i className="fas fa-tags fa-2x text-white"></i>
                </div>
                <h5 className="fw-bold">Best Prices</h5>
                <p className="text-muted">Guaranteed lowest prices with exclusive deals</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="text-center fade-in">
                <div className="feature-icon bg-info mb-3">
                  <i className="fas fa-headset fa-2x text-white"></i>
                </div>
                <h5 className="fw-bold">24/7 Support</h5>
                <p className="text-muted">Round-the-clock customer support for assistance</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="text-center fade-in">
                <div className="feature-icon bg-warning mb-3">
                  <i className="fas fa-star fa-2x text-white"></i>
                </div>
                <h5 className="fw-bold">Premium Quality</h5>
                <p className="text-muted">Handpicked hotels with verified reviews</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Destinations */}
      <div className="py-5 bg-light">
        <div className="container">
          <div className="row mb-5">
            <div className="col-12 text-center">
              <h2 className="fw-bold mb-3">
                <i className="fas fa-map-marked-alt me-2 text-primary"></i>
                Popular Destinations
              </h2>
              <p className="text-muted">Explore trending destinations for your next getaway</p>
            </div>
          </div>
          <div className="row g-4">
            {[
              { name: 'Mumbai', image: 'photo-1570168007204-dfb528c6958f', hotels: '1,200+ Hotels', rating: '4.5', price: '₹3,500' },
              { name: 'Delhi', image: 'photo-1587474260584-136574528ed5', hotels: '980+ Hotels', rating: '4.3', price: '₹2,800' },
              { name: 'Bangalore', image: 'photo-1596176530529-78163a4f7af2', hotels: '750+ Hotels', rating: '4.4', price: '₹3,200' },
              { name: 'Goa', image: 'photo-1512343879784-a960bf40e7f2', hotels: '450+ Hotels', rating: '4.6', price: '₹4,200' },
              { name: 'Jaipur', image: 'photo-1477587458883-47145ed94245', hotels: '320+ Hotels', rating: '4.2', price: '₹2,500' },
              { name: 'Kerala', image: 'photo-1602216056096-3b40cc0c9944', hotels: '280+ Hotels', rating: '4.7', price: '₹3,800' }
            ].map((dest, idx) => (
              <div key={idx} className="col-lg-4 col-md-6">
                <Link to="/rooms" className="text-decoration-none">
                  <div className="card border-0 shadow-sm h-100 destination-card">
                    <div className="position-relative overflow-hidden">
                      <img 
                        src={`https://images.unsplash.com/${dest.image}?w=400&h=250&fit=crop`}
                        className="card-img-top"
                        alt={dest.name}
                        style={{height: '200px', objectFit: 'cover'}}
                      />
                      <div className="position-absolute top-0 end-0 m-3">
                        <span className="badge bg-warning text-dark">
                          <i className="fas fa-star me-1"></i>{dest.rating}
                        </span>
                      </div>
                      <div className="position-absolute bottom-0 start-0 end-0 bg-gradient-dark p-3">
                        <div className="d-flex justify-content-between align-items-end">
                          <div>
                            <h5 className="text-white mb-1 fw-bold">{dest.name}</h5>
                            <small className="text-white-50">{dest.hotels}</small>
                          </div>
                          <div className="text-end">
                            <div className="text-white fw-bold">{dest.price}</div>
                            <small className="text-white-50">avg/night</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-5 bg-white">
        <div className="container">
          <div className="row mb-5">
            <div className="col-12 text-center">
              <h2 className="fw-bold mb-3">
                <i className="fas fa-quote-left me-2 text-primary"></i>
                What Our Customers Say
              </h2>
              <p className="text-muted">Real reviews from real travelers</p>
            </div>
          </div>
          <div className="row g-4">
            {[
              { name: 'Priya Sharma', location: 'Mumbai', review: 'Amazing service and beautiful hotels. Highly recommended!', rating: 5, avatar: 'photo-1494790108755-2616b612b786' },
              { name: 'Rahul Kumar', location: 'Delhi', review: 'Best prices and excellent customer support. Will book again!', rating: 5, avatar: 'photo-1507003211169-0a1dd7228f2d' },
              { name: 'Anjali Patel', location: 'Bangalore', review: 'Seamless booking experience. The hotel was exactly as shown.', rating: 4, avatar: 'photo-1438761681033-6461ffad8d80' }
            ].map((testimonial, idx) => (
              <div key={idx} className="col-lg-4 col-md-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-4 text-center">
                    <div className="mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <i key={i} className="fas fa-star text-warning"></i>
                      ))}
                    </div>
                    <p className="text-muted mb-3">"{testimonial.review}"</p>
                    <h6 className="fw-bold mb-0">{testimonial.name}</h6>
                    <small className="text-muted">{testimonial.location}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;