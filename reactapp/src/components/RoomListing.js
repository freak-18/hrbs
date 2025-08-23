import React, { useEffect, useState } from "react";
import { getRooms } from "../utils/api";

const RoomListing = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const fetchRooms = async (availableOnly = false) => {
    setLoading(true);
    setError("");
    try {
      const response = await getRooms(availableOnly);
      setRooms(response.data);
    } catch (err) {
      setError("Could not load rooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms(showAvailableOnly);
  }, [showAvailableOnly]);

  if (loading) return <p>Loading rooms...</p>;
  if (error) return <p>[Error - You need to specify the message]</p>;

  return (
    <div>
      <h2>Room Listing</h2>
      <label>
        <input
          type="checkbox"
          checked={showAvailableOnly}
          onChange={(e) => setShowAvailableOnly(e.target.checked)}
          aria-label="show available only"
        />
        Show available only
      </label>

      {rooms.length === 0 ? (
        <p>No rooms found</p>
      ) : (
        <table border="1">
          <thead>
            <tr>
              <th>Room No</th>
              <th>Type</th>
              <th>Price</th>
              <th>Capacity</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.roomId}>
                <td>{room.roomNumber}</td>
                <td>{room.roomType}</td>
                <td>{room.pricePerNight}</td>
                <td>{room.capacity}</td>
                <td>
                  {room.available ? (
                    <span>Available</span>
                  ) : (
                    <span>Unavailable</span>
                  )}
                </td>
                <td>
                  <button
                    data-testid={`book-btn-${room.roomId}`}
                    disabled={!room.available}
                  >
                    Book Now
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

export default RoomListing;
