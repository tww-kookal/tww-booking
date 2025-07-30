import { validateBooking, findSheetRowToUpdate, convertBookingToSheetsRecord } from '../../src/modules/booking.module';

describe('validateBooking', () => {
  it('returns no errors for a valid booking', () => {
    const booking = {
      customerName: 'John Doe',
      checkInDate: '2025-08-01',
      checkOutDate: '2025-08-05',
      contactNumber: '1234567890',
    };
    expect(validateBooking(booking)).toEqual([]);
  });

  it('returns error if customerName is missing', () => {
    const booking = {
      checkInDate: '2025-08-01',
      checkOutDate: '2025-08-05',
      contactNumber: '1234567890',
    };
    expect(validateBooking(booking)).toContain('Customer Name is required');
  });

  it('returns error if checkInDate is missing', () => {
    const booking = {
      customerName: 'John Doe',
      checkOutDate: '2025-08-05',
      contactNumber: '1234567890',
    };
    expect(validateBooking(booking)).toContain('Check-in Date is required');
  });

  it('returns error if checkOutDate is missing', () => {
    const booking = {
      customerName: 'John Doe',
      checkInDate: '2025-08-01',
      contactNumber: '1234567890',
    };
    expect(validateBooking(booking)).toContain('Check-out Date is required');
  });

  it('returns error if contactNumber is missing', () => {
    const booking = {
      customerName: 'John Doe',
      checkInDate: '2025-08-01',
      checkOutDate: '2025-08-05',
    };
    expect(validateBooking(booking)).toContain('Contact Number is required');
  });

  it('returns error if checkOutDate is before or same as checkInDate', () => {
    const booking = {
      customerName: 'John Doe',
      checkInDate: '2025-08-05',
      checkOutDate: '2025-08-01',
      contactNumber: '1234567890',
    };
    expect(validateBooking(booking)).toContain('Check-out Date must be after Check-in Date');

    const bookingSameDate = {
      customerName: 'John Doe',
      checkInDate: '2025-08-01',
      checkOutDate: '2025-08-01',
      contactNumber: '1234567890',
    };
    expect(validateBooking(bookingSameDate)).toContain('Check-out Date must be after Check-in Date');
  });

  it('returns multiple errors for multiple missing fields', () => {
    const booking = {};
    const errors = validateBooking(booking);
    expect(errors).toContain('Customer Name is required');
    expect(errors).toContain('Check-in Date is required');
    expect(errors).toContain('Check-out Date is required');
    expect(errors).toContain('Contact Number is required');
  });
});

describe('findSheetRowToUpdate', () => {
  const baseBooking = {
    bookingID: 'Cedar-2025-08-01-2025-08-05',
    roomName: 'Cedar',
    checkInDate: '2025-08-01',
    checkOutDate: '2025-08-05',
  };

  it('returns correct index when booking matches', () => {
    const allBookings = [
      { ...baseBooking },
      { bookingID: 'Pine-2025-08-02-2025-08-06', roomName: 'Pine', checkInDate: '2025-08-02', checkOutDate: '2025-08-06' },
      { ...baseBooking, bookingID: 'Cedar-2025-08-01-2025-08-05' },
    ];
    const booking = { ...baseBooking };
    expect(findSheetRowToUpdate(allBookings, booking)).toBe(2);
  });

  it('returns -1 when no booking matches', () => {
    const allBookings = [
      { bookingID: 'Pine-2025-08-02-2025-08-06', roomName: 'Pine', checkInDate: '2025-08-02', checkOutDate: '2025-08-06' },
      { bookingID: 'Teak-2025-08-03-2025-08-07', roomName: 'Teak', checkInDate: '2025-08-03', checkOutDate: '2025-08-07' },
    ];
    const booking = { ...baseBooking };
    expect(findSheetRowToUpdate(allBookings, booking)).toBe(-1);
  });

  it('returns correct index when multiple bookings match, returns first', () => {
    const allBookings = [
      { ...baseBooking },
      { ...baseBooking },
      { ...baseBooking, bookingID: 'Cedar-2025-08-01-2025-08-05' },
    ];
    const booking = { ...baseBooking };
    expect(findSheetRowToUpdate(allBookings, booking)).toBe(2);
  });

  it('returns correct index when bookingID matches but roomName does not', () => {
    const allBookings = [
      { bookingID: baseBooking.bookingID, roomName: 'Pine', checkInDate: baseBooking.checkInDate, checkOutDate: baseBooking.checkOutDate },
      { ...baseBooking },
    ];
    const booking = { ...baseBooking };
    expect(findSheetRowToUpdate(allBookings, booking)).toBe(1);
  });

  it('returns -1 when bookingID matches but dates do not', () => {
    const allBookings = [
      { bookingID: baseBooking.bookingID, roomName: baseBooking.roomName, checkInDate: '2025-08-02', checkOutDate: '2025-08-06' },
      { bookingID: baseBooking.bookingID, roomName: baseBooking.roomName, checkInDate: baseBooking.checkInDate, checkOutDate: baseBooking.checkOutDate },
    ];
    const booking = { ...baseBooking, checkInDate: '2025-08-03', checkOutDate: '2025-08-07' };
    expect(findSheetRowToUpdate(allBookings, booking)).toBe(-1);
  });

  it('returns -1 for empty bookings array', () => {
    const allBookings = [];
    const booking = { ...baseBooking };
    expect(findSheetRowToUpdate(allBookings, booking)).toBe(-1);
  });

  it('returns -1 if booking is missing required fields', () => {
    const allBookings = [
      { ...baseBooking },
    ];
    const booking = { bookingID: 'Cedar-2025-08-01-2025-08-05' }; // missing roomName, checkInDate, checkOutDate
    expect(findSheetRowToUpdate(allBookings, booking)).toBe(-1);
  });

  it('returns correct index when all fields match and there are extra fields', () => {
    const allBookings = [
      { ...baseBooking, extra: 'foo' },
      { ...baseBooking, extra: 'bar' },
    ];
    const booking = { ...baseBooking };
    expect(findSheetRowToUpdate(allBookings, booking)).toBe(1);
  });
});

