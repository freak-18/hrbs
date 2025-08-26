import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useParams } from "react-router-dom";
import AdminPanel from "./components/AdminPanel";
import BookingForm from "./components/BookingForm";
import BookingList from "./components/BookingList";
import RoomListing from "./components/RoomListing";

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
      <nav className="navbar navbar-expand-lg navbar-light bg-light px-3">
        <Link className="navbar-brand" to="/">Hotel Booking</Link>
        <div className="navbar-nav">
          <Link className="nav-link" to="/">Rooms</Link>
          <Link className="nav-link" to="/bookings">Bookings</Link>
          <Link className="nav-link" to="/admin">Admin</Link>
        </div>
      </nav>

      <div className="container mt-4">
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
