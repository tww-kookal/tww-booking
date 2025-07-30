import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../../src/components/Navbar';

describe('Navbar', () => {
  test('renders all navigation links', () => {
    render(
      <MemoryRouter initialEntries={['/']}> <Navbar /> </MemoryRouter>
    );
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Availability/i)).toBeInTheDocument();
    expect(screen.getByText(/Search Bookings/i)).toBeInTheDocument();
    expect(screen.getByText(/New Booking/i)).toBeInTheDocument();
  });
});
