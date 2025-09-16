import dayjs from 'dayjs';
import api from './apiClient';
import { FOLDER_ID } from '../modules/config';
import { getUserContext } from '../contexts/constants';
import html2canvas from 'html2canvas';

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
    return await getAttachmentForBookings();
}

export const getAllAttachedBookings = async (navigate) => {
    const res = await fetch(
        `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents`,
        { headers: { Authorization: `Bearer ${getUserContext().token}` } }
    );
    const files = await res.json();
    console.debug("Booking.Module::getAllAttachedBookings::Fetched all bookings");
    return files;
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
    console.debug("Fetch Attachments ");
    const res = await fetch(
        `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents`,
        { headers: { Authorization: `Bearer ${getUserContext().token}` } }
    );
    const allAttachments = await res.json();
    console.debug("Booking.Module::fetchAttachments::Fetched all attachments");
    if (allAttachments?.files) {
        let attachmentForBooking = allAttachments.files
            .filter(file => file.name == booking_id)
            .map(file => ({
                file_name: file.name,
                file_id: file.id,
            }));
        if (attachmentForBooking && loadAttachments == false && attachmentForBooking.length > 0) {
            return [{
                file_name: booking_id,
                file_id: attachmentForBooking[0].file_id,
                file_url: booking_id,
                file_type: booking_id,
                file_content: booking_id,
                file_size: booking_id,
            }]
        }

        if (attachmentForBooking && attachmentForBooking.length > 0 && loadAttachments) {
            let attachments = await fetch(
                `https://www.googleapis.com/drive/v3/files?q='${attachmentForBooking[0].file_id}'+in+parents&fields=files(id,name,mimeType,webViewLink,webContentLink)`,
                { headers: { Authorization: `Bearer ${getUserContext().token}` } }
            );
            let attachmentFiles = await attachments.json();
            let attachmentsForBooking = attachmentFiles.files.map(file => ({
                file_name: file.name,
                file_id: file.id,
                folder_id: attachmentForBooking[0].file_id,
                file_url: file.webViewLink,
                file_type: file.mimeType,
                file_content: file.webContentLink,
                file_size: file.size,

            }));
            return attachmentsForBooking;
        }

    }
    return []
}

const createParentFolder = async (bookingId) => {
    const token = getUserContext().token;
    if (!token) {
        throw new Error('No authorization token available');
    }

    const metadata = {
        name: `${bookingId}`,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [FOLDER_ID] // Use your root folder ID or appropriate parent folder
    };

    try {
        const response = await fetch('https://www.googleapis.com/drive/v3/files', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(metadata)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error('Failed to create folder: ' + errorText);
        }

        const data = await response.json();
        console.debug("Parent folder created ....")
        return data.id; // Return the folder ID
    } catch (error) {
        console.error('Error creating parent folder:', error);
        throw error;
    }
}

