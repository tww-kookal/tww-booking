
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