import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

export const getBookings = () => axios.get(`${API_URL}/bookings`);
export const createBooking = (data) => axios.post(`${API_URL}/bookings`, data);
export const updateBookingStatus = (bookingId, status) =>
  axios.put(`${API_URL}/bookings/${bookingId}/status`, { status });
export const cancelBooking = (bookingId) =>
  axios.delete(`${API_URL}/bookings/${bookingId}`);
export const getRooms = (availableOnly = false) =>
  axios.get(`${API_URL}/rooms${availableOnly ? '?available=true' : ''}`);
export const freeRoom = (roomId) =>
  axios.put(`${API_URL}/rooms/${roomId}/free`);
export const freeAllRooms = () =>
  axios.put(`${API_URL}/rooms/free-all`);

// Payment API endpoints
export const processPayment = (paymentData) =>
  axios.post(`${API_URL}/payments/process`, paymentData);
export const verifyPayment = (paymentId) =>
  axios.get(`${API_URL}/payments/${paymentId}/verify`);
export const getPaymentStatus = (bookingId) =>
  axios.get(`${API_URL}/payments/booking/${bookingId}`);

// Notification API endpoints
export const sendEmailNotification = (notificationData) =>
  axios.post(`${API_URL}/notifications/email`, notificationData);
export const getNotifications = () =>
  axios.get(`${API_URL}/notifications`);
export const markNotificationRead = (notificationId) =>
  axios.put(`${API_URL}/notifications/${notificationId}/read`);
