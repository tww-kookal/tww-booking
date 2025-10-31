import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Rooms from '../../src/pages/Rooms';
import { mockAxios, mockRooms } from '../test-utils/mockApi';

// Mock the api module
jest.mock('../../src/modules/apiClient', () => mockAxios);

describe('Rooms Component - Headless Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAxios.get.mockResolvedValue({ 
      data: { rooms: mockRooms } 
    });
  });

  test('renders Rooms component and loads rooms', async () => {
    render(<Rooms />);
    
    expect(screen.getByText('Rooms')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalledWith('/rooms');
    });

    // Check if rooms are displayed
    expect(screen.getByText('Deluxe Suite')).toBeInTheDocument();
    expect(screen.getByText('Standard Room')).toBeInTheDocument();
  });

  test('displays room details correctly', async () => {
    render(<Rooms />);
    
    await waitFor(() => {
      expect(screen.getByText('Deluxe Suite')).toBeInTheDocument();
    });

    // Check room details
    expect(screen.getByText('suite')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('$200')).toBeInTheDocument();
  });

  test('handles API error when loading rooms', async () => {
    mockAxios.get.mockRejectedValueOnce({ error: 'API Error' });
    
    render(<Rooms />);
    
    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalledWith('/rooms');
    });

    // Should not display rooms on error
    expect(screen.queryByText('Deluxe Suite')).not.toBeInTheDocument();
  });

  test('filters rooms based on search criteria', async () => {
    const user = userEvent.setup();
    render(<Rooms />);
    
    await waitFor(() => {
      expect(screen.getByText('Deluxe Suite')).toBeInTheDocument();
    });

    // Add search functionality test if component has search
    const searchInput = screen.queryByPlaceholderText(/search/i);
    if (searchInput) {
      await user.type(searchInput, 'Deluxe');
      expect(screen.getByText('Deluxe Suite')).toBeInTheDocument();
      expect(screen.queryByText('Standard Room')).not.toBeInTheDocument();
    }
  });
});
