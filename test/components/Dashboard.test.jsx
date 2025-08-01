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
  roomOptions: ['Cedar', 'Pine', 'Teak', 'Maple', 'Tent'],
}));

jest.mock('../../src/modules/common.module', () => ({
  loadFromSheetToBookings: jest.fn().mockResolvedValue(mockBookings),
}));

describe('Dashboard Component', () => {
  test('shows loading indicator initially', async () => {
    render(<Dashboard />);
    expect(screen.getByText(/Loading statistics/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText(/Loading statistics/i)).not.toBeInTheDocument());
  });

  test('shows booking statistics after loading', async () => {
    render(<Dashboard />);
    await waitFor(() => {
      const expectedTitles = ['Total Bookings', 'Upcoming Bookings', "Today's Check-ins", "Today's Check-outs"];
      const statCards = document.querySelectorAll('.stat-card');

      statCards.forEach((card, index) => {
        const title = card.querySelector('h3');
        const value = card.querySelector('.stat-value');

        expect(title.textContent).toBe(expectedTitles[index]);
        expect(value.textContent).toBe('0');
      });
    });
  });

  test('shows error message if data fetch fails', async () => {
    const { loadFromSheetToBookings } = require('../../src/modules/common.module');
    loadFromSheetToBookings.mockRejectedValueOnce(new Error('Failed'));
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText(/Failed to load booking statistics/i)).toBeInTheDocument();
    });
  });

  test('renders quick actions and refresh button', async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText(/New/i)).toBeInTheDocument();
      expect(screen.getByText(/Search/i)).toBeInTheDocument();
      expect(screen.getByText(/Refresh/i)).toBeInTheDocument();
    });
  });
});
