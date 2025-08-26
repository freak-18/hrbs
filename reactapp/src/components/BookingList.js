import React, { useEffect, useState } from 'react';
import { getBookings } from '../utils/api';

function BookingList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return '#facc15';
      case 'APPROVED': return '#22c55e';
      case 'REJECTED': return '#ef4444';
      default: return '';
    }
  };

  if (loading) return <p>Loading bookings...</p>;
  if (error) return <p>{error}</p>;
  if (bookings.length === 0) return <p>No bookings found</p>;

  return (
    <table className="table">
      <tbody>
        {bookings.map(b => (
          <tr key={b.bookingId}>
            <td>{b.guestName}</td>
            <td>{b.room.roomNumber}</td>
            <td>{b.totalPrice}</td>
            <td style={{ background: getStatusColor(b.status), color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
              {b.status.charAt(0) + b.status.slice(1).toLowerCase()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default BookingList;
