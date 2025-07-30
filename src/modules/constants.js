import { SHEET_ID } from '../config';

/**
 * @constant {object} BOOKING_DEFAULT - Default values for a booking.
 * @property {string} BOOKING_DATE - The default booking date, set to today's date in ISO format.
 * @property {string} ROOM_NAME - The default room name, set to 'Cedar'.
 * @property {string} STATUS - The default booking status, set to 'Confirmed'.
 */
export const BOOKING_DEFAULT = {
    BOOKING_DATE: new Date().toISOString().split('T')[0],
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
    roomName: BOOKING_DEFAULT.ROOM_NAME,
    customerName: '',
    contactNumber: '',
    numberOfPeople: 0,
    checkInDate: '',
    checkOutDate: '',
    numberOfNights: 0,
    status: BOOKING_DEFAULT.STATUS,
    bookingDate: BOOKING_DEFAULT.BOOKING_DATE,
    sourceOfBooking: '',
    roomAmount: 0,
    advancePaid: 0,
    advancePaidTo: '',
    food: 0,
    campFire: 0,
    otherServices: 0,
    balanceToPay: 0,
    totalAmount: 0,
    commission: 0,
    twwRevenue: 0,
    balancePaidTo: '',
    bookingID: '',
    remarks: ''
}

/**
 * @constant {string} RANGE - The range of cells in the Google Sheet to read data from.
 */
export const RANGE = "Sheet1!A2:Z"; // Adjust range

/**
 * @constant {string} SHEET_ID - The ID of the Google Sheet.
 */
export { SHEET_ID };

/**
 * @constant {Array<string>} roomOptions - An array of available room options.
 */
export const roomOptions = ['Cedar', 'Pine', 'Teak', 'Maple', 'Tent'];

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
export const statusOptions = ['Confirmed', 'Cancelled'];

/**
 * @constant {Array<string>} sourceOptions - An array of available source options.
 */
export const sourceOptions = [
    'Sangeetha', 'Pranav', 'RK', 'Balan', 'Walkin',
    'MMT', 'Agoda', 'Booking.com', 'Ganesh Agent', 'Kodai Guest'
];

