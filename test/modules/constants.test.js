import {
  BOOKING_DEFAULT,
  DEFAULT_BOOKING,
  RANGE,
  roomOptions,
  roomAvailabilityStatusColors,
  statusOptions,
  sourceOptions,
} from '../../src/modules/constants';

import dayjs from 'dayjs';

// Mock window.gapi for loadFromSheetToBookings
beforeAll(() => {
  global.window = {};
  window.gapi = {
    client: {
      sheets: {
        spreadsheets: {
          values: {
            get: jest.fn().mockResolvedValue({ result: { values: [
              ["Cedar", "John Doe", "1234567890", "2", "2025-07-28", "2025-07-29", "1", "Confirmed", "2025-07-27", "Sangeetha", "1000", "500", "", "", "200", "100", "", "", "50", "0", "1250", "100", "1150", "", "BID123", "Test remarks"],
              ["Pine", "Jane Doe", "0987654321", "4", "2025-07-29", "2025-07-30", "1", "Cancelled", "2025-07-28", "MMT", "2000", "1000", "", "", "300", "150", "", "", "100", "0", "2550", "200", "2350", "", "BID124", "Other remarks"]
            ] } })
          }
        }
      }
    }
  };
});

describe('constants.js', () => {
  test('BOOKING_DEFAULT and DEFAULT_BOOKING values', () => {
    expect(BOOKING_DEFAULT.ROOM_NAME).toBe('Cedar');
    expect(DEFAULT_BOOKING.roomName).toBe('Cedar');
    expect(DEFAULT_BOOKING.status).toBe('Confirmed');
  });

  test('RANGE and roomOptions', () => {
    expect(RANGE).toBe('Sheet1!A2:Z');
    expect(roomOptions).toEqual(['Cedar', 'Pine', 'Teak', 'Maple', 'Tent']);
  });

  test('roomAvailabilityStatusColors', () => {
    expect(roomAvailabilityStatusColors.Confirmed).toBe('#007bff');
    expect(roomAvailabilityStatusColors.Cancelled).toBe('#fd7e14');
    expect(roomAvailabilityStatusColors.Available).toBe('#28a745');
    expect(roomAvailabilityStatusColors.Closed).toBe('#6c757d');
  });

  test('statusOptions and sourceOptions', () => {
    expect(statusOptions).toContain('Confirmed');
    expect(sourceOptions).toContain('Sangeetha');
    expect(sourceOptions).toContain('MMT');
  });

});