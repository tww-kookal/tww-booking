import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BookingList from '../src/components/BookingList';

const mockResults = [
  { bookingID: 'BID123', roomName: 'Cedar', customerName: 'John Doe', bookingDate: '2025-07-28', checkInDate: '2025-07-28', checkOutDate: '2025-07-29', contactNumber: '1234567890', status: 'Confirmed' },
  { bookingID: 'BID124', roomName: 'Pine', customerName: 'Jane Doe', bookingDate: '2025-07-29', checkInDate: '2025-07-29', checkOutDate: '2025-07-30', contactNumber: '0987654321', status: 'Cancelled' }
];

describe('BookingList', () => {
  test('renders booking table and data', () => {
    render(
      <BookingList
        loading={false}
        results={mockResults}
        paginatedResults={mockResults}
        itemsPerPage={10}
        currentPage={1}
        handlePageChange={() => {}}
        handleViewBooking={() => {}}
        error={''}
      />
    );
    expect(screen.getByText('Bookings Found (2)')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  test('shows loading indicator', () => {
    render(<BookingList loading={true} results={[]} paginatedResults={[]} itemsPerPage={10} currentPage={1} handlePageChange={() => {}} handleViewBooking={() => {}} error={''} />);
    expect(screen.getByText(/Loading bookings/i)).toBeInTheDocument();
  });

  test('shows no results message', () => {
    render(<BookingList loading={false} results={[]} paginatedResults={[]} itemsPerPage={10} currentPage={1} handlePageChange={() => {}} handleViewBooking={() => {}} error={''} />);
    expect(screen.getByText(/No bookings found/i)).toBeInTheDocument();
  });
});
