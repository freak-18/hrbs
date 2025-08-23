import React, { useEffect, useState } from "react";
import { getBookings, updateBookingStatus } from "../utils/api";

const AdminPanel = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await getBookings();
        setBookings(response.data);
      } catch (err) {
        setError("Error loading bookings");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleAction = async (id, status) => {
    try {
      await updateBookingStatus(id, status);
      setBookings((prev) =>
        prev.map((b) =>
          b.bookingId === id ? { ...b, status } : b
        )
      );
      setMessage(`Booking ${id} has been ${status.toLowerCase()}`);
    } catch (err) {
      const msg = err?.response?.data?.message || "Update failed";
      setMessage(msg);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>[Error - You need to specify the message]</p>;

  const pendingBookings = bookings.filter((b) => b.status === "PENDING");

  return (
    <div>
      <h2>Admin Panel</h2>
      {message && <p>{message}</p>}
      {pendingBookings.length === 0 ? (
        <p>No pending bookings</p>
      ) : (
        <table border="1">
          <thead>
            <tr>
              <th>Guest</th>
              <th>Room</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingBookings.map((b) => (
              <tr key={b.bookingId}>
                <td>{b.guestName}</td>
                <td>{b.room.roomNumber}</td>
                <td>{b.checkInDate}</td>
                <td>{b.checkOutDate}</td>
                <td>
                  <button onClick={() => handleAction(b.bookingId, "APPROVED")}>
                    Approve
                  </button>
                  <button onClick={() => handleAction(b.bookingId, "REJECTED")}>
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminPanel;