export const uploadToDrive = async (file, bookingId, parent_folder_id) => {
    if (!file) {
        throw new Error('No file provided for upload');
    }

    const token = getUserContext().token;
    if (!token) {
        throw new Error('No authorization token available');
    }

    if (parent_folder_id == -999) {
        console.debug("Create Parent Folder ....")
        parent_folder_id = await createParentFolder(bookingId)
    }

    // Create metadata for the file
    const metadata = {
        name: file.name,
        mimeType: file.type,
        parents: [parent_folder_id] // Replace with your folder ID or use FOLDER_ID constant if available
    };

    // Prepare the multipart request body
    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const reader = new FileReader();

    return new Promise((resolve, reject) => {
        reader.onload = async (e) => {
            const contentType = file.type || 'application/octet-stream';
            const base64Data = btoa(
                new Uint8Array(e.target.result)
                    .reduce((data, byte) => data + String.fromCharCode(byte), '')
            );

            const multipartRequestBody =
                delimiter +
                'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
                JSON.stringify(metadata) +
                delimiter +
                'Content-Type: ' + contentType + '\r\n' +
                'Content-Transfer-Encoding: base64\r\n\r\n' +
                base64Data +
                closeDelimiter;

            try {
                const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                    method: 'POST',
                    headers: new Headers({
                        'Authorization': 'Bearer ' + token,
                        'Content-Type': 'multipart/related; boundary="' + boundary + '"'
                    }),
                    body: multipartRequestBody
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error('Upload failed: ' + errorText);
                }

                const data = await response.json();
                resolve({
                    ...data,
                    parent_folder_id: parent_folder_id,
                })
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
};


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
        const response = await api.get("/accounting/payment/forBookingID/" + booking_id);
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
    const paidSoFar = booking.payments ? booking.payments.reduce((acc, payment) => acc + ((payment.payment_for == 'refund') ? 0 : payment.payment_amount), 0) : 0;
    const balance = booking.total_price - paidSoFar;
    const paymentRows = booking.payments && booking.payments.length > 0 ? `
        <table width="100%">
            <tr>
                <td colspan="5"><font style={{ color: 'darkgray' }}><B><big>P A Y M E N T S</big></b></font></td>
            </tr>
            <tr>
                <td width="10%"><b>Date</b></td>
                <td width="10%"><b>For</b></td>
                <td width="10%"><b>Type</b></td>
                <td width="55%"><b>Remarks</b></td>
                <td width="15%" align="right"><b>Amount</b></td>
            ${booking.payments.map(payment => `                
                <tr>
                    <td>${dayjs(payment.payment_date).format('DD-MM-YY')}</td>
                    <td>${payment.acc_category_name}</td>
                    <td>${payment.payment_type}</td>
                    <td>${payment.remarks}</td>
                    <td align="right">${Math.round(payment.payment_amount)}</td>
                </tr>
            `).join('')}
            <tr><td colspan="5"><hr /></td></tr>
        </table>
    ` : '';
    receiptWindow.document.write(`
            <html>
                <head>
                    <title>Booking Receipt - ${booking.customer_name} ${booking.room_name}</title>
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
                    <script>
                        function downloadAsImage() {
                            const content = document.getElementById('booking_receipt_content');
                            html2canvas(content).then(canvas => {
                                const image = canvas.toDataURL('image/png');
                                const a = document.createElement('a');
                                a.href = image;
                                a.download = 'Booking Receipt - ${booking.customer_name} ${booking.room_name}.png';
                                a.click();
                            });
                        }
                    </script>
                </head>
                <body>
                    <div id ="booking_receipt_content" ref = {contentRef} style ={{
                            position: 'relative', // 🔑 Needed for absolute child centering\
                            display: 'grid',
                            width: '100%'

                    }}>
                        <div id="booking_receipt_content_inner" style == {{
                            position: 'absolute',
                            width: '90%'
                        }}>
                            <table style={{ borderWidth: 0, border: 0, width: '100%', align: 'center' }} >
                                <tr colspan = "2"><td>&nbsp;</td></tr>
                                <tr style={{ width: '100%'}}>
                                    <td style={{ width: '20%'}}>
                                        &nbsp;
                                    </td>
                                    <td style={{ width: '80%'}}>
                                        <table style={{ borderWidth: 0, border: 0, width: '100%', align: 'center' }} >
                                        <tr style={{ width: '100%', verticalAlign: 'bottom', textAlign: 'left' }}>
                                            <td style={{ width: '50%', verticalAlign: 'bottom', textAlign: 'left' }}>
                                                <big><big><big><big><big><big>Receipt</big></big></big></big></big></big>
                                            </td>
                                            <td align="right">
                                                <img src="./images/westwoodlogo2.png" style= "width: 300px; max-height: 75px; height: auto;" alt="The Westwood"></img>
                                            </td>
                                        </tr>
                                        <tr style={{ width: '100%', verticalAlign: 'bottom', textAlign: 'left' }}>
                                            <td style={{ width: '50%', verticalAlign: 'bottom', textAlign: 'left' }}>
                                                <br />
                                                <label>Booking ID - <strong>${booking.booking_id}</strong></label>
                                                <br />
                                                <label>Booking Date - <strong>${dayjs(booking.booking_date, 'YYYY-MM-DD').format('MMM DD, YYYY')} </strong></label>
                                                <br />
                                                <label>Check In - <strong>${dayjs(booking.check_in, 'YYYY-MM-DD').format('MMM DD, YYYY')} - ${'01:00 pm'}</strong></label>
                                                <br />
                                                <label>Check Out - <strong>${dayjs(booking.check_out, 'YYYY-MM-DD').format('MMM DD, YYYY')} - ${'11:00 am'}</strong></label>                           
                                                <br />
                                                <label><b>${booking.room_name}</b></label> for <label><b><i>${booking.customer_name} - ${booking.contact_number}</i></b> (${booking.number_of_nights} nights)  </label>
                                            </td>
                                            <td align="right">
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
                                            <td colspan="2"><label><strong>Total amount payable for this booking is INR ${Math.round(booking.total_price)}/- as per
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
                                                <!--<tr>
                                                    <td colspan="2"><font style={{ color: 'darkgray' }}>TARRIF</font></td>
                                                </tr> -->
                                                <tr>
                                                    <td>
                                                    <!--<label> Property Sell Price<br /></label>-->
                                                    <font style={{ color: 'darkgray' }}>${booking.room_name} for ${booking.number_of_nights} Night(s)</font>
                                                    </td>
                                                    <td align="right"> &nbsp;${Math.round(booking.total_price)} </td>
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
                                                </tr> 
                                                <tr>
                                                    <td><label>Voluntary Property Driven
                                                    Coupon Discount </label></td>
                                                    <td align="right"> ${booking.discount || 0} </td>
                                                </tr>
                                                <tr>
                                                    <td colspan="2">
                                                    <hr />
                                                    </td>
                                                </tr> -->
                                                <!-- <tr>
                                                    <td><label>Property Gross Charges </label></td>
                                                    <td align="right"> ${booking.total_price} </td>
                                                </tr>
                                                <tr>
                                                    <td colspan="2">
                                                    <hr />
                                                    </td>
                                                </tr> -->
                                                <!-- <tr>
                                                    <td><label>Agent Commission</label></td>
                                                    <td align="right"> ${booking.commission || 0} </td>
                                                </tr> 
                                                <tr>
                                                    <td colspan="2">
                                                    <hr />
                                                    </td>
                                                </tr> -->
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
                                                    <td align="right"> <b>${Math.round(booking.total_price)}</b> </td>
                                                </tr>
                                                <tr>
                                                    <td colspan="2">
                                                    <hr />
                                                    </td>
                                                </tr>                                
                                                <tr>
                                                    <td colspan="2">${paymentRows}</td>
                                                </tr>
                                                <tr>
                                                    <td><label>Amount Received</label></td>
                                                    <td align="right"> ${Math.round(paidSoFar)} </td>
                                                </tr>
                                                <tr><td colspan="2"><hr /></td></tr>                                
                                                <tr>
                                                    <td><label>Balance</label></td>
                                                    <td align="right"> <b><i>${Math.round(balance)}</i></b> </td>
                                                </tr>
                                                <!-- <tr><td colspan="2"><hr /></td></tr>                                -->
                                                </table>
                                            </center>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colspan="2"><hr /></td>
                                        </tr>
                                            <td colspan="2"><stong>Identification Submitted: </stong>N/A </td>
                                        </tr>
                                        <tr>
                                            <td colspan="2"><stong><b>Care Taker can be contacted in the premises at Ph: 98848 55041 / Extn: 701</b></stong></td>
                                        </tr>
                                        <tr><td colspan="2"><hr /></td></tr>
                                        <tr>
                                            <td colspan="2"><stong>Complimentary Breakfast is available for all days of the stay.  <b>Pets are not allowed in the premises.</b></stong></td>
                                        </tr>
                                        <tr><td colspan="2"><hr /></td></tr>
                                        <tr>
                                            <td colspan="2">Thank you for choosing The Westwood!, We hope you have a great stay with us.</td>
                                        </tr>
                                        <tr>
                                            <td colspan="2">For any inquiries, please contact us.</td>
                                        </tr>
                                        </table>                                        
                                    </td>
                                </tr>
                            </table>
                        </div>    
                    </div>                    
                    <div class="no-print" style={{width: '100%'}}>
                        <table style={{ borderWidth: 0, width: '100%' }} ><tr><td>
                            <button onclick="window.print()">Print Receipt</button>
                            <button id="download-png-btn" onclick="downloadAsImage()">Download as PNG</button>
                            <button id="download-jpg-btn" onclick="downloadAsImage()">Download as JPEG</button>
                            <button id="download-svg-btn" ">Download as SVG</button>
                        </td></tr></table>
                    </div>
                </body>
            </html>
        `);
    const script = receiptWindow.document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
    script.onload = function () {
        // Now html2canvas is available
        const btn = receiptWindow.document.getElementById('download-png-btn');
        btn.onclick = function () {
            const receiptDiv = receiptWindow.document.querySelector('div[ref]');
            if (receiptDiv) {
                html2canvas(receiptDiv, {
                    width: 900, //receiptDiv.offsetWidth
                    height: 1200, //receiptDiv.offsetHeight
                    backgroundColor: '#fff',
                    scale: 1 // for higher resolution
                }).then(canvas => {
                    const link = receiptWindow.document.createElement('a');
                    link.download = `Booking Receipt - ${booking.customer_name} ${booking.room_name}.png`;
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                });
            }
        };

        const jpgbtn = receiptWindow.document.getElementById('download-jpg-btn');
        jpgbtn.onclick = function () {
            //const receiptDiv = receiptWindow.document.querySelector('div[ref]');
            const receiptDiv = receiptWindow.document.getElementById('booking_receipt_content');
            if (receiptDiv) {
                html2canvas(receiptDiv, {
                    width: 900, //receiptDiv.offsetWidth
                    height: 1123, //receiptDiv.offsetHeight // 1123 is the height of the receipt div
                    backgroundColor: '#fff',
                    scale: 1 // for higher resolution
                }).then(canvas => {
                    const link = receiptWindow.document.createElement('a');
                    link.download = `Booking Receipt - ${booking.customer_name} ${booking.room_name}.jpg`;
                    link.href = canvas.toDataURL('image/jpeg');
                    link.click();
                });
            }
        };

        const svgbtn = receiptWindow.document.getElementById('download-svg-btn');
        svgbtn.onclick = function () {
            console.log('download svg btn clicked');
             //const receiptDiv = receiptWindow.document.querySelector('div[ref]');
             const receiptDiv = receiptWindow.document.getElementById('booking_receipt_content');
            if (receiptDiv) {
                const svgElement = document.getElementById('booking_receipt_content');
                const serializer = new XMLSerializer();
                const svgString = serializer.serializeToString(svgElement);
                const blob = new Blob([svgString], {type: 'image/svg+xml'});
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'receipt.svg';
                link.click();            
            }
        };

        jpgbtn.click();
        
    };
    receiptWindow.document.head.appendChild(script);
    receiptWindow.document.close();
};

