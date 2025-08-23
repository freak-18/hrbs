// Base API URL
export const API_BASE = "http://localhost:8080/api";

// Status labels and colors (used in BookingList)
export const STATUS_STYLES = {
  PENDING: { label: "Pending", background: "#facc15", color: "#000" },
  APPROVED: { label: "Approved", background: "#22c55e", color: "#fff" },
  REJECTED: { label: "Rejected", background: "#ef4444", color: "#fff" },
};

// Common messages
export const MESSAGES = {
  LOADING_BOOKINGS: "Loading bookings...",
  LOADING_ROOMS: "Loading rooms...",
  NO_BOOKINGS: "No bookings found",
  NO_PENDING: "No pending bookings",
  NO_ROOMS: "No rooms found",
  ERROR_BOOKINGS: "Error loading bookings",
  ERROR_ROOMS: "Could not load rooms",
  BOOKING_SUCCESS: "Booking created successfully",
  BOOKING_FAILED: "Booking failed",
};
