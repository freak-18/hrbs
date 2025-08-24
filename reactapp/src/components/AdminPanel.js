import React, { useEffect, useState } from 'react';
import { getBookings, updateBookingStatus } from '../utils/api';

function AdminPanel() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getBookings();
        setBookings(res.data.filter(b => b.status === 'PENDING'));
      } catch {
        setError('Error loading bookings');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleUpdate = async (id, status) => {
    try {
      await updateBookingStatus(id, status);
      setMessage(`Booking ${id} has been ${status.toLowerCase()}`);
      setBookings(prev => prev.filter(b => b.bookingId !== id));
    } catch (err) {
      setMessage(err.response?.data?.message || 'Update failed');
    }
  };

  if (loading) return <p>Loading bookings...</p>;
  if (error) return <p>{error}</p>;
  if (bookings.length === 0) return <p>No pending bookings</p>;

  return (
    <div>
      {message && <p>{message}</p>}
      <table>
        <tbody>
          {bookings.map(b => (
            <tr key={b.bookingId}>
              <td>{b.guestName}</td>
              <td>{b.room.roomNumber}</td>
              <td>
                <button onClick={() => handleUpdate(b.bookingId, 'APPROVED')}>Approve</button>
                <button onClick={() => handleUpdate(b.bookingId, 'REJECTED')}>Reject</button>
              </td>
   /         </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminPanel;
