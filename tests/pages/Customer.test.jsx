import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Customer from '../../src/pages/Customer';
import { mockAxios, mockCustomers } from '../test-utils/mockApi';

// Mock the api module
jest.mock('../../src/modules/apiClient', () => mockAxios);

// Mock navigation hooks
const mockNavigate = jest.fn();
const mockParams = { id: '1' };
const mockLocation = { state: null };

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => mockParams,
  useLocation: () => mockLocation,
}));

describe('Customer Component - Headless Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAxios.get.mockResolvedValue({ 
      data: { customer: mockCustomers[0] } 
    });
  });

  test('renders Customer component in create mode', () => {
    mockParams.id = 'new';
    render(<Customer />);
    
    expect(screen.getByText(/Customer Details/i)).toBeInTheDocument();
  });

  test('loads existing customer data', async () => {
    mockParams.id = '1';
    render(<Customer />);
    
    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalledWith('/customers/1');
    });

    // Check if customer data is displayed
    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
  });

  test('handles form input changes', async () => {
    const user = userEvent.setup();
    mockParams.id = 'new';
    render(<Customer />);
    
    const firstNameInput = screen.getByLabelText(/First Name/i);
    const lastNameInput = screen.getByLabelText(/Last Name/i);
    
    await user.type(firstNameInput, 'Test');
    await user.type(lastNameInput, 'Customer');

    expect(firstNameInput).toHaveValue('Test');
    expect(lastNameInput).toHaveValue('Customer');
  });

  test('validates required fields', async () => {
    const user = userEvent.setup();
    mockParams.id = 'new';
    render(<Customer />);
    
    const saveButton = screen.getByText(/Save/i);
    await user.click(saveButton);

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/Please fill in all required fields/i)).toBeInTheDocument();
    });
  });

  test('submits form successfully', async () => {
    const user = userEvent.setup();
    mockParams.id = 'new';
    
    mockAxios.post.mockResolvedValueOnce({
      data: { success: true, customer_id: 3 }
    });

    render(<Customer />);
    
    // Fill in the form
    const firstNameInput = screen.getByLabelText(/First Name/i);
    const lastNameInput = screen.getByLabelText(/Last Name/i);
    const emailInput = screen.getByLabelText(/Email/i);
    
    await user.type(firstNameInput, 'New');
    await user.type(lastNameInput, 'Customer');
    await user.type(emailInput, 'new@example.com');

    const saveButton = screen.getByText(/Save/i);
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalled();
    });
  });
});
