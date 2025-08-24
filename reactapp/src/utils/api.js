import axios from 'axios';

const API_URL = 'http://localhost:8080/api'; // adjust to your backend URL

export const getBookings = () => axios.get(`${API_URL}/bookings`);
export const createBooking = (data) => axios.post(`${API_URL}/bookings`, data);
export const updateBookingStatus = (bookingId, status) => 
    axios.put(`${API_URL}/bookings/${bookingId}/status`, { status });

export const getRooms = (availableOnly = false) =>
    axios.get(`${API_URL}/rooms${availableOnly ? '?available=true' : ''}`);
