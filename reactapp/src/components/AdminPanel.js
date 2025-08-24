import React, { useEffect, useState } from 'react';
import { getBookings, updateBookingStatus } from '../utils/api';

export default function AdminPanel() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const res = await getBookings();
            setBookings(res.data.filter(b => b.status === 'PENDING'));
            setError('');
        } catch (err) {
            setError('Error loading bookings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleStatus = async (bookingId, status) => {
        try {
            await updateBookingStatus(bookingId, status);
            setMessage(`Booking ${bookingId} has been ${status.toLowerCase()}`);
            setError('');
            fetchBookings();
        } catch (err) {
           setMessage('');
           setError('Update error');
        }
    };

    if (loading) return <p>Loading bookings...</p>;
    if (error) return <p>{error}</p>;
    if (bookings.length === 0) return <p>No pending bookings</p>;

    return (
        <div>
            {message && <p>{message}</p>}
            <table>
                <thead>
                    <tr>
                        <th>Guest</th>
                        <th>Room</th>
                        <th>Check-in</th>
                        <th>Check-out</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {bookings.map(b => (
                        <tr key={b.bookingId}>
                            <td>{b.guestName}</td>
                            <td>{b.room.roomNumber}</td>
                            <td>{b.checkInDate}</td>
                            <td>{b.checkOutDate}</td>
                            <td>
                                <button onClick={() => handleStatus(b.bookingId, 'APPROVED')}>Approve</button>
                                <button onClick={() => handleStatus(b.bookingId, 'REJECTED')}>Reject</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
