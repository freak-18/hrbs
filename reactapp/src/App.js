import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useParams, useLocation } from "react-router-dom";
import HomePage from "./components/HomePage";
import AdminDashboard from "./components/AdminDashboard";
import AdminPanel from "./components/AdminPanel";
import BookingForm from "./components/BookingForm";
import BookingList from "./components/BookingList";
import RoomListing from "./components/RoomListing";
import CombinedLogin from "./components/CombinedLogin";
import ProtectedRoute from "./components/ProtectedRoute";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function BookingFormWrapper() {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoom = () => {
      // Get rooms from localStorage or use default
      const savedRooms = localStorage.getItem('hotelRooms');
      const defaultRooms = [
        { roomId: 1, roomNumber: '101', roomType: 'Deluxe Room', pricePerNight: 3500, capacity: 2, available: true, rating: 4.5 },
        { roomId: 2, roomNumber: '102', roomType: 'Premium Suite', pricePerNight: 5500, capacity: 4, available: true, rating: 4.7 },
        { roomId: 3, roomNumber: '201', roomType: 'Executive Room', pricePerNight: 4200, capacity: 3, available: true, rating: 4.3 },
        { roomId: 4, roomNumber: '202', roomType: 'Royal Suite', pricePerNight: 8500, capacity: 4, available: true, rating: 4.9 },
        { roomId: 5, roomNumber: '301', roomType: 'Business Room', pricePerNight: 4800, capacity: 2, available: true, rating: 4.4 }
      ];
      
      const rooms = savedRooms ? JSON.parse(savedRooms) : defaultRooms;
      const foundRoom = rooms.find(r => r.roomId === Number(id));
      
      if (foundRoom) {
        setRoom({
          ...foundRoom,
          price: foundRoom.pricePerNight || foundRoom.price || 1500
        });
      } else {
        // Fallback room if not found
        setRoom({
          roomId: Number(id),
          roomNumber: id,
          roomType: 'Standard Room',
          price: 1500,
          pricePerNight: 1500,
          capacity: 2,
          available: true,
          rating: 4.0
        });
      }
      setLoading(false);
    };

    fetchRoom();
  }, [id]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading room details...</span>
        </div>
      </div>
    );
  }

  return <BookingForm room={room} />;
}

function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  useEffect(() => {
    const adminStatus = localStorage.getItem('adminLoggedIn');
    const userStatus = localStorage.getItem('userLoggedIn');
    setIsAdminLoggedIn(adminStatus === 'true');
    setIsUserLoggedIn(userStatus === 'true');
  }, []);

  return (
    <Router>
      <AppContent 
        isAdminLoggedIn={isAdminLoggedIn} 
        setIsAdminLoggedIn={setIsAdminLoggedIn}
        isUserLoggedIn={isUserLoggedIn}
        setIsUserLoggedIn={setIsUserLoggedIn}
      />
    </Router>
  );
}

