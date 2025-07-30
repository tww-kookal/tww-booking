import { validateBooking } from '../../src/modules/booking.module';

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