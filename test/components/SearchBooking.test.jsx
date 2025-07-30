import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BookingSearch from '../../src/components/BookingSearch';
import jsday from 'dayjs';

const mockBookings = [
  { bookingID: 'BID123', roomName: 'Cedar', customerName: 'John Doe', bookingDate: '2025-07-28', checkInDate: jsday().format("YYYY-MM-DD"), checkOutDate: '2025-07-29', contactNumber: '1234567890', status: 'Confirmed' }
];

jest.mock('../../src/modules/constants', () => ({

  loadFromSheetToBookings: jest.fn(() => {
    console.log('🧪 loadFromSheetToBookings called');
    return Promise.resolve(mockBookings);
  }),
  sortBookings: jest.fn(bookings => bookings)
}));

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn()
}));

describe('BookingSearch', () => {
  test('renders search form and results', async () => {
    render(<BookingSearch />);
    expect(screen.getByText(/Search Bookings/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Bookings Found (1)')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  test('shows loading indicator', () => {
    render(<BookingSearch />);
    expect(screen.getByText(/Searching/i)).toBeInTheDocument();
  });
});
