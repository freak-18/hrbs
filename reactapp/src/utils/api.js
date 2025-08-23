import axios from "axios";

const API_BASE = "http://localhost:8080/api"; // adjust if your backend uses another base path

export const getBookings = () => {
  return axios.get(`${API_BASE}/bookings`);
};

export const updateBookingStatus = (bookingId, status) => {
  return axios.put(`${API_BASE}/bookings/${bookingId}/status`, { status });
};

export const createBooking = (bookingData) => {
  return axios.post(`${API_BASE}/bookings`, bookingData);
};

export const getRooms = (availableOnly = false) => {
  if (availableOnly) {
    return axios.get(`${API_BASE}/rooms?available=true`);
  }
  return axios.get(`${API_BASE}/rooms`);
};