function AppContent({ isAdminLoggedIn, setIsAdminLoggedIn, isUserLoggedIn, setIsUserLoggedIn }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isLoginPage = location.pathname === '/login';
  const isHomePage = location.pathname === '/';

  return (
    <>
      {!isAdminRoute && !isLoginPage && (
        <nav className="navbar navbar-expand-lg" style={{backgroundColor: '#051423', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
          <div className="container">
            <Link className="navbar-brand text-white fw-bold fs-3" to="/" style={{textDecoration: 'none'}}>
              <span className="d-flex align-items-center">
                <span className="me-3 logo-icon-animated" style={{
                  position: 'relative',
                  display: 'inline-block',
                  animation: 'logoFloat 3s ease-in-out infinite'
                }}>
                  <i className="fas fa-hotel" style={{
                    color: '#ff6b35',
                    fontSize: '2rem',
                    filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
                    transition: 'all 0.3s ease'
                  }}></i>
                  <i className="fas fa-star" style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    color: '#ffd700',
                    fontSize: '0.8rem',
                    animation: 'starTwinkle 2s ease-in-out infinite'
                  }}></i>
                </span>
                <span className="logo-text-animated" style={{
                  fontFamily: 'serif',
                  fontSize: '1.8rem',
                  fontWeight: '700',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                }}>
                  <span style={{
                    color: '#ffffff',
                    display: 'inline-block',
                    animation: 'textGlow 4s ease-in-out infinite'
                  }}>ZEN</span>
                  <span style={{
                    color: '#ff6b35',
                    display: 'inline-block',
                    animation: 'textGlow 4s ease-in-out infinite 0.5s'
                  }}>Stay</span>
                </span>
              </span>
            </Link>
            
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
              <span className="navbar-toggler-icon"></span>
            </button>
            
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <Link className="nav-link text-white px-3 py-2 rounded" to="/">
                    <i className="fas fa-home me-1"></i> Home
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link text-white px-3 py-2 rounded" to="/rooms">
                    <i className="fas fa-bed me-1"></i> Rooms
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link text-white px-3 py-2 rounded" to="/bookings">
                    <i className="fas fa-calendar-check me-1"></i> My Bookings
                  </Link>
                </li>
                {isUserLoggedIn && (
                  <li className="nav-item">
                    <span className="nav-link text-white px-3 py-2">
                      <i className="fas fa-user me-1"></i>
                      Welcome, {JSON.parse(localStorage.getItem('userData') || '{}').name || 'User'}
                    </span>
                  </li>
                )}
                <li className="nav-item">
                  {isUserLoggedIn ? (
                    <button 
                      className="nav-link text-white px-3 py-2 rounded btn btn-link border-0"
                      onClick={() => {
                        localStorage.removeItem('userLoggedIn');
                        localStorage.removeItem('userData');
                        setIsUserLoggedIn(false);
                      }}
                    >
                      <i className="fas fa-sign-out-alt me-1"></i> Logout
                    </button>
                  ) : (
                    <Link className="nav-link text-white px-3 py-2 rounded" to="/login">
                      <i className="fas fa-sign-in-alt me-1"></i> Login
                    </Link>
                  )}
                </li>

              </ul>
            </div>
          </div>
        </nav>
      )}

      <div className={isHomePage && !isLoginPage ? '' : 'min-vh-100'} style={isHomePage && !isLoginPage ? {} : {backgroundColor: '#f5f7fa'}}>
        <Routes>
          <Route path="/login" element={<CombinedLogin onUserLogin={setIsUserLoggedIn} onAdminLogin={setIsAdminLoggedIn} />} />
          <Route path="/" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />
          <Route path="/rooms" element={
            <ProtectedRoute>
              <RoomListing />
            </ProtectedRoute>
          } />
          <Route path="/bookings" element={
            <ProtectedRoute>
              <BookingList />
            </ProtectedRoute>
          } />
          <Route path="/book/:id" element={
            <ProtectedRoute>
              <BookingFormWrapper />
            </ProtectedRoute>
          } />
          
          <Route 
            path="/admin" 
            element={
              isAdminLoggedIn ? 
                <AdminDashboard onLogout={setIsAdminLoggedIn} /> : 
                <CombinedLogin onUserLogin={setIsUserLoggedIn} onAdminLogin={setIsAdminLoggedIn} />
            } 
          />
          <Route 
            path="/admin/dashboard" 
            element={
              isAdminLoggedIn ? 
                <AdminDashboard onLogout={setIsAdminLoggedIn} /> : 
                <CombinedLogin onUserLogin={setIsUserLoggedIn} onAdminLogin={setIsAdminLoggedIn} />
            } 
          />
        </Routes>
      </div>

      {!isAdminRoute && !isLoginPage && (
        <footer className="footer-modern">
          <div className="container py-5">
            <div className="row g-4">
              <div className="col-lg-4 col-md-6">
                <div className="footer-brand mb-4">
                  <h4 className="fw-bold text-white mb-3 d-flex align-items-center">
                    <span className="me-3" style={{
                      position: 'relative',
                      display: 'inline-block',
                      animation: 'logoFloat 3s ease-in-out infinite'
                    }}>
                      <i className="fas fa-hotel" style={{
                        color: '#ff6b35',
                        fontSize: '1.5rem',
                        filter: 'drop-shadow(1px 1px 3px rgba(0,0,0,0.3))'
                      }}></i>
                      <i className="fas fa-star" style={{
                        position: 'absolute',
                        top: '-3px',
                        right: '-3px',
                        color: '#ffd700',
                        fontSize: '0.6rem',
                        animation: 'starTwinkle 2s ease-in-out infinite'
                      }}></i>
                    </span>
                    <span style={{
                      fontFamily: 'serif',
                      textShadow: '1px 1px 3px rgba(0,0,0,0.3)'
                    }}>
                      <span style={{color: '#ffffff'}}>ZEN</span>
                      <span style={{color: '#ff6b35'}}>Stay</span>
                    </span>
                  </h4>
                  <p className="footer-description mb-4">
                    Experience luxury and comfort with our premium hotel booking service. 
                    Your perfect stay is just a click away.
                  </p>
                  <div className="social-links">
                    <a href="#" className="social-link me-3">
                      <i className="fab fa-facebook-f"></i>
                    </a>
                    <a href="#" className="social-link me-3">
                      <i className="fab fa-twitter"></i>
                    </a>
                    <a href="#" className="social-link me-3">
                      <i className="fab fa-instagram"></i>
                    </a>
                    <a href="#" className="social-link">
                      <i className="fab fa-linkedin-in"></i>
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="col-lg-2 col-md-6">
                <h6 className="footer-title mb-3">Quick Links</h6>
                <ul className="footer-links">
                  <li><Link to="/" className="footer-link">Home</Link></li>
                  <li><Link to="/rooms" className="footer-link">Rooms</Link></li>
                  <li><Link to="/bookings" className="footer-link">My Bookings</Link></li>
                </ul>
              </div>
              
              <div className="col-lg-3 col-md-6">
                <h6 className="footer-title mb-3">Contact Info</h6>
                <div className="contact-info">
                  <div className="contact-item mb-2">
                    <i className="fas fa-phone me-2 contact-icon"></i>
                    <span>+91 12345 67890</span>
                  </div>
                  <div className="contact-item mb-2">
                    <i className="fas fa-envelope me-2 contact-icon"></i>
                    <span>info@zenstay.com</span>
                  </div>
                  <div className="contact-item">
                    <i className="fas fa-map-marker-alt me-2 contact-icon"></i>
                    <span>Mumbai, India</span>
                  </div>
                </div>
              </div>
              
              <div className="col-lg-3 col-md-6">
                <h6 className="footer-title mb-3">Newsletter</h6>
                <p className="footer-newsletter-text mb-3">
                  Subscribe to get special offers and updates
                </p>
                <div className="newsletter-form">
                  <div className="input-group">
                    <input 
                      type="email" 
                      className="form-control newsletter-input" 
                      placeholder="Your email"
                    />
                    <button className="btn newsletter-btn" type="button">
                      <i className="fas fa-paper-plane"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <hr className="footer-divider my-4" />
            
            <div className="row align-items-center">
              <div className="col-md-6">
                <p className="footer-copyright mb-0">
                  © 2024 ZENStay. All rights reserved.
                </p>
              </div>
              <div className="col-md-6 text-md-end">
                <div className="footer-legal">
                  <a href="#" className="footer-legal-link me-3">Privacy Policy</a>
                  <a href="#" className="footer-legal-link">Terms of Service</a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      )}
    </>
  );
}

export default App;
