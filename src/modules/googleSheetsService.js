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

