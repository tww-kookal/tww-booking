/**
 * Google Sheets Service abstraction for CRUD operations.
 */

import { SHEET_ID, RANGE } from './constants';

// Update a booking row in Google Sheets
export async function updateBookingRow(rowIndex, bookingRow) {
    return window.gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${RANGE.split('!')[0]}!A${rowIndex + 1}`, // +1 because sheets are 1-indexed
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: [bookingRow]
        }
    });
}

// Append a new booking row to Google Sheets
export async function appendBookingRow(bookingRow) {
    return window.gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: RANGE,
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: [bookingRow]
        }
    });
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
                                    <td>${booking.bookingID}</td>
                                </tr>
                                <tr>
                                    <th>Customer Name:</th>
                                    <td>${booking.customerName}</td>
                                </tr>
                                <tr>
                                    <th>Room:</th>
                                    <td>${booking.roomName}</td>
                                </tr>
                                <tr>
                                    <th>Check-in Date:</th>
                                    <td>${booking.checkInDate}</td>
                                </tr>
                                <tr>
                                    <th>Check-out Date:</th>
                                    <td>${booking.checkOutDate}</td>
                                </tr>
                                <tr>
                                    <th>Number of Nights:</th>
                                    <td>${booking.numberOfNights}</td>
                                </tr>
                                <tr>
                                    <th>Number of People:</th>
                                    <td>${booking.numberOfPeople}</td>
                                </tr>
                                <tr>
                                    <th>Contact Number:</th>
                                    <td>${booking.contactNumber}</td>
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
                                    <td>₹${booking.roomAmount}</td>
                                </tr>
                                ${booking.food > 0 ? `<tr>
                                    <th>Food:</th>
                                    <td>₹${booking.food}</td>
                                </tr>` : ''}
                                ${booking.campFire > 0 ? `<tr>
                                    <th>Camp Fire:</th>
                                    <td>₹${booking.campFire}</td>
                                </tr>` : ''}
                                ${booking.otherServices > 0 ? `<tr>
                                    <th>Other Services:</th>
                                    <td>₹${booking.otherServices}</td>
                                </tr>` : ''}
                                <tr>
                                    <th>Advance Paid:</th>
                                    <td>₹${booking.advancePaid}</td>
                                </tr>
                                <tr class="total">
                                    <th>Balance to Pay:</th>
                                    <td>₹${booking.balanceToPay}</td>
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

