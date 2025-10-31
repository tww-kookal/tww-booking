import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from '../../src/pages/Dashboard';
import { mockAxios, mockBookings } from '../test-utils/mockApi';

// Mock the api module
jest.mock('../../src/modules/apiClient', () => mockAxios);

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Link: ({ children }) => children
}));

describe('Dashboard Component - Headless Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock dashboard data
    mockAxios.get.mockImplementation((url) => {
      if (url === '/bookings') {
        return Promise.resolve({ data: { bookings: mockBookings } });
      }
      if (url === '/financials') {
        return Promise.resolve({ 
          data: { 
            total_revenue: 10000,
            total_expenses: 3000,
            net_profit: 7000 
          } 
        });
      }
      if (url === '/guests/today') {
        return Promise.resolve({ 
          data: { 
            guests: [
              { guest_name: 'John Doe', room: '101' },
              { guest_name: 'Jane Smith', room: '102' }
            ] 
          } 
        });
      }
      return Promise.reject({ error: 'Not found' });
    });
  });

  test('renders Dashboard component', () => {
    render(<Dashboard />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  test('loads and displays booking statistics', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalledWith('/bookings');
    });

    // Check if booking data is displayed
    expect(screen.getByText(/Total Bookings/i)).toBeInTheDocument();
  });

  test('loads and displays financial data', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalledWith('/financials');
    });

    // Check if financial data is displayed
    expect(screen.getByText(/Revenue/i)).toBeInTheDocument();
    expect(screen.getByText(/Expenses/i)).toBeInTheDocument();
  });

  test('displays today\'s guests', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalledWith('/guests/today');
    });

    // Check if guests are displayed
    expect(screen.getByText(/Today's Guests/i)).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  test('handles API errors gracefully', async () => {
    mockAxios.get.mockRejectedValueOnce({ error: 'API Error' });
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });

    // Should still render without crashing
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
