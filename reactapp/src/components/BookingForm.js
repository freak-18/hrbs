import React, { useState } from 'react';
import { createBooking } from '../utils/api';

function BookingForm({ room }) {
  const [form, setForm] = useState({
    guestName: '',
    guestEmail: '',
    checkInDate: '',
    checkOutDate: ''
  });
  const [errors, setErrors] = useState([]);
  const [message, setMessage] = useState('');

  const validate = () => {
    let errs = [];
    if (!form.guestName) errs.push('Name is required');
    if (!form.guestEmail) errs.push('Email is required');
    else if (!/\S+@\S+\.\S+/.test(form.guestEmail)) errs.push('Invalid email format');
    if (!form.checkInDate) errs.push('Check-in is required');
    if (!form.checkOutDate) errs.push('Check-out is required');
    if (form.checkInDate && form.checkOutDate &&
        new Date(form.checkOutDate) <= new Date(form.checkInDate)) {
      errs.push('Check-out date must be after check-in date');
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (errs.length > 0) {
      setErrors(errs);
      setMessage('');
      return;
    }
    setErrors([]);
    try {
      await createBooking({ ...form, roomId: room.roomId });
      setMessage('Booking created successfully');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Booking failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {errors.map((err, i) => (
        <p key={i}>{err}</p>
      ))}
      {message && <p>{message}</p>}

      <label htmlFor="guestName">Guest Name</label>
      <input
        id="guestName"
        aria-label="guest name"
        value={form.guestName}
        onChange={e => setForm({ ...form, guestName: e.target.value })}
      />

      <label htmlFor="guestEmail">Guest Email</label>
      <input
        id="guestEmail"
        aria-label="guest email"
        value={form.guestEmail}
        onChange={e => setForm({ ...form, guestEmail: e.target.value })}
      />

      <label htmlFor="checkInDate">Check-in</label>
      <input
        type="date"
        id="checkInDate"
        aria-label="check-in"
        value={form.checkInDate}
        onChange={e => setForm({ ...form, checkInDate: e.target.value })}
      />
<label htmlFor="checkOutDate">Check-out</label>
<input
type="date"
id="checkOutDate"
aria-label="check-out"
value={form.checkOutDate}
onChange={e => setForm({ ...form, checkOutDate: e.target.value })}
/>

<button type="submit">Create Booking</button>
</form>
);
}

export default BookingForm;