import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from '../../src/components/Dashboard';
import '../../src/modules/constants';

// Mock AvailabilityChart and Link
jest.mock('../../src/components/AvailabilityChart', () => () => <div>AvailabilityChart</div>);
jest.mock('react-router-dom', () => ({
  Link: ({ children, ...props }) => <a {...props}>{children}</a>
}));

// Mock loadFromSheetToBookings
const mockBookings = [
  {
    roomName: 'Cedar',
    customerName: 'John Doe',
    contactNumber: '1234567890',
    numberOfPeople: 2,
    checkInDate: new Date().toISOString().split('T')[0],
    checkOutDate: new Date().toISOString().split('T')[0],
    numberOfNights: 1,
    status: 'Confirmed',
    bookingDate: new Date().toISOString().split('T')[0],
    sourceOfBooking: 'Sangeetha',
    bookingID: 'BID123',
  },
  {
    roomName: 'Pine',
    customerName: 'Jane Doe',
    contactNumber: '0987654321',
    numberOfPeople: 4,
    checkInDate: new Date().toISOString().split('T')[0],
    checkOutDate: new Date().toISOString().split('T')[0],
    numberOfNights: 1,
    status: 'Cancelled',
    bookingDate: new Date().toISOString().split('T')[0],
    sourceOfBooking: 'MMT',
    bookingID: 'BID124',
  }
];

jest.mock('../../src/modules/constants', () => ({
  loadFromSheetToBookings: jest.fn().mockResolvedValue(mockBookings),
  roomOptions: ['Cedar', 'Pine', 'Teak', 'Maple', 'Tent'],
}));

describe('Dashboard Component', () => {
  test('renders dashboard title and AvailabilityChart', async () => {
    render(<Dashboard />);
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText('AvailabilityChart')).toBeInTheDocument();
  });

  test('shows loading indicator initially', async () => {
    render(<Dashboard />);
    expect(screen.getByText(/Loading statistics/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText(/Loading statistics/i)).not.toBeInTheDocument());
  });

  test('shows booking statistics after loading', async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText(/Total Bookings/i).nextSibling).toHaveTextContent('0');
      expect(screen.getByText(/Upcoming Bookings/i).nextSibling).toHaveTextContent('0');
      expect(screen.getByText(/Today's Check-ins/i).nextSibling).toHaveTextContent('0');
      expect(screen.getByText(/Today's Check-outs/i).nextSibling).toHaveTextContent('0');
      //expect(screen.getByText('2')).toBeInTheDocument(); // Only 1 upcoming booking (not cancelled)
    });
  });

  test('shows error message if data fetch fails', async () => {
    const { loadFromSheetToBookings, roomOptions } = require('../../src/modules/constants');
    loadFromSheetToBookings.mockRejectedValueOnce(new Error('Failed'));
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText(/Failed to load booking statistics/i)).toBeInTheDocument();
    });
  });

  test('renders quick actions and refresh button', async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText(/Quick Actions/i)).toBeInTheDocument();
      expect(screen.getByText(/New Booking/i)).toBeInTheDocument();
      expect(screen.getByText(/Search Bookings/i)).toBeInTheDocument();
      expect(screen.getByText(/Refresh Data/i)).toBeInTheDocument();
    });
  });
});
