import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BookingSearch from '../../src/components/BookingSearch';
import dayjs from 'dayjs';

const mockBookings = [];

jest.mock('../../src/modules/common.module', () => ({
  loadFromSheetToBookings: jest.fn().mockResolvedValue(mockBookings),
  sortBookings: jest.fn(bookings => bookings)
}));

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
  useLocation: jest.fn(() => ({
    state: {
      defaultCheckInDate: '2025-08-01',
      exactStartDate: true
    }
  })),
}));

describe('BookingSearch', () => {
  test('renders search form', async () => {
    render(<BookingSearch />);
    expect(screen.getAllByText(/Search/i).length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/Booking Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Guest Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Check In Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contact Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Booking ID/i)).toBeInTheDocument();
  });

  test('renders Search Results', async () => {
    render(<BookingSearch />);
    await waitFor(() => {
      expect(screen.getByText(/No Bookings Found/i)).toBeInTheDocument();
    });
  });

  test('shows loading indicator', async () => {
    render(<BookingSearch />);
    await waitFor(() => {
      expect(screen.getByText(/Searching/i)).toBeInTheDocument();
    });
  });
});
