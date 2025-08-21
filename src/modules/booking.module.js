import dayjs from 'dayjs';
import api from './apiClient';
import { FOLDER_ID } from '../modules/config';
import { getUserContext } from '../contexts/constants';

/**
 * Loads all bookings from the server.
 *
 * @async
 * @returns {Promise<Array<Booking>>} A promise that resolves to an array of booking objects.
 */
export const getAllBookings = async (navigate, startingDate = dayjs().format("YYYY-MM-DD"), loadAttachments = false) => {
    console.log("Booking.Module::getAllBookings::Fetching all bookings since", startingDate);
    try {
        const response = await api.get("/booking/listBookingsByCheckInDate/" + startingDate || dayjs().format('YYYY-MM-DD'));
        const sortedBookings = (response.data.bookings || []).sort((a, b) => {
            return a.check_in.localeCompare(b.check_in);
        });
        console.log("Booking.Module::getAllBookings::Fetched all bookings", sortedBookings.length);
        return sortedBookings
    } catch (error) {
        console.error("Booking.Module::getAllBookings::Error fetching all bookings", error);
        console.error("BBBBBB :::: ", error?.code)
        if (error?.code == 'ERR_NETWORK') {
            navigate('/login')
        }
        return []
    }
}


/**
 * Loads the attachments for all booking if available else returns an empty array
 */
export const getAllBookingsWithAttachments = async (navigate, startingDate = dayjs().format("YYYY-MM-DD"), loadAttachments = false) => {
    let bookings = await getAllBookings(navigate, startingDate, loadAttachments);
    return await getAttachmentForBookings(bookings, loadAttachments);
}

/**
 * Loads the attachments for all booking if available else returns an empty array
 */
export const getAttachmentForBookings = async (bookings, loadAttachments = false) => {
    for (let booking of bookings) {
        booking.attachments = await fetchAttachments(booking.booking_id, loadAttachments);
    }
    return bookings;
}

/**
 * Loads the attachments for a booking if available else returns an empty array
 */
export const fetchAttachments = async (booking_id, loadAttachments = false) => {

    const res = await fetch(
        `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents`,
        { headers: { Authorization: `Bearer ${getUserContext().token}` } }
    );
    const files = await res.json();
    if (files?.files) {
        let fileIds = files.files
            .filter(file => file.name == booking_id)
            .map(file => ({
                file_name: file.name,
                file_id: file.id,
            }));
        if (fileIds && loadAttachments == false && fileIds.length == 1 ){
            return [{
                file_name: booking_id,
                file_id: booking_id,
                file_url: booking_id,
                file_type: booking_id,
                file_content: booking_id,
                file_size: booking_id,
            }]
        }

        if (fileIds && fileIds.length == 1 && loadAttachments) {
            let attachments = await fetch(
                `https://www.googleapis.com/drive/v3/files?q='${fileIds[0].file_id}'+in+parents&fields=files(id,name,mimeType,webViewLink,webContentLink)`,
                { headers: { Authorization: `Bearer ${getUserContext().token}` } }
            );
            let attachmentFiles = await attachments.json();
            console.log("attachments :: ", attachmentFiles)
            return attachmentFiles.files.map(file => ({
                file_name: file.name,
                file_id: file.id,
                file_url: file.webViewLink,
                file_type: file.mimeType,
                file_content: file.webContentLink,
                file_size: file.size,

            }))
        }

    }
    return []
}

/**
 * Loads all bookings from the server.
 *
 * @async
 * @returns {Promise<<Booking>} A promise that resolves to an array of booking objects.
 */
export const getBooking = async (navigate, booking_id = 0) => {
    console.log("Booking.Module::getBooking::Fetching booking with id", booking_id);
    try {
        const response = await api.get("/booking/byID/" + booking_id);
        console.log("Booking.Module::getBooking::Fetched booking", response.data?.booking);
        return response.data?.booking
    } catch (error) {
        console.log("Booking.Module::getBooking::Error fetching booking", error);
        if (error?.code == 'ERR_NETWORK') {
            navigate('/login')
        }
        throw error
    }
}

/**
 * Loads all rooms from the server.
 *
 * @async
 * @returns {Promise<Array<Room>>} A promise that resolves to an array of booking objects.
 */
export const getAllRooms = async (navigate,) => {
    try {
        const response = await api.get("/rooms/");
        console.log("Booking.Module::getAllRooms::Fetched all rooms", response.data);
        return response.data?.rooms || [];
    } catch (error) {
        console.error("Booking.Module::getAllRooms::Error fetching all rooms", error);
        if (error?.code == 'ERR_NETWORK') {
            navigate('/login')
        }
        return []
    }
}

/**
 * get the number of guests for the day
 *
 * @async
 * @returns {Promise<Array<Booking>>} A promise that resolves to an array of booking objects.
 */
export const getGuestsForDay = async (navigate, startingDate = dayjs().format("YYYY-MM-DD")) => {
    try {
        const response = await api.get("/booking/guestsForDay/" + startingDate || dayjs().format('YYYY-MM-DD'));
        const guestsForDay = response.data || 0;
        return guestsForDay
    } catch (error) {
        console.error("Booking.Module::getGuestsForDay::Error fetching guests for day", error);
        console.error("BBBBBBGGGGG :::: ", error?.code)
        if (error?.code == 'ERR_NETWORK') {
            navigate('/login')
        }

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

export const createNewBooking = async (navigate, booking) => {
    try {
        const res = await api.post("/booking/createBooking", booking);
        console.log("Booking.Module::createNewBooking::Created new booking", res);
        return res.data?.booking;
    } catch (error) {
        if (error?.code == 'ERR_NETWORK') {
            navigate('/login')
        }
        throw error
    }
}

export const updateBooking = async (navigate, booking) => {
    // remove the advance_paid_to_user from the booking object
    delete booking.balance_paid_to_user;
    delete booking.advance_paid_to_user;
    delete booking.contact_email;
    delete booking.contact_number;
    delete booking.customer_name;
    delete booking.room_name;
    delete booking.source_of_booking;
    delete booking.final_price_paid_to_id;

    const res = await api.post("/booking/updateBooking", booking);
    console.log("Booking.Module::updateBooking::Updated booking", res);
    return res.data?.booking;
}

export const getPaymentsForBooking = async (navigate, booking_id) => {
    try {
        const response = await api.get("/payment/forBookingID/" + booking_id);
        console.log("Booking.Module::getPaymentsForBooking::Fetched payments for booking", response.data);
        return response.data?.payments || [];
    } catch (error) {
        console.error("Booking.Module::getPaymentsForBooking::Error fetching payments for booking", error);
        if (error?.code == 'ERR_NETWORK') {
            navigate('/login')
        }
        return []
    }
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
                                    <td>${booking.customer_phone}</td>
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
                                    <td>₹${booking.food_price}</td>
                                </tr>` : ''}
                                ${booking.campFire > 0 ? `<tr>
                                    <th>Camp Fire:</th>
                                    <td>₹${booking.service_price}</td>
                                </tr>` : ''}
                                <tr>
                                    <th>Advance Paid:</th>
                                    <td>₹${booking.advance_payment}</td>
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

