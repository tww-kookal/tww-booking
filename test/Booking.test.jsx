import React from 'react';
import { render, screen } from '@testing-library/react';
import Booking from './Booking';

describe('Booking', () => {
  test('renders without crashing', () => {
    render(<Booking />);
    // Booking form fields and buttons can be checked here if needed
  });
});
