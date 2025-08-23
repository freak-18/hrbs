import React, { useEffect, useState } from "react";
import { getBookings } from "../utils/api";

const statusStyles = {
  PENDING: { background: "#facc15", padding: "2px 6px", borderRadius: "4px" },
  APPROVED: { background: "#22c55e", padding: "2px 6px", borderRadius: "4px", color: "#fff" },
  REJECTED: { background: "#ef4444", padding: "2px 6px", borderRadius: "4px", color: "#fff" },
};

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await getBookings();
        setBookings(response.data);
      } catch (err) {
        setError("Could not load bookings");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (loading) return <p>Loading bookings...</p>;
  if (error) return <p>[Error - You need to specify the message]</p>;
  if (bookings.length === 0) return <p>No bookings found</p>;

  return (
    <div>
      <h2>All Bookings</h2>
      <table border="1">
        <thead>
          <tr>
            <th>Guest</th>
            <th>Room</th>
            <th>Check-in</th>
            <th>Check-out</th>
            <th>Total Price</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.bookingId}>
              <td>{b.guestName}</td>
              <td>{b.room.roomNumber}</td>
              <td>{b.checkInDate}</td>
              <td>{b.checkOutDate}</td>
              <td>{b.totalPrice}</td>
              <td>
                <span style={statusStyles[b.status]}>
                  {b.status.charAt(0) + b.status.slice(1).toLowerCase()}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookingList;
