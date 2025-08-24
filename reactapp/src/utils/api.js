import axios from "axios";

const API_BASE = "http://localhost:8080/api"; // adjust if backend base path differs

// Fetch all bookings
export const getBookings = () => axios.get(`${API_BASE}/bookings`);

// Create a new booking
export const createBooking = (bookingData) =>
  axios.post(`${API_BASE}/bookings`, bookingData);

// Update booking status (approve/reject)
export const updateBookingStatus = (bookingId, status) =>
  axios.put(`${API_BASE}/bookings/${bookingId}/status`, { status });

// Fetch all rooms or only available rooms
export const getRooms = (availableOnly = false) => {
  const url = availableOnly
    ? `${API_BASE}/rooms?available=true`
    : `${API_BASE}/rooms`;
  return axios.get(url);
};

// Fetch a single room by ID
export const getRoomById = (roomId) =>
  axios.get(`${API_BASE}/rooms/${roomId}`);
