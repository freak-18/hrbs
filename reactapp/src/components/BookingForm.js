import React, { useState } from 'react';
import { createBooking } from '../utils/api';

export default function BookingForm({ room }) {
  const [form, setForm] = useState({
    guestName: '',
    guestEmail: '',
    checkInDate: '',
    checkOutDate: ''
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

  const validate = () => {
    const errs = {};
    if (!form.guestName) errs.guestName = 'Name is required';
    if (!form.guestEmail) errs.guestEmail = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.guestEmail)) errs.guestEmail = 'Invalid email format';
    if (!form.checkInDate) errs.checkInDate = 'Check-in is required';
    if (!form.checkOutDate) errs.checkOutDate = 'Check-out is required';
    if (form.checkInDate && form.checkOutDate && form.checkInDate > form.checkOutDate) {
      errs.checkOutDate = 'Check-out date must be after check-in date';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await createBooking({ ...form, roomId: room.roomId });
      setMessage('Booking created successfully');
      setForm({ guestName: '', guestEmail: '', checkInDate: '', checkOutDate: '' });
    } catch (err) {
      setMessage(err.response?.data?.message || 'Booking failed');
    }
  };

  return (
<form onSubmit={handleSubmit}>
{message && <p data-testid="form-message">{message}</p>} {/* Added test-id */}
<div>
<label>Guest Name</label>
<input name="guestName" value={form.guestName} onChange={handleChange} />
{errors.guestName && <span>{errors.guestName}</span>}
</div>
<div>
<label>Guest Email</label>
<input name="guestEmail" value={form.guestEmail} onChange={handleChange} />
{errors.guestEmail && <span>{errors.guestEmail}</span>}
</div>
<div>
<label>Check-in</label>
<input type="date" name="checkInDate" value={form.checkInDate} onChange={handleChange} />
{errors.checkInDate && <span>{errors.checkInDate}</span>}
</div>
<div>
<label>Check-out</label>
<input type="date" name="checkOutDate" value={form.checkOutDate} onChange={handleChange} />
{errors.checkOutDate && <span>{errors.checkOutDate}</span>}
</div>
<button type="submit">Create Booking</button>
</form>
);
}