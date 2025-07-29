import React from 'react';
import { render, screen } from '@testing-library/react';
import Booking from '../src/components/Booking';
import { MemoryRouter } from 'react-router-dom';

describe('Booking', () => {
  test('renders without crashing', () => {
    render(
      <MemoryRouter>
        <Booking />
      </MemoryRouter>
    );
    // Booking form fields and buttons can be checked here if needed
  });
});
