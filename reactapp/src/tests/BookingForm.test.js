import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BookingForm from '../components/BookingForm';
import * as api from '../utils/api';

jest.mock('../utils/api');

describe('BookingForm', () => {
  const ROOM = { roomId: 12, roomNumber: '101', roomType: 'Standard', capacity: 2, pricePerNight: 500, available: true };
  beforeEach(() => {
    jest.clearAllMocks();
    api.createBooking.mockResolvedValue({ data: {} });
  });
  it('shows all inputs and validation errors', async () => {
    render(<BookingForm room={ROOM} />);
    fireEvent.click(screen.getByText(/create booking/i));
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/check-in is required/i)).toBeInTheDocument();
    expect(screen.getByText(/check-out is required/i)).toBeInTheDocument();
  });

  it('shows error for invalid email', async () => {
    render(<BookingForm room={ROOM} />);
    fireEvent.change(screen.getByLabelText(/guest name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/guest email/i), { target: { value: 'abc' } });
    fireEvent.change(screen.getByLabelText(/check-in/i), { target: { value: '2023-01-01' } });
    fireEvent.change(screen.getByLabelText(/check-out/i), { target: { value: '2023-01-05' } });
    fireEvent.click(screen.getByRole('button', { name: /create booking/i }));
    expect(await screen.findByText(/invalid email format/i)).toBeInTheDocument();
  });

  it('shows error for invalid date order', async () => {
    render(<BookingForm room={ROOM} />);
    fireEvent.change(screen.getByLabelText(/guest name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/guest email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/check-in/i), { target: { value: '2023-01-10' } });
    fireEvent.change(screen.getByLabelText(/check-out/i), { target: { value: '2023-01-05' } });
    fireEvent.click(screen.getByRole('button', { name: /create booking/i }));
    expect(await screen.findByText(/check-out date must be after/i)).toBeInTheDocument();
  });

  it('submits valid form and shows success', async () => {
    render(<BookingForm room={ROOM} />);
    fireEvent.change(screen.getByLabelText(/guest name/i), { target: { value: 'Jane Smith' } });
    fireEvent.change(screen.getByLabelText(/guest email/i), { target: { value: 'jane@site.com' } });
    fireEvent.change(screen.getByLabelText(/check-in/i), { target: { value: '2023-01-02' } });
    fireEvent.change(screen.getByLabelText(/check-out/i), { target: { value: '2023-01-05' } });
    fireEvent.click(screen.getByRole('button', { name: /create booking/i }));
    expect(api.createBooking).toHaveBeenCalledWith({ guestName: 'Jane Smith', guestEmail: 'jane@site.com', checkInDate: '2023-01-02', checkOutDate: '2023-01-05', roomId: ROOM.roomId });
    expect(await screen.findByText(/booking created successfully/i)).toBeInTheDocument();
  });

  it('shows API error on booking fail', async () => {
    api.createBooking.mockRejectedValueOnce({ response: { data: { message: 'Booking failed due to backend' } } });
    render(<BookingForm room={ROOM} />);
    fireEvent.change(screen.getByLabelText(/guest name/i), { target: { value: 'Mary' } });
    fireEvent.change(screen.getByLabelText(/guest email/i), { target: { value: 'mary@ex.com' } });
    fireEvent.change(screen.getByLabelText(/check-in/i), { target: { value: '2023-01-15' } });
    fireEvent.change(screen.getByLabelText(/check-out/i), { target: { value: '2023-01-20' } });
    fireEvent.click(screen.getByRole('button', { name: /create booking/i }));
    expect(await screen.findByText(/Booking failed due to backend/i)).toBeInTheDocument();
  });
});
