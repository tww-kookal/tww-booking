
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
