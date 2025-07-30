/**
 * Validates a booking object to ensure all required fields are present and that the check-out date is after the check-in date.
 *
 * @param {object} booking - The booking object to validate.
 * @param {string} booking.customerName - The name of the customer.
 * @param {string} booking.checkInDate - The check-in date.
 * @param {string} booking.checkOutDate - The check-out date.
 * @param {string} booking.contactNumber - The contact number of the customer.
 * @returns {Array<string>} An array of error messages. If the array is empty, the booking is valid.
 */
export const validateBooking = (booking) => {
    const errors = [];

    // Check required fields
    if (!booking.customerName) {
        errors.push('Customer Name is required');
    }
    if (!booking.checkInDate) {
        errors.push('Check-in Date is required');
    }
    if (!booking.checkOutDate) {
        errors.push('Check-out Date is required');
    }
    if (!booking.contactNumber) {
        errors.push('Contact Number is required');
    }

    // Check date validity
    if (new Date(booking.checkInDate) >= new Date(booking.checkOutDate)) {
        errors.push('Check-out Date must be after Check-in Date');
    }

    return errors;
};

/**
 * Converts a booking object into an array suitable for writing to a Google Sheet.
 *
 * @param {object} booking - The booking object to convert.
 * @param {string} booking.roomName - The name of the room.
 * @param {string} booking.customerName - The name of the customer.
 * @param {string} booking.contactNumber - The contact number of the customer.
 * @param {number} booking.numberOfPeople - The number of people in the booking.
 * @param {string} booking.checkInDate - The check-in date.
 * @param {string} booking.checkOutDate - The check-out date.
 * @param {number} booking.numberOfNights - The number of nights booked.
 * @param {string} booking.status - The status of the booking.
 * @param {string} booking.bookingDate - The date the booking was made.
 * @param {string} booking.sourceOfBooking - The source of the booking.
 * @param {number} booking.roomAmount - The amount charged for the room.
 * @param {number} booking.advancePaid - The amount of advance paid.
 * @param {string} booking.advancePaidTo - The recipient of the advance payment.
 * @param {number} booking.food - The amount charged for food.
 * @param {number} booking.campFire - The amount charged for campfire.
 * @param {number} booking.otherServices - The amount charged for other services.
 * @param {number} booking.balanceToPay - The remaining balance to pay.
 * @param {number} booking.totalAmount - The total amount for the booking.
 * @param {number} booking.commission - The commission earned on the booking.
 * @param {number} booking.twwRevenue - The revenue for The Westwood on the booking.
 * @param {string} booking.balancePaidTo - The recipient of the balance payment.
 * @param {string} booking.bookingID - The unique identifier for the booking.
 * @param {string} booking.remarks - Any remarks or notes about the booking.
 * @returns {Array<string|number>} An array of booking details suitable for writing to a Google Sheet.
 */
export const convertBookingToSheetsRecord = (booking) => {
    return [
        booking.roomName,
        booking.customerName,
        booking.contactNumber,
        booking.numberOfPeople,
        booking.checkInDate,
        booking.checkOutDate,
        booking.numberOfNights,
        booking.status,
        booking.bookingDate,
        booking.sourceOfBooking,
        booking.roomAmount,
        booking.advancePaid,
        booking.advancePaidTo,
        0, // Placeholder for room balance
        booking.food,
        booking.campFire,
        0, // Placeholder for heater
        0, // Placeholder for safari
        booking.otherServices,
        booking.balanceToPay,
        booking.totalAmount,
        booking.commission,
        booking.twwRevenue,
        booking.balancePaidTo,
        booking.bookingID,
        booking.remarks
    ];
}

/**
 * Finds the row index of a booking in an array of all bookings, based on matching booking ID, room name, check-in date, and check-out date.
 *
 * @param {Array<object>} allBookings - An array of all booking objects to search through.
 * @param {string} booking.bookingID - The unique identifier for the booking.
 * @param {string} booking.roomName - The name of the room.
 * @param {string} booking.checkInDate - The check-in date.
 * @param {string} booking.checkOutDate - The check-out date.
 * @returns {number} The index of the booking in the array, or -1 if not found.
 */
export const findSheetRowToUpdate = (allBookings, booking) => {
    let rowIndex = -1;
    //Find the booking row by booking ID and room name and checkin date    
    allBookings.forEach((iBooking, index) => {
        if (iBooking.bookingID == booking.bookingID &&
            iBooking.roomName === booking.roomName &&
            iBooking.checkInDate === booking.checkInDate &&
            iBooking.checkOutDate === booking.checkOutDate) {
            rowIndex = index;
            console.log(`Found booking at row index: ${rowIndex + 1}`);
        }
    });
    return rowIndex;
}