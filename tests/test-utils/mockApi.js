// Mock API utilities for headless testing
import axios from 'axios';

// Mock data
export const mockUsers = [
  {
    user_id: 1,
    username: 'admin_user',
    first_name: 'Admin',
    last_name: 'User',
    email: 'admin@example.com',
    role: 'admin'
  },
  {
    user_id: 2,
    username: 'staff_user',
    first_name: 'Staff',
    last_name: 'Member',
    email: 'staff@example.com',
    role: 'staff'
  }
];

export const mockCustomers = [
  {
    customer_id: 1,
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    user_type: 'customer'
  },
  {
    customer_id: 2,
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane.smith@example.com',
    phone: '+0987654321',
    user_type: 'customer'
  }
];

export const mockRooms = [
  {
    room_id: 1,
    room_name: 'Deluxe Suite',
    room_type: 'suite',
    capacity: 4,
    price: 200,
    status: 'available'
  },
  {
    room_id: 2,
    room_name: 'Standard Room',
    room_type: 'standard',
    capacity: 2,
    price: 100,
    status: 'available'
  }
];

export const mockBookings = [
  {
    booking_id: 1,
    customer_id: 1,
    room_id: 1,
    check_in_date: '2024-01-15',
    check_out_date: '2024-01-20',
    status: 'confirmed',
    total_amount: 1000
  }
];

// Mock API responses
const mockResponses = {
  '/users': { users: mockUsers },
  '/customers': { customers: mockCustomers },
  '/rooms': { rooms: mockRooms },
  '/bookings': { bookings: mockBookings },
  '/createUser': { success: true, user_id: 3 },
  '/createCustomer': { success: true, customer_id: 3 },
  '/login': { 
    success: true, 
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    user: mockUsers[0]
  }
};

// Mock axios instance
export const mockAxios = {
  get: jest.fn((url) => {
    const response = mockResponses[url];
    if (response) {
      return Promise.resolve({ data: response });
    }
    return Promise.reject({ error: 'Not found' });
  }),
  
  post: jest.fn((url, data) => {
    const response = mockResponses[url];
    if (response) {
      return Promise.resolve({ data: response });
    }
    return Promise.reject({ error: 'Not found' });
  }),
  
  put: jest.fn((url, data) => {
    return Promise.resolve({ data: { success: true } });
  }),
  
  delete: jest.fn((url) => {
    return Promise.resolve({ data: { success: true } });
  }),
  
  interceptors: {
    request: {
      use: jest.fn()
    },
    response: {
      use: jest.fn()
    }
  }
};

// Helper to reset all mocks
export const resetAllMocks = () => {
  Object.values(mockAxios).forEach(mock => {
    if (jest.isMockFunction(mock)) {
      mock.mockClear();
    }
  });
};

export default mockAxios;
