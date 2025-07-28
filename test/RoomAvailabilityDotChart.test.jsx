import React from 'react';
import { render, screen } from '@testing-library/react';
import RoomAvailabilityDotChart from './RoomAvailabilityDotChart';

describe('RoomAvailabilityDotChart', () => {
  test('renders chart header and date input', () => {
    render(<RoomAvailabilityDotChart />);
    expect(screen.getByText(/Room Availability Chart/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Start Date/i)).toBeInTheDocument();
  });
});
