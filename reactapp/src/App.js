import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useParams } from "react-router-dom";
import AdminPanel from "./components/AdminPanel";
import BookingForm from "./components/BookingForm";
import BookingList from "./components/BookingList";
import RoomListing from "./components/RoomListing";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function BookingFormWrapper({ addBooking }) {
  const { id } = useParams();
  const room = { roomId: Number(id), roomNumber: id, price: 1500 };
  return <BookingForm room={room} onBookingSuccess={addBooking} />;
}

function App() {
  const [bookings, setBookings] = useState([]);

  const addBooking = (newBooking) => {
    setBookings((prev) => [...prev, newBooking]);
  };

  return (
    <Router>
      {/* MakeMyTrip-style Header */}
      <nav className="navbar navbar-expand-lg" style={{backgroundColor: '#051423', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
        <div className="container">
          <Link className="navbar-brand text-white fw-bold fs-3" to="/">
            <i className="fas fa-bed me-2" style={{color: '#ff6b35'}}></i>
            ZENStay
          </Link>
          
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link text-white px-3 py-2 rounded" to="/">
                  <i className="fas fa-home me-1"></i> Hotels
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

      {/* Main Content */}
      <div className="min-vh-100" style={{backgroundColor: '#f5f7fa'}}>
        <Routes>
          <Route path="/" element={<RoomListing />} />
          <Route path="/bookings" element={<BookingList bookings={bookings} />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/book/:id" element={<BookingFormWrapper addBooking={addBooking} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
