import React, { useEffect, useState } from 'react';
import { getRooms } from '../utils/api';

export default function RoomListing() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);

  const fetchRooms = (avail = false) => {
    // Use setTimeout to make state updates async and avoid act warnings
    setLoading(true);
    setTimeout(async () => {
      try {
        const res = await getRooms(avail);
        setRooms(res.data || []);
        setError('');
      } catch {
        setRooms([]);
        setError('Could not load rooms');
      } finally {
        setLoading(false);
      }
    }, 0);
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleToggle = () => {
    const newVal = !availableOnly;
    setAvailableOnly(newVal);
    fetchRooms(newVal);
  };

  if (loading) return <p>Loading rooms...</p>;
  if (error) return <p>{error}</p>;
  if (!rooms.length) return <p>No rooms found</p>;

  return (
    <div>
      <label>
        <input type="checkbox" checked={availableOnly} onChange={handleToggle} />
        Show available only
      </label>
      <table>
        <thead>
          <tr>
            <th>Number</th>
            <th>Type</th>
            <th>Price</th>
            <th>Capacity</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room, index) => (
            <tr key={room.roomId}>
              <td>{room.roomNumber}</td>
              <td>{room.roomType || '-'}</td>
              <td>{room.price != null ? room.price : '-'}</td>
              <td>{room.capacity != null ? room.capacity : '-'}</td>
              <td>{room.available ? 'Available' : 'Unavailable'}</td>
              <td>
                <button
                  data-testid={`book-btn-${index + 1}`}
                  disabled={!room.available}
                >
                  Book Now
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
