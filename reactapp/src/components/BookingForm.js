import React, { useState } from 'react';
import * as api from '../utils/api';

const BookingForm = ({ room }) => {
 // Define the initial state for the form for easy resetting
 const initialFormData = {
  guestName: '',
  guestEmail: '',
  checkInDate: '',
  checkOutDate: '',
 };

 // State to hold the form input values
 const [formData, setFormData] = useState(initialFormData);
 // State to hold validation errors
 const [errors, setErrors] = useState({});
 // State for success or failure messages after submission
 const [message, setMessage] = useState('');
 // State to handle the loading status during form submission
 const [isLoading, setIsLoading] = useState(false);

 /**
  * Validates the current form data and returns an object of errors.
  */
 const validate = () => {
  const errs = {};
  if (!formData.guestName.trim()) {
   errs.name = 'Name is required';
  }
  if (!formData.guestEmail.trim()) {
   errs.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.guestEmail)) {
   // Regular expression to validate email format
   errs.email = 'Invalid email format';
  }
  if (!formData.checkInDate) {
   errs.checkIn = 'Check-in is required';
  }
  if (!formData.checkOutDate) {
   errs.checkOut = 'Check-out is required';
  }

  // Check if check-out date is after check-in date
  if (
   formData.checkInDate &&
   formData.checkOutDate &&
   new Date(formData.checkOutDate) <= new Date(formData.checkInDate)
  ) {
   errs.dateOrder = 'Check-out date must be after';
  }
  return errs;
 };

 /**
  * Handles changes to form inputs and updates the state.
  */
 const handleChange = (e) => {
  // Update the formData state with the new value
  setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
 };

 /**
  * Handles the form submission process.
  */
 const handleSubmit = async (e) => {
  e.preventDefault(); // Prevent default browser refresh
  setMessage(''); // Clear any previous messages

  const validationErrors = validate();
  // If there are validation errors, update the errors state and stop
  if (Object.keys(validationErrors).length > 0) {
   setErrors(validationErrors);
   return;
  }

  // Clear errors and set loading state to true
  setErrors({});
  setIsLoading(true);

  try {
   // Call the mocked API function with the form data
   await api.createBooking({
    ...formData,
    roomId: room.roomId,
   });
   // On success, set the success message and reset the form
   setMessage('Booking created successfully');
   setFormData(initialFormData);
  } catch (err) {
   // On failure, extract the error message from the API response
   const msg = err?.response?.data?.message || 'Booking failed';
   setMessage(msg);
  } finally {
   // Reset the loading state regardless of success or failure
   setIsLoading(false);
  }
 };

 return (
  <div>
   <h2>Create Booking for Room {room.roomNumber}</h2>
   {/* Display success or error message */}
   {message && <p>{message}</p>}
   <form onSubmit={handleSubmit}>
    <div>
     <label htmlFor="guestName">Guest Name:</label>
     <input
      id="guestName"
      name="guestName"
      value={formData.guestName}
      onChange={handleChange}
      disabled={isLoading}
     />
     {/* Display validation error for name */}
     {errors.name && <p>{errors.name}</p>}
    </div>
    <div>
     <label htmlFor="guestEmail">Guest Email:</label>
     <input
      id="guestEmail"
      name="guestEmail"
      value={formData.guestEmail}
      onChange={handleChange}
      disabled={isLoading}
     />
     {/* Display validation error for email */}
     {errors.email && <p>{errors.email}</p>}
    </div>
    <div>
     <label htmlFor="checkInDate">Check-in:</label>
     <input
      id="checkInDate"
      type="date"
      name="checkInDate"
      value={formData.checkInDate}
      onChange={handleChange}
      disabled={isLoading}
     />
     {/* Display validation error for check-in date */}
     {errors.checkIn && <p>{errors.checkIn}</p>}
    </div>
    <div>
     <label htmlFor="checkOutDate">Check-out:</label>
     <input
      id="checkOutDate"
      type="date"
      name="checkOutDate"
      value={formData.checkOutDate}
      onChange={handleChange}
      disabled={isLoading}
     />
     {/* Display validation error for check-out date */}
     {errors.checkOut && <p>{errors.checkOut}</p>}
    </div>
    {/* Display validation error for date order */}
    {errors.dateOrder && <p>{errors.dateOrder}</p>}
    <button type="submit" disabled={isLoading}>
     {isLoading ? 'Creating...' : 'Create Booking'}
    </button>
   </form>
  </div>
 );
};

export default BookingForm;