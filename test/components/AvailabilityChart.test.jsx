import React from 'react';
import { render, screen } from '@testing-library/react';
import AvailabilityChart from '../../src/components/AvailabilityChart';

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

jest.mock('../../src/modules/common.module', () => ({
  loadFromSheetToBookings: jest.fn().mockResolvedValue(mockBookings),
}));


describe('AvailabilityChart', () => {
  test('renders chart header and date input', () => {
    render(<AvailabilityChart />);
    ['Cedar', 'Pine', 'Teak', 'Maple', 'Tent'].forEach(room => {
      expect(screen.getByText(room)).toBeInTheDocument();
    });
    expect(screen.getByText(/Start Date/i)).toBeInTheDocument();
  });
});
