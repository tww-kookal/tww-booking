import React from 'react';
import { render, screen } from '@testing-library/react';
import AvailabilityChart from '../../src/components/AvailabilityChart';

describe('AvailabilityChart', () => {
  test('renders chart header and date input', () => {
    render(<AvailabilityChart />);
    expect(screen.getByText(/Room Availability Chart/i)).toBeInTheDocument();
    ['Cedar', 'Pine', 'Teak', 'Maple', 'Tent'].forEach(room => {
      expect(screen.getByRole('columnheader', { name: room })).toBeInTheDocument();
    });
  });
});
