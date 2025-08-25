import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../src/App.jsx';

describe('App component', () => {
  test('renders Navbar component', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    const navbarElement = screen.getByRole('navigation');
    expect(navbarElement).toBeInTheDocument();
  });

  test('renders Login component on default route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    const loginHeading = screen.getByText(/login/i);
    expect(loginHeading).toBeInTheDocument();
  });
});
