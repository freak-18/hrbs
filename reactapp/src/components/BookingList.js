import React, { useEffect, useState } from 'react';
import { getBookings } from '../utils/api';

export default function BookingList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getBookings();
        setBookings(res.data);
      } catch {
        setError('Could not load bookings');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <p>Loading bookings...</p>;
  if (error) return <p>[Error - You need to specify the message]</p>;
  if (bookings.length === 0) return <p>No bookings found</p>;

  const statusColors = {
    PENDING: '#facc15',
    APPROVED: '#22c55e',
    REJECTED: '#ef4444'
  };

  return (
    <table>
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
        {bookings.map(b => (
          <tr key={b.bookingId}>
            <td>{b.guestName}</td>
            <td>{b.room.roomNumber}</td>
            <td>{b.checkInDate}</td>
            <td>{b.checkOutDate}</td>
            <td>{b.totalPrice}</td>
            <td style={{ background: statusColors[b.status] }}>
              {b.status.charAt(0) + b.status.slice(1).toLowerCase()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
