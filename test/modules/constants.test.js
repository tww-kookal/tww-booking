import {
  BOOKING_DEFAULT,
  DEFAULT_BOOKING,
  RANGE,
  roomOptions,
  roomAvailabilityStatusColors,
  statusOptions,
  sourceOptions,
  getCommissionPercent,
  convertGoogleDataToBookings,
  loadFromSheetToBookings,
  calculateCommission,
  parseNumber,
  arrayToBooking,
  sortBookings,
  prepareChartData
} from '../../src/modules/constants';

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

  test('getCommissionPercent returns correct percent', () => {
    expect(getCommissionPercent('Sangeetha')).toBe(8);
    expect(getCommissionPercent('Ganesh Agent')).toBe(10);
    expect(getCommissionPercent('MMT')).toBe(30);
    expect(getCommissionPercent('RK')).toBe(0);
    expect(getCommissionPercent('Unknown')).toBe(0);
  });

  test('calculateCommission returns correct value', () => {
    expect(calculateCommission('Sangeetha', 1000)).toBe(80);
    expect(calculateCommission('MMT', 2000)).toBe(600);
    expect(calculateCommission('Unknown', 1000)).toBe(0);
  });

  test('parseNumber parses numbers and strings', () => {
    expect(parseNumber('1,000')).toBe(1000);
    expect(parseNumber('')).toBe(0);
    expect(parseNumber(500)).toBe(500);
    expect(parseNumber('abc')).toBe(0);
  });

  test('arrayToBooking maps array to booking object', () => {
    const arr = ["Cedar", "John Doe", "1234567890", "2", "2025-07-28", "2025-07-29", "1", "Confirmed", "2025-07-27", "Sangeetha", "1000", "500", "", "", "200", "100", "", "", "50", "0", "1250", "100", "1150", "", "BID123", "Test remarks"];
    const booking = arrayToBooking(arr);
    expect(booking.roomName).toBe('Cedar');
    expect(booking.customerName).toBe('John Doe');
    expect(booking.status).toBe('Confirmed');
    expect(booking.bookingID).toBe('BID123');
    expect(booking.remarks).toBe('Test remarks');
  });

  test('sortBookings sorts by checkInDate and customerName', () => {
    const bookings = [
      { checkInDate: '2025-07-29', customerName: 'Jane' },
      { checkInDate: '2025-07-28', customerName: 'John' },
      { checkInDate: '2025-07-28', customerName: 'Alice' }
    ];
    const sorted = sortBookings(bookings);
    expect(sorted[0].customerName).toBe('Alice');
    expect(sorted[1].customerName).toBe('John');
    expect(sorted[2].customerName).toBe('Jane');
  });

  test('convertGoogleDataToBookings maps sheet data to bookings', () => {
    const sheetData = [
      ["Cedar", "John Doe", "1234567890", "2", "2025-07-28", "2025-07-29", "1", "Confirmed", "2025-07-27", "Sangeetha", "1000", "500", "", "", "200", "100", "", "", "50", "0", "1250", "100", "1150", "", "BID123", "Test remarks"]
    ];
    const bookings = convertGoogleDataToBookings(sheetData);
    expect(bookings.length).toBe(1);
    expect(bookings[0].customerName).toBe('John Doe');
  });

  test('loadFromSheetToBookings fetches and converts bookings', async () => {
    const bookings = await loadFromSheetToBookings();
    expect(bookings.length).toBeGreaterThan(0);
    expect(bookings[0].roomName).toBe('Cedar');
  });

  test('prepareChartData returns correct chart data', () => {
    const bookings = [
      { roomName: 'Cedar', checkInDate: '2025-07-28', status: 'Confirmed' },
      { roomName: 'Pine', checkInDate: '2025-07-29', status: 'Cancelled' }
    ];
    const dateSet = new Set(['2025-07-28', '2025-07-29']);
    const memoizedDates = ['2025-07-28', '2025-07-29'];
    const chartData = prepareChartData(bookings, dateSet, memoizedDates);
    expect(chartData.length).toBe(roomOptions.length * memoizedDates.length);
    expect(chartData.some(d => d.roomName === 'Cedar')).toBe(true);
    expect(chartData.some(d => d.roomName === 'Pine')).toBe(true);
  });
});
