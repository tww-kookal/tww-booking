import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SearchBooking from './SearchBooking';

jest.mock('./constants', () => ({
  loadFromSheetToBookings: jest.fn().mockResolvedValue([
    { bookingID: 'BID123', roomName: 'Cedar', customerName: 'John Doe', bookingDate: '2025-07-28', checkInDate: '2025-07-28', checkOutDate: '2025-07-29', contactNumber: '1234567890', status: 'Confirmed' }
  ]),
  sortBookings: jest.fn(bookings => bookings)
}));

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn()
}));

describe('SearchBooking', () => {
  test('renders search form and results', async () => {
    render(<SearchBooking />);
    expect(screen.getByText(/Search Bookings/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Bookings Found (1)')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  test('shows loading indicator', () => {
    render(<SearchBooking />);
    expect(screen.getByText(/Searching/i)).toBeInTheDocument();
  });
});
