import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Users from '../../src/pages/Users';
import { mockAxios, mockUsers } from '../test-utils/mockApi';

// Mock the api module
jest.mock('../../src/modules/apiClient', () => mockAxios);

describe('Users Component - Headless Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders Users component without crashing', () => {
    render(<Users />);
    expect(screen.getByText('Users')).toBeInTheDocument();
  });

  test('loads and displays users on mount', async () => {
    render(<Users />);
    
    // Wait for users to load
    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalledWith('/users');
    });

    // Check if users are displayed
    expect(screen.getByText('Admin User (admin_user)')).toBeInTheDocument();
    expect(screen.getByText('Staff Member (staff_user)')).toBeInTheDocument();
  });

  test('handles API error when loading users', async () => {
    // Mock API error
    mockAxios.get.mockRejectedValueOnce({ error: 'API Error' });
    
    render(<Users />);
    
    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalledWith('/users');
    });

    // Should not display users on error
    expect(screen.queryByText('Admin User (admin_user)')).not.toBeInTheDocument();
  });

  test('creates a new user successfully', async () => {
    const user = userEvent.setup();
    render(<Users />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalledWith('/users');
    });

    // Fill in the form
    const usernameInput = screen.getByPlaceholderText('username');
    const passwordInput = screen.getByPlaceholderText('password');
    
    await user.type(usernameInput, 'new_user');
    await user.type(passwordInput, 'password123');

    // Submit the form
    const createButton = screen.getByText('Create');
    await user.click(createButton);

    // Verify API call was made
    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledWith('/createUser', {
        username: 'new_user',
        password: 'password123',
        role_id: undefined
      });
    });
  });

  test('handles form validation', async () => {
    const user = userEvent.setup();
    render(<Users />);
    
    // Submit empty form
    const createButton = screen.getByText('Create');
    await user.click(createButton);

    // Should not make API call
    expect(mockAxios.post).not.toHaveBeenCalled();
  });
});
