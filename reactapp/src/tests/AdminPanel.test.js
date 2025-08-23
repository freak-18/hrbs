import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminPanel from '../components/AdminPanel';
import * as api from '../utils/api';

jest.mock('../utils/api');

describe('AdminPanel', () => {
  const BOOKINGS = [
    {
      bookingId: 7,
      guestName: 'Alice',
      room: { roomNumber: '201' },
      checkInDate: '2023-12-05',
      checkOutDate: '2023-12-07',
      status: 'PENDING',
    },
    {
      bookingId: 8,
      guestName: 'Bob',
      room: { roomNumber: '202' },
      checkInDate: '2023-12-08',
      checkOutDate: '2023-12-11',
      status: 'PENDING',
    },
    {
      bookingId: 9,
      guestName: 'Ready',
      room: { roomNumber: '203' },
      checkInDate: '2023-12-12',
      checkOutDate: '2023-12-18',
      status: 'APPROVED',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    api.getBookings.mockResolvedValue({ data: BOOKINGS });
    api.updateBookingStatus.mockResolvedValue();
  });

  it('shows only pending bookings and approve/reject', async () => {
    render(<AdminPanel />);
    await screen.findByText('Alice');
    expect(screen.getByText('201')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.queryByText('Ready')).not.toBeInTheDocument();
    // Two approve buttons in table
    expect(screen.getAllByText(/approve/i)).toHaveLength(2);
    fireEvent.click(screen.getAllByText(/approve/i)[0]);
    await waitFor(() => expect(api.updateBookingStatus).toHaveBeenCalledWith(7, 'APPROVED'));
    // Success message
    await screen.findByText(/Booking 7 has been approved/i);
  });

  it('shows message on rejection', async () => {
    render(<AdminPanel />);
    await screen.findByText('Alice');
    fireEvent.click(screen.getAllByText(/reject/i)[0]);
    await waitFor(() => expect(api.updateBookingStatus).toHaveBeenCalledWith(7, 'REJECTED'));
    await screen.findByText(/Booking 7 has been rejected/i);
  });

  it('shows empty state if no pending bookings', async () => {
    api.getBookings.mockResolvedValueOnce({ data: [BOOKINGS[2]] });
    render(<AdminPanel />);
    await screen.findByText(/no pending bookings/i);
  });

  it('shows error on get fail', async () => {
    api.getBookings.mockRejectedValueOnce(new Error('fail'));
    render(<AdminPanel />);
    await screen.findByText(/error loading bookings/i);
  });

  it('shows API error on update fail', async () => {
    api.updateBookingStatus.mockRejectedValueOnce({ response: { data: { message: 'Update error' } } });
    render(<AdminPanel />);
    await screen.findByText('Alice');
    fireEvent.click(screen.getAllByText(/approve/i)[0]);
    await screen.findByText(/update error/i);
  });
});