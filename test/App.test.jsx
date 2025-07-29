import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';

// Mock dependencies
jest.mock('../src/components/SearchBooking.jsx', () => () => <div>SearchBooking</div>);
jest.mock('../src/components/Booking.jsx', () => () => <div>Booking</div>);
jest.mock('../src/components/Dashboard.jsx', () => () => <div>Dashboard</div>);
jest.mock('../src/components/Navbar.jsx', () => () => <div>Navbar</div>);
jest.mock('../src/components/RoomAvailabilityDotChart.jsx', () => () => <div>RoomAvailabilityDotChart</div>);
jest.mock('../src/config', () => ({ CLIENT_ID: 'test-client-id', API_KEY: 'test-api-key', SCOPES: 'test-scope' }));

// Mock window.gapi and window.google
beforeAll(() => {
  global.window = {};
  window.gapi = {
    load: jest.fn((_, cb) => cb()),
    client: {
      init: jest.fn().mockResolvedValue(),
      setToken: jest.fn()
    }
  };
  window.google = {
    accounts: {
      oauth2: {
        initTokenClient: jest.fn(() => ({
          requestAccessToken: jest.fn(),
        }))
      }
    }
  };
});

describe('App Component', () => {
  test('renders app title and sign in button when not signed in', async () => {
    render(<App />);
    expect(screen.getByText(/The Westwood Booking/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign in with Google/i)).toBeInTheDocument();
  });


  xtest('signs in and renders routes after sign in', async () => {
    render(<App />);
    // Simulate sign in
    fireEvent.click(screen.getByText(/Sign in with Google/i));
    await waitFor(() => {
      expect(screen.getByText((content) => content.includes('Navbar'))).toBeInTheDocument();
      expect(screen.getByText('Navbar')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  test('shows error if token client not initialized', async () => {
    // Remove tokenClient
    window.google.accounts.oauth2.initTokenClient = undefined;
    render(<App />);
    fireEvent.click(screen.getByText(/Sign in with Google/i));
    await waitFor(() => {
      expect(screen.getByText(/Token client not initialized/i)).toBeInTheDocument();
    });
  });

  xtest('shows error if Google API script fails to load', async () => {
    // Simulate script error
    document.body.appendChild = jest.fn((script) => {
      setTimeout(() => script.onerror(), 0);
    });
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/Failed to load Google API script/i)).toBeInTheDocument();
    });
  });
});
