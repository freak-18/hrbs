import React from 'react';
import { render, screen } from '@testing-library/react';
import BookingList from '../components/BookingList';
import * as api from '../utils/api';

jest.mock('../utils/api');

describe('BookingList', () => {
  const BOOKINGS = [
    {
      bookingId: 1,
      guestName: 'Alice',
      room: { roomNumber: '101' },
      checkInDate: '2023-12-01',
      checkOutDate: '2023-12-03',
      totalPrice: 200,
      status: 'PENDING',
    },
    {
      bookingId: 2,
      guestName: 'Bob',
      room: { roomNumber: '201' },
      checkInDate: '2023-12-10',
      checkOutDate: '2023-12-13',
      totalPrice: 600,
      status: 'APPROVED',
    },
    {
      bookingId: 3,
      guestName: 'Clara',
      room: { roomNumber: '102' },
      checkInDate: '2023-12-15',
      checkOutDate: '2023-12-18',
      totalPrice: 450,
      status: 'REJECTED',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    api.getBookings.mockResolvedValue({ data: BOOKINGS });
  });

  it('displays all bookings with correct info & colors', async () => {
    render(<BookingList />);
    expect(screen.getByText(/loading bookings/i)).toBeInTheDocument();
    // Await Alice row
    expect(await screen.findByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Clara')).toBeInTheDocument();
    // Color checks
    expect(screen.getByText('Pending')).toHaveStyle('background: #facc15');
    expect(screen.getByText('Approved')).toHaveStyle('background: #22c55e');
    expect(screen.getByText('Rejected')).toHaveStyle('background: #ef4444');
  });

  it('shows empty state when no bookings', async () => {
    api.getBookings.mockResolvedValueOnce({ data: [] });
    render(<BookingList />);
    expect(await screen.findByText(/no bookings found/i)).toBeInTheDocument();
  });

  it('shows error on fetch failure', async () => {
    api.getBookings.mockRejectedValueOnce(new Error('fail'));
    render(<BookingList />);
    expect(await screen.findByText(/could not load bookings/i)).toBeInTheDocument();
  });
});
