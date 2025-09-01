import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useParams, useLocation } from "react-router-dom";
import HomePage from "./components/HomePage";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import AdminPanel from "./components/AdminPanel";
import BookingForm from "./components/BookingForm";
import BookingList from "./components/BookingList";
import RoomListing from "./components/RoomListing";
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

  useEffect(() => {
    const adminStatus = localStorage.getItem('adminLoggedIn');
    setIsAdminLoggedIn(adminStatus === 'true');
  }, []);

  return (
    <Router>
      <AppContent 
        isAdminLoggedIn={isAdminLoggedIn} 
        setIsAdminLoggedIn={setIsAdminLoggedIn} 
      />
    </Router>
  );
}

function AppContent({ isAdminLoggedIn, setIsAdminLoggedIn }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isHomePage = location.pathname === '/';

  return (
    <>
      {!isAdminRoute && (
        <nav className="navbar navbar-expand-lg" style={{backgroundColor: '#051423', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
          <div className="container">
            <Link className="navbar-brand text-white fw-bold fs-3" to="/">
              <i className="fas fa-building me-2" style={{color: '#ff6b35'}}></i>
              ZENStay
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
                <li className="nav-item">
                  <Link className="nav-link text-white px-3 py-2 rounded" to="/admin">
                    <i className="fas fa-cog me-1"></i> Admin
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      )}

      <div className={isHomePage ? '' : 'min-vh-100'} style={isHomePage ? {} : {backgroundColor: '#f5f7fa'}}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/rooms" element={<RoomListing />} />
          <Route path="/bookings" element={<BookingList />} />
          <Route path="/book/:id" element={<BookingFormWrapper />} />
          
          <Route 
            path="/admin" 
            element={
              isAdminLoggedIn ? 
                <AdminDashboard onLogout={setIsAdminLoggedIn} /> : 
                <AdminLogin onLogin={setIsAdminLoggedIn} />
            } 
          />
          <Route 
            path="/admin/dashboard" 
            element={
              isAdminLoggedIn ? 
                <AdminDashboard onLogout={setIsAdminLoggedIn} /> : 
                <AdminLogin onLogin={setIsAdminLoggedIn} />
            } 
          />
        </Routes>
      </div>

      {!isAdminRoute && (
        <footer className="bg-dark text-white py-4 mt-5">
          <div className="container">
            <div className="row">
              <div className="col-md-6">
                <h5 className="fw-bold mb-3">
                  <i className="fas fa-building me-2" style={{color: '#ff6b35'}}></i>
                  ZENStay
                </h5>
                <p className="text-muted">Your trusted partner for comfortable stays.</p>
              </div>
              <div className="col-md-3">
                <h6 className="fw-bold mb-3">Quick Links</h6>
                <ul className="list-unstyled">
                  <li><Link to="/rooms" className="text-muted text-decoration-none">Hotels</Link></li>
                  <li><Link to="/bookings" className="text-muted text-decoration-none">Bookings</Link></li>
                </ul>
              </div>
              <div className="col-md-3">
                <h6 className="fw-bold mb-3">Contact</h6>
                <p className="text-muted small">
                  <i className="fas fa-phone me-2"></i>+91 12345 67890<br/>
                  <i className="fas fa-envelope me-2"></i>info@zenstay.com
                </p>
              </div>
            </div>
          </div>
        </footer>
      )}
    </>
  );
}

export default App;