describe('convertBookingToSheetsRecord', () => {
  it('should convert a complete booking object to an array in correct order', () => {
    const booking = {
      roomName: 'Cedar',
      customerName: 'John Doe',
      contactNumber: '1234567890',
      numberOfPeople: 2,
      checkInDate: '2025-08-01',
      checkOutDate: '2025-08-05',
      numberOfNights: 4,
      status: 'Confirmed',
      bookingDate: '2025-07-30',
      sourceOfBooking: 'Website',
      roomAmount: 5000,
      advancePaid: 1000,
      advancePaidTo: 'John',
      food: 500,
      campFire: 200,
      otherServices: 100,
      balanceToPay: 4000,
      totalAmount: 5800,
      commission: 10,
      twwRevenue: 5200,
      balancePaidTo: 'Jane',
      bookingID: 'Cedar-2025-08-01-2025-08-05',
      remarks: 'No remarks'
    };
    const result = convertBookingToSheetsRecord(booking);
    expect(result).toEqual([
      'Cedar', 'John Doe', '1234567890', 2, '2025-08-01', '2025-08-05', 4, 'Confirmed', '2025-07-30', 'Website',
      5000, 1000, 'John', 0, 500, 200, 0, 0, 100, 4000, 5800, 10, 5200, 'Jane', 'Cedar-2025-08-01-2025-08-05', 'No remarks'
    ]);
  });

  it('should handle missing optional fields and use undefined/null values', () => {
    const booking = {
      roomName: 'Pine',
      customerName: 'Jane Doe',
      contactNumber: '9876543210',
      numberOfPeople: 1,
      checkInDate: '2025-09-01',
      checkOutDate: '2025-09-03',
      numberOfNights: 2,
      status: 'Cancelled',
      bookingDate: '2025-08-30',
      sourceOfBooking: 'Phone',
      roomAmount: 3000,
      advancePaid: 0,
      advancePaidTo: '',
      // food, campFire, otherServices, balanceToPay, totalAmount, commission, twwRevenue, balancePaidTo, remarks missing
      bookingID: 'Pine-2025-09-01-2025-09-03',
    };
    const result = convertBookingToSheetsRecord(booking);
    expect(result).toEqual([
      'Pine', 'Jane Doe', '9876543210', 1, '2025-09-01', '2025-09-03', 2, 'Cancelled', '2025-08-30', 'Phone',
      3000, 0, '', 0, undefined, undefined, 0, 0, undefined, undefined, undefined, undefined, undefined, undefined, 'Pine-2025-09-01-2025-09-03', undefined
    ]);
  });

  it('should return correct array length (26 fields)', () => {
    const booking = {};
    const result = convertBookingToSheetsRecord(booking);
    expect(result.length).toBe(26);
  });

  it('should place placeholders (0) at correct indices', () => {
    const booking = {
      roomName: 'Tent',
      customerName: 'Sam',
      contactNumber: '5555555555',
      numberOfPeople: 3,
      checkInDate: '2025-10-01',
      checkOutDate: '2025-10-04',
      numberOfNights: 3,
      status: 'Available',
      bookingDate: '2025-09-29',
      sourceOfBooking: 'Agent',
      roomAmount: 4000,
      advancePaid: 500,
      advancePaidTo: 'Sam',
      food: 300,
      campFire: 150,
      otherServices: 50,
      balanceToPay: 3500,
      totalAmount: 4000,
      commission: 5,
      twwRevenue: 3800,
      balancePaidTo: 'Sam',
      bookingID: 'Tent-2025-10-01-2025-10-04',
      remarks: 'Tent booking'
    };
    const result = convertBookingToSheetsRecord(booking);
    // Check placeholders
    expect(result[13]).toBe(0); // room balance
    expect(result[16]).toBe(0); // heater
    expect(result[17]).toBe(0); // safari
  });

  it('should handle null values gracefully', () => {
    const booking = {
      roomName: null,
      customerName: null,
      contactNumber: null,
      numberOfPeople: null,
      checkInDate: null,
      checkOutDate: null,
      numberOfNights: null,
      status: null,
      bookingDate: null,
      sourceOfBooking: null,
      roomAmount: null,
      advancePaid: null,
      advancePaidTo: null,
      food: null,
      campFire: null,
      otherServices: null,
      balanceToPay: null,
      totalAmount: null,
      commission: null,
      twwRevenue: null,
      balancePaidTo: null,
      bookingID: null,
      remarks: null
    };
    const result = convertBookingToSheetsRecord(booking);
    expect(result).toEqual([
      null, null, null, null, null, null, null, null, null, null,
      null, null, null, 0, null, null, 0, 0, null, null, null, null, null, null, null, null
    ]);
  });
});