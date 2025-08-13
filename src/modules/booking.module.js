
import dayjs from 'dayjs';
import api from './apiClient';

/**
 * Loads all bookings from the server.
 *
 * @async
 * @returns {Promise<Array<Booking>>} A promise that resolves to an array of booking objects.
 */
export const getAllBookings = async (startingDate = dayjs().format("YYYY-MM-DD")) => {
    console.log("Booking.Module::getAllBookings::Fetching all bookings since", startingDate);
    try {
        const response = await api.get("/rooms/listAllBookings/" + startingDate || dayjs().format('YYYY-MM-DD'));
        const sortedBookings = (response.data.bookings || []).sort((a, b) => {
            return a.check_in.localeCompare(b.check_in);
        });
        console.log("Booking.Module::getAllBookings::Fetched all bookings", sortedBookings.length);
        return sortedBookings
    } catch (error) {
        console.log("Booking.Module::getAllBookings::Error fetching all bookings", error);
        return []
    }
}

/**
 * Loads all rooms from the server.
 *
 * @async
 * @returns {Promise<Array<Room>>} A promise that resolves to an array of booking objects.
 */
export const getAllRooms = async () => {
    try {
        const response = await api.get("/rooms/");
        console.log("Booking.Module::getAllRooms::Fetched all rooms", response.data);
        return response.data?.rooms || [];
    } catch (error) {
        console.error("Booking.Module::getAllRooms::Error fetching all rooms", error);
        return []
    }
}

/**
 * get the number of guests for the day
 *
 * @async
 * @returns {Promise<Array<Booking>>} A promise that resolves to an array of booking objects.
 */
export const getGuestsForDay = async (startingDate = dayjs().format("YYYY-MM-DD")) => {
    try {
        const response = await api.get("/rooms/guestsForDay/" + startingDate || dayjs().format('YYYY-MM-DD'));
        const guestsForDay = response.data || 0;
        return guestsForDay
    } catch (error) {
        console.error("Booking.Module::getGuestsForDay::Error fetching guests for day", error);
        return 0
    }
}

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
    console.log("booking.customer_id", booking.customer_id)
    if (!booking.customer_id && booking.customer_id !== 0) {
        errors.push('Select a Guest / Customer');
    }
    if (!booking.check_in) {
        errors.push('Check-in Date is required');
    }
    if (!booking.check_out) {
        errors.push('Check-out Date is required');
    }

    // Check date validity
    if (new Date(booking.check_in) >= new Date(booking.check_out)) {
        errors.push('Check-out Date must be after Check-in Date');
    }

    return errors;
};

export const createNewBooking = async (booking) => {
    const res = await api.post("/rooms/bookRoom", booking);
    console.log("Booking.Module::createNewBooking::Created new booking", res);
    return res.data?.booking;
}

export const handleGenerateReceipt = (booking) => {
    // Create a printable receipt
    const receiptWindow = window.open('', '_blank');

    receiptWindow.document.write(`
            <html>
                <head>
                    <title>Booking Receipt - ${booking.customerName}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                        .receipt { max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #ccc; }
                        .header { text-align: center; margin-bottom: 20px; }
                        .booking-details { margin-bottom: 20px; }
                        .booking-details table { width: 100%; border-collapse: collapse; }
                        .booking-details th, .booking-details td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
                        .financial-summary { margin-top: 30px; border-top: 2px solid #333; padding-top: 20px; }
                        .total { font-weight: bold; }
                        @media print { .no-print { display: none; } }
                    </style>
                </head>
                <body>
                    <div class="receipt">
                        <div class="header">
                            <h1>The Westwood</h1>
                            <h2>Booking Receipt</h2>
                        </div>
                        
                        <div class="booking-details">
                            <h3>Booking Information</h3>
                            <table>
                                <tr>
                                    <th>Booking ID:</th>
                                    <td>${booking.booking_id}</td>
                                </tr>
                                <tr>
                                    <th>Customer Name:</th>
                                    <td>${booking.customer_name}</td>
                                </tr>
                                <tr>
                                    <th>Room:</th>
                                    <td>${booking.room_name}</td>
                                </tr>
                                <tr>
                                    <th>Check-in Date:</th>
                                    <td>${booking.check_in}</td>
                                </tr>
                                <tr>
                                    <th>Check-out Date:</th>
                                    <td>${booking.check_out}</td>
                                </tr>
                                <tr>
                                    <th>Number of Nights:</th>
                                    <td>${booking.number_of_nights}</td>
                                </tr>
                                <tr>
                                    <th>Number of People:</th>
                                    <td>${booking.number_of_people}</td>
                                </tr>
                                <tr>
                                    <th>Contact Number:</th>
                                    <td>${booking.contact_number}</td>
                                </tr>
                                <tr>
                                    <th>Status:</th>
                                    <td>${booking.status}</td>
                                </tr>
                            </table>
                        </div>
                        
                        <div class="financial-summary">
                            <h3>Financial Summary</h3>
                            <table>
                                <tr>
                                    <th>Room Amount:</th>
                                    <td>₹${booking.room_price}</td>
                                </tr>
                                ${booking.food > 0 ? `<tr>
                                    <th>Food:</th>
                                    <td>₹${booking.food}</td>
                                </tr>` : ''}
                                ${booking.campFire > 0 ? `<tr>
                                    <th>Camp Fire:</th>
                                    <td>₹${booking.camp_fire}</td>
                                </tr>` : ''}
                                <tr>
                                    <th>Advance Paid:</th>
                                    <td>₹${booking.advance_paid}</td>
                                </tr>
                                <tr class="total">
                                    <th>Balance to Pay:</th>
                                    <td>₹${booking.balance_to_pay}</td>
                                </tr>
                            </table>
                        </div>
                        
                        <div class="footer" style="margin-top: 40px; text-align: center;">
                            <p>Thank you for choosing The Westwood!</p>
                            <p>For any inquiries, please contact us.</p>
                        </div>
                        
                        <div class="no-print" style="margin-top: 30px; text-align: center;">
                            <button onclick="window.print()">Print Receipt</button>
                        </div>
                    </div>
                </body>
            </html>
        `);

    receiptWindow.document.close();
};

