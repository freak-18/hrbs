import React, { useEffect, useState } from 'react';
import { getRooms } from '../utils/api';

function RoomListing() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  useEffect(() => {
    fetchRooms(showAvailableOnly);
  }, [showAvailableOnly]);

  const fetchRooms = async (onlyAvailable) => {
    setLoading(true);
    try {
      const res = await getRooms(onlyAvailable);
      setRooms(res.data);
    } catch {
      setError('could not load rooms');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading rooms...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <label>
        Show available only
        <input
          type="checkbox"
          onChange={() => setShowAvailableOnly(!showAvailableOnly)}
        />
      </label>
      <table>
        <tbody>
          {rooms.map(r => (
            <tr key={r.roomId}>
              <td>{r.roomNumber}</td>
              <td>{r.roomType}</td>
              <td>{r.pricePerNight}</td>
              <td>{r.capacity}</td>
              <td>{r.available ? 'Available' : 'Unavailable'}</td>
              <td>
                <button
                  data-testid={`book-btn-${r.roomId}`}
                  disabled={!r.available}
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

export default RoomListing;
