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
    console.debug("Booking.Module::getAllBookings::Fetching all bookings since", startingDate);
    try {
        const response = await api.get("/booking/listBookingsByCheckInDate/" + startingDate || dayjs().format('YYYY-MM-DD'));
        const sortedBookings = (response.data.bookings || []).sort((a, b) => {
            return a.check_in.localeCompare(b.check_in);
        });
        console.debug("Booking.Module::getAllBookings::Fetched all bookings", sortedBookings.length);
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
        if (fileIds && loadAttachments == false && fileIds.length == 1) {
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
    console.debug("Booking.Module::getBooking::Fetching booking with id", booking_id);
    try {
        const response = await api.get("/booking/byID/" + booking_id);
        console.debug("Booking.Module::getBooking::Fetched booking");
        return response.data?.booking
    } catch (error) {
        console.error("Booking.Module::getBooking::Error fetching booking", error);
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
        console.debug("Booking.Module::getAllRooms::Fetched all rooms");
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
    console.debug("booking.customer_id", booking.customer_id)
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
        console.debug("Booking.Module::createNewBooking::Created new booking");
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
    console.debug("Booking.Module::updateBooking::Updated booking");
    return res.data?.booking;
}

export const getPaymentsForBooking = async (navigate, booking_id) => {
    try {
        const response = await api.get("/payment/forBookingID/" + booking_id);
        console.debug("Booking.Module::getPaymentsForBooking::Fetched payments for booking");
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
                    <title>Booking Receipt - ${booking.customer_name}</title>
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
                    <div ref={contentRef} style={{ width: '97%', padding: '20px', marginTop: '20px', border: '1px solid #ccc' }}>
                        <table style={{ borderWidth: 0, width: '100%' }} >
                        <tr style={{ width: '100%' }}>
                            <td style={{ width: '50%' }}>
                                <big><big><big><big><big><big>Host Receipt</big></big></big></big></big></big>
                                <br />
                                <label>Booking ID - <strong>${booking.booking_id}</strong></label>
                                <br />
                                <label>Booking Date - ${dayjs(booking.booking_date, 'YYYY-MM-DD').format('MMM DD, YYYY')} </label>                                
                            </td>
                            <td align="right">
                                <img src="./images/westwoodlogo2.png" style={{ width: '50%', height: '50%' }} alt="The Westwood"></img>
                                <br />
                                Survey No 380, Kookal Main Road,
                                <br />
                                Kookal, Kodaikanal, Tamilnadu
                                <br />
                                thewestwood.kookal@gmail.com
                                <br />
                                https://www.thewestwood.in/
                                <br />
                                For Bookings: 98848 55014
                                <br />
                                Care Taker: 98848 55041
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                            <hr />
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2"><label><strong>Dear ${booking.customer_name},</strong></label></td>
                        </tr>
                        <tr>
                            <td colspan="2"><label>The Westwood has received a booking at our property as per the details below.
                            Kindly carry this e-voucher while check in.</label></td>
                        </tr>
                        <tr>
                            <td colspan="2"><label>&nbsp;</label></td>
                        </tr>
<!--                         <tr>
                            <td colspan="2"><label>For your reference, Booking ID is <strong>${booking.booking_id}.</strong></label>
                            </td>
                        </tr>
 -->                        <tr>
                            <td colspan="2"><label><strong>Total amount payable for this booking is INR ${booking.total_price}/- as per
                            the details below.</strong></label></td>
                        </tr>
                        <tr>
                            <td colspan="2"><label>Kindly consider this e-voucher for booking confirmation with the following
                            inclusions and services.</label></td>
                        </tr>
                        <tr>
                            <td colspan="2">
                            <hr />
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                            <center>
                                <table width="98%">

                                <tr>
                                    <td><label><strong>Payment Breakup</strong></label></td>
                                    <td align="right"><small><font style={{ color: 'darkgray' }}>All prices indicated below are in INR </font></small></td>
                                </tr>
                                <tr>
                                    <td colspan="2"><font style={{ color: 'darkgray' }}>TARRIF</font></td>
                                </tr>
                                <tr>
                                    <td><label>
                                    Property Sell Price<br />
                                    <font style={{ color: 'darkgray' }}>${1} Room(s) x ${booking.number_of_nights} Night(s)</font>
                                    </label></td>
                                    <td align="right"> &nbsp;<br />${booking.total_price} </td>
                                </tr>
                                <tr>
                                    <td colspan="2">
                                    <hr />
                                    </td>
                                </tr>
                                <!-- <tr>
                                    <td><label>Extra Adult / Child Charges</label></td>
                                    <td align="right"> {formData.extraChildren} </td>
                                </tr>
                                <tr>
                                    <td colspan="2">
                                    <hr />
                                    </td>
                                </tr> -->
                                <tr>
                                    <td><label>Voluntary Property Driven
                                    Coupon Discount </label></td>
                                    <td align="right"> ${booking.discount || 0} </td>
                                </tr>
                                <tr>
                                    <td colspan="2">
                                    <hr />
                                    </td>
                                </tr>
                                <tr>
                                    <td><label>Effective Property Sell Price</label></td>
                                    <td align="right"> ${booking.total_price} </td>
                                </tr>
                                <tr>
                                    <td colspan="2">
                                    <hr />
                                    </td>
                                </tr>
                                <tr>
                                    <td><label>Property Gross Charges </label></td>
                                    <td align="right"> ${booking.total_price} </td>
                                </tr>
                                <tr>
                                    <td colspan="2">
                                    <hr />
                                    </td>
                                </tr>
                                <tr>
                                    <td><label>Agent Commission</label></td>
                                    <td align="right"> ${booking.commission || 0} </td>
                                </tr>
                                <tr>
                                    <td colspan="2">
                                    <hr />
                                    </td>
                                </tr>
                                <!-- <tr>
                                    <td><label>GST @ 18%</label><br /><font style={{ color: 'darkgray' }}>(Including IGST or (SGST & CGST))</font></td>
                                    <td align="right"> {gst} </td>
                                </tr>
                                <tr>
                                    <td colspan="2">
                                    <hr />
                                    </td>
                                </tr> 
                                <tr>
                                    <td><label>Property discount including tax considered in
                                    coupon promotion</label></td>
                                    <td align="right"> {formData.propertyDiscount} </td>
                                </tr>
                                <tr>
                                    <td colspan="2">
                                    <hr />
                                    </td>
                                </tr> -->
                                <tr>
                                    <td><label>Total</label></td>
                                    <td align="right"> ${booking.total_price} </td>
                                </tr>
                                <tr>
                                    <td colspan="2">
                                    <hr />
                                    </td>
                                </tr>                                
                                <tr>
                                    <td colspan="2"><label><small><font style={{ color: 'darkgray' }}>Service Category - Reservation of property booking</font></small>
                                    </label></td>
                                </tr>
                                </table>
                            </center>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2"><hr /></td>
                        </tr>
                        <tr>
                            <td colspan="2"><big><stong><u>Booking Details</u></stong></big></td>
                        </tr>
                        <tr>
                            <td style={{ width: '25%' }}>
                            <big><stong><b>${booking.number_of_nights} </b>night(s) in <i><b>${booking.room_name}</b></i> for <b><i>${booking.number_of_people}</i></b> people</stong></big>
                            </td>
                            <td style={{ width: '75%' }}>
                            <table style={{ width: '100%;' }}>
                                <tr style={{ width: '100%;' }}>
                                <td style={{ width: '33%', textAlign: 'center' }}>
                                    <font style={{ color: 'darkgray' }}><big><stong>Check-In</stong></big></font>
                                </td>
                                <td style={{ width: '33%', textAlign: 'center' }}>

                                </td>
                                <td style={{ width: '33%', textAlign: 'center' }}>
                                    <font style={{ color: 'darkgray' }}><big><stong>Check-Out</stong></big></font>
                                </td>
                                </tr>
                                <tr>
                                <td style={{ width: '33%', textAlign: 'center' }}>
                                    ${dayjs(booking.check_in, 'YYYY-MM-DD').format('MMM DD, YYYY')} - ${'01:00 pm'}
                                </td>
                                <td style={{ width: '33%', textAlign: 'center' }}>
                                    <hr style={{ color: 'darkgray' }} />
                                </td>
                                <td style={{ width: '33%', textAlign: 'center' }}>
                                    ${dayjs(booking.check_out, 'YYYY-MM-DD').format('MMM DD, YYYY')} - ${'11:00 am'}
                                </td>
                                </tr>
                            </table>
                            </td>
                        </tr>
                        <tr>
                            <td ><b>Guest Name: </b> ${booking.customer_name} / ${booking.contact_number} </td>
                            <td ><stong>Identification Submitted: </stong>N/A </td>
                        </tr>
                        <tr>
                            <td colspan="2"><stong><b>Care Taker can be contacted in the premises at Ph: 98848 55041 / Extn: 701</b></stong></td>
                        </tr>
                        <tr><td colspan="2"><hr /></td></tr>
                        <tr>
                            <td colspan="2"><stong>Complimentary Breakfast is available for all days of the stay.  Pets are not allowed in the premises.</stong></td>
                        </tr>
                        <tr><td colspan="2"><hr /></td></tr>
                        <tr>
                            <td colspan="2">Thank you for choosing The Westwood!, We hope you have a great stay with us.</td>
                        </tr>
                        <tr>
                            <td colspan="2">For any inquiries, please contact us.</td>
                        </tr>
                        </table>
                    </div>                        
                    <div class="no-print" style={{width: '100%'}}>
                        <table style={{ borderWidth: 0, width: '100%' }} ><tr><td>
                            <button onclick="window.print()">Print Receipt</button>
                        </td></tr></table>
                    </div>
                </body>
            </html>
        `);

    receiptWindow.document.close();
};

