import dayjs from "dayjs";

/**
 * @constant {object} BOOKING_DEFAULT - Default values for a booking.
 * @property {string} BOOKING_DATE - The default booking date, set to today's date in ISO format.
 * @property {string} ROOM_NAME - The default room name, set to 'Cedar'.
 * @property {string} STATUS - The default booking status, set to 'Confirmed'.
 */
export const BOOKING_DEFAULT = {
    BOOKING_DATE: new Date().toISOString().split('T')[0],
    CHECK_IN: new dayjs().format('YYYY-MM-DD'),
    CHECK_OUT: new dayjs().add(1, 'day').format('YYYY-MM-DD'),
    NUMBER_OF_NIGHTS: 1,
    ROOM_NAME: 'Cedar',
    STATUS: 'Confirmed'
}

/**
 * @constant {object} DEFAULT_BOOKING - Default booking object with initial values for all properties.
 * @property {string} roomName - The name of the room, default is BOOKING_DEFAULT.ROOM_NAME.
 * @property {string} customerName - The name of the customer, default is an empty string.
 * @property {string} contactNumber - The contact number of the customer, default is an empty string.
 * @property {number} numberOfPeople - The number of people in the booking, default is 0.
 * @property {string} checkInDate - The check-in date, default is an empty string.
 * @property {string} checkOutDate - The check-out date, default is an empty string.
 * @property {number} numberOfNights - The number of nights booked, default is 0.
 * @property {string} status - The status of the booking, default is BOOKING_DEFAULT.STATUS.
 * @property {string} bookingDate - The date the booking was made, default is BOOKING_DEFAULT.BOOKING_DATE.
 * @property {string} sourceOfBooking - The source of the booking, default is an empty string.
 * @property {number} roomAmount - The amount charged for the room, default is 0.
 * @property {number} advancePaid - The amount of advance paid, default is 0.
 * @property {string} advancePaidTo - The recipient of the advance payment, default is an empty string.
 * @property {number} food - The amount charged for food, default is 0.
 * @property {number} campFire - The amount charged for campfire, default is 0.
 * @property {number} otherServices - The amount charged for other services, default is 0.
 * @property {number} balanceToPay - The remaining balance to pay, default is 0.
 * @property {number} totalAmount - The total amount for the booking, default is 0.
 * @property {number} commission - The commission earned on the booking, default is 0.
 * @property {number} twwRevenue - The revenue for The Westwood on the booking, default is 0.
 * @property {string} balancePaidTo - The recipient of the balance payment, default is an empty string.
 * @property {string} bookingID - The unique identifier for the booking, default is an empty string.
 * @property {string} remarks - Any remarks or notes about the booking, default is an empty string.
 */
export const DEFAULT_BOOKING = {
    booked_by_id: 0, 
    booking_id: 0,
    room_id: 0,
    customer_id: 0,
    number_of_people: 0,
    check_in: BOOKING_DEFAULT.CHECK_IN,
    check_out: BOOKING_DEFAULT.CHECK_OUT,
    number_of_nights: BOOKING_DEFAULT.NUMBER_OF_NIGHTS,
    status: BOOKING_DEFAULT.STATUS,
    booking_date: BOOKING_DEFAULT.BOOKING_DATE,
    source_of_booking_id: 0,
    room_price: 0,
    food_price: 0,
    service_price: 0,
    tax_percent:0,
    tax_price:0,
    discount_price: 0,
    total_price: 0,
    commission_percent: 0,
    commission: 0,
    is_commission_settled: false,
    remarks: ''
}

/**
 * @constant {Array<string>} roomOptions - An array of available room options.
 */
export const roomOptions = ['Cedar', 'Pine', 'Teak', 'Maple', 'Tent'];
export const PAYMENT_TYPE = [{ id: 'cash', value: 'Cash' }, { id: 'cc', value: 'Credit Card' }, { id: 'dc', value: 'Debit Card' }, { id: 'gpay', value: 'Google Pay' }, { id: 'upi', value: 'UPI' }, { id: 'bank', value: 'Bank' }]
export const ROOM_NAMES = roomOptions
export const USER_TYPES = ['BACK-OFFICE', 'BOOKING-AGENT', 'COMPANY', 'CONTRACTOR', 'CUSTOMER', 'CXO', 'EMPLOYEE', 'PARTNER', 'VENDOR']
export const REFUND_TO_GUEST = 'Refund to Guest'; // for Booking & Payments in booking where to hard code as they behave differently

/**
 * @constant {object} roomAvailabilityStatusColors - An object mapping booking statuses to their corresponding colors.
 * @property {string} Confirmed - Hex color code for 'Confirmed' status.
 * @property {string} Cancelled - Hex color code for 'Cancelled' status.
 * @property {string} Available - Hex color code for 'Available' status.
 * @property {string} Closed - Hex color code for 'Closed' status.
 */
export const roomAvailabilityStatusColors = {
    Confirmed: '#007bff', // blue
    Cancelled: '#fd7e14', // orange
    Available: '#28a745', // green
    Closed: '#6c757d', // gray
};

/**
 * @constant {Array<string>} statusOptions - An array of available status options.
 */
export const statusOptions = ['confirmed', 'cancelled'];

export const BOOKING_STATUS = {
    'CONFIRMED': 'confirmed',
    'CANCELLED': 'cancelled',
    'AVAILABLE': 'available',
    'CLOSED': 'closed',
    'BOOKED': 'booked',
    'PENDING': 'pending',
    'PAID': 'paid',
    'UNPAID': 'unpaid',
    'REFUNDED': 'refunded',
    'CHECKED_IN': 'checked_in',
    'BOOKED': 'booked'
}


/**
 * @constant {Array<string>} sourceOptions - An array of available source options.
 */
export const sourceOptions = [
    'Sangeetha', 'Pranav', 'RK', 'Balan', 'Walkin',
    'MMT', 'Agoda', 'Booking.com', 'Ganesh Agent', 'Kodai Guest'
];

