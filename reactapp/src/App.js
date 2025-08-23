import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import AdminPanel from "./components/AdminPanel";
import BookingForm from "./components/BookingForm";
import BookingList from "./components/BookingList";
import RoomListing from "./components/RoomListing";

function App() {
  // Example room prop for BookingForm (in real app this could come from RoomListing selection)
  const sampleRoom = {
    roomId: 1,
    roomNumber: "101",
    roomType: "Standard",
    capacity: 2,
    pricePerNight: 100,
    available: true,
  };

  return (
    <Router>
      <div>
        <h1>Hotel Booking System</h1>
        <nav style={{ marginBottom: "1rem" }}>
          <Link to="/" style={{ marginRight: "10px" }}>
            Rooms
          </Link>
          <Link to="/bookings" style={{ marginRight: "10px" }}>
            All Bookings
          </Link>
          <Link to="/admin" style={{ marginRight: "10px" }}>
            Admin Panel
          </Link>
          <Link to="/new-booking">New Booking</Link>
        </nav>

        <Routes>
          <Route path="/" element={<RoomListing />} />
          <Route path="/bookings" element={<BookingList />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/new-booking" element={<BookingForm room={sampleRoom} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
