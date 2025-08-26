import axios from 'axios';

const API_URL = 'https://ide-fdadfbdadfdcccfccebcecfbddadbeddfbafff.premiumproject.examly.io/proxy/8080/api';

export const getBookings = () => axios.get(`${API_URL}/bookings`);
export const createBooking = (data) => axios.post(`${API_URL}/bookings`, data);
export const updateBookingStatus = (bookingId, status) =>
  axios.put(`${API_URL}/bookings/${bookingId}/status`, { status });
export const getRooms = (availableOnly = false) =>
  axios.get(`${API_URL}/rooms${availableOnly ? '?available=true' : ''}`);
