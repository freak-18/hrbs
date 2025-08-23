import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RoomListing from '../components/RoomListing';
import * as api from '../utils/api';

jest.mock('../utils/api');

describe('RoomListing', () => {
  const ROOMS = [
    { roomId: 1, roomNumber: '101', roomType: 'Standard', pricePerNight: 100, capacity: 2, available: true },
    { roomId: 2, roomNumber: '102', roomType: 'Deluxe', pricePerNight: 150, capacity: 4, available: false }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    api.getRooms.mockResolvedValue({ data: ROOMS });
  });

  it('displays rooms with correct details and filter', async () => {
    render(<RoomListing />);
    expect(screen.getByText(/loading rooms/i)).toBeInTheDocument();
    await screen.findByText('101');
    expect(screen.getByText('101')).toBeInTheDocument();
    expect(screen.getByText('102')).toBeInTheDocument();
    expect(screen.getAllByText(/Book Now/i)).toHaveLength(2);
  });

  it('filters available rooms when toggled', async () => {
    api.getRooms.mockImplementation(avail => Promise.resolve({
      data: avail ? [ROOMS[0]] : ROOMS
    }));
    render(<RoomListing />);
    await screen.findByText('101'); // wait for initial data
    fireEvent.click(screen.getByLabelText(/show available only/i));
    await waitFor(() => expect(screen.queryByText('102')).not.toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('101')).toBeInTheDocument());
    // ensure only available room is shown after refetch
    expect(screen.getByText('101')).toBeInTheDocument();
    // Only the badge, not header, should be checked for available text
    const badges = screen.getAllByText('Available');
    // There must be at least one badge (the one in table)
    expect(badges.length).toBeGreaterThanOrEqual(1);
    // One badge must be visible (in the room row)
    expect(badges.some(b => b.closest('td'))).toBeTruthy();
  });

  it('Book Now is disabled if room is unavailable', async () => {
    render(<RoomListing />);
    await screen.findByText('102');
    const btn = screen.getByTestId('book-btn-2');
    expect(btn).toBeDisabled();
  });

  it('displays error on fetch fail', async () => {
    api.getRooms.mockRejectedValueOnce(new Error('fail'));
    render(<RoomListing />);
    await screen.findByText(/could not load rooms/i);
  });
});
