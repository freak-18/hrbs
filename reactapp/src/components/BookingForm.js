import React, { useState } from "react";
import { createBooking } from "../utils/api";

const BookingForm = ({ room }) => {
  const [formData, setFormData] = useState({
    guestName: "",
    guestEmail: "",
    checkInDate: "",
    checkOutDate: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const validate = () => {
    const errs = {};
    if (!formData.guestName) errs.name = "Name is required";
    if (!formData.guestEmail) {
      errs.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.guestEmail)) {
      errs.email = "Invalid email format";
    }
    if (!formData.checkInDate) errs.checkIn = "Check-in is required";
    if (!formData.checkOutDate) errs.checkOut = "Check-out is required";

    if (
      formData.checkInDate &&
      formData.checkOutDate &&
      new Date(formData.checkOutDate) <= new Date(formData.checkInDate)
    ) {
      errs.dateOrder = "Check-out date must be after check-in";
    }
    return errs;
  };

const handleChange = (e) => {
setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
};

const handleSubmit = async (e) => {
e.preventDefault();
setMessage("");
const validationErrors = validate();
if (Object.keys(validationErrors).length > 0) {
setErrors(validationErrors);
return;
}
setErrors({});
try {
await createBooking({
...formData,
roomId: room.roomId,
});
setMessage("Booking created successfully");
} catch (err) {
const msg = err?.response?.data?.message || "Booking failed";
setMessage(msg);
}
};

return (
<div>
<h2>Create Booking for Room {room.roomNumber}</h2>
{message && <p>{message}</p>}
<form onSubmit={handleSubmit}>
<div>
<label htmlFor="guestName">Guest Name:</label>
<input
id="guestName"
name="guestName"
value={formData.guestName}
onChange={handleChange}
/>
{errors.name && <p>{errors.name}</p>}
</div>
<div>
<label htmlFor="guestEmail">Guest Email:</label>
<input
id="guestEmail"
name="guestEmail"
value={formData.guestEmail}
onChange={handleChange}
/>
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
/>
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
/>
{errors.checkOut && <p>{errors.checkOut}</p>}
</div>
{errors.dateOrder && <p>{errors.dateOrder}</p>}
<button type="submit">Create Booking</button>
</form>
</div>
);
};

export default BookingForm;