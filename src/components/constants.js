import { SHEET_ID } from '../config';

export const BOOKING_DEFAULT = {
    BOOKING_DATE: new Date().toISOString().split('T')[0],
    ROOM_NAME: 'Cedar',
    STATUS: 'Confirmed'
}

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

export const RANGE = "Sheet1!A2:Z"; // Adjust range

export { SHEET_ID };

export const roomOptions = ['Cedar', 'Pine', 'Teak', 'Maple', 'Tent'];

export const roomAvailabilityStatusColors = {
    Confirmed: '#007bff', // blue
    Cancelled: '#fd7e14', // orange
    Available: '#28a745', // green
    Closed: '#6c757d', // gray
};

export const statusOptions = ['Confirmed', 'Tentative', 'Cancelled'];

export const sourceOptions = [
    'Sangeetha', 'Pranav', 'RK', 'Balan', 'Walkin',
    'MMT', 'Agoda', 'Booking.com', 'Ganesh Agent', 'Kodai Guest'
];

export const getCommissionPercent = (source) => {
    if (source === "Sangeetha") return 8;
    else if (["Ganesh Agent", "Kodai Guest", "Kodai Homes"].includes(source)) return 10;
    else if (source === "MMT") return 30;
    else if (["Pranav", "RK", "Balan"].includes(source)) return 0;
    return 0;
};

export const convertGoogleDataToBookings = (sheetData) => {
    // Skip header row
    // const rows = sheetData.slice(1);
    console.log("Query From Google Data Sheet Returned ", sheetData.length);
    return sheetData.map((row) => {
        return arrayToBooking(row);
    });
}

export const loadFromSheetToBookings = async () => {
    try {
        const res = await window.gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: RANGE,
        });

        if (res.result.values && res.result.values.length > 0) {
            return convertGoogleDataToBookings(res.result.values);
        } else {
            console.error("❌ No bookings found in the sheet.");
            return [];
        }
    } catch (error) {
        console.error("❌ Error fetching data from Google Sheets:", error);
        return [];
    }
}

export const calculateCommission = (source, amount) => {
    return (amount * getCommissionPercent(source)) / 100;
};

export const parseNumber = (val) => {
    if (!val) return 0;
    return typeof val === 'string' ? Number(val.replace(/,/g, '')) || 0 : val;
};

export const arrayToBooking = (row) => {
    return {
        roomName: row[0] || '',
        customerName: row[1] || '',
        contactNumber: row[2] || '',
        numberOfPeople: Number(row[3] ? row[3].replace(/,/g, '') : 0) || 0,
        checkInDate: row[4] || '',
        checkOutDate: row[5] || '',
        numberOfNights: Number(row[6] ? row[6].replace(/,/g, '') : 0) || 0,
        status: row[7] || '',
        bookingDate: row[8] || '',
        sourceOfBooking: row[9] || '',
        roomAmount: Number(row[10] ? row[10].replace(/,/g, '') : 0) || 0,
        advancePaid: Number(row[11] ? row[11].replace(/,/g, '') : 0) || 0,
        advancePaidTo: row[12] || '',
        //
        food: Number(row[14] ? row[14].replace(/,/g, '') : 0) || 0,
        campFire: Number(row[15] ? row[15].replace(/,/g, '') : 0) || 0,
        //
        //
        otherServices: Number(row[18] ? row[18].replace(/,/g, '') : 0) || 0,
        balanceToPay: Number(row[19] ? row[19].replace(/,/g, '') : 0) || 0,
        totalAmount: Number(row[20] ? row[20].replace(/,/g, '') : 0) || 0,
        commission: Number(row[21] ? row[21].replace(/,/g, '') : 0) || 0,
        twwRevenue: Number(row[22] ? row[22].replace(/,/g, '') : 0) || 0,
        balancePaidTo: row[23] || '',
        bookingID: row[24] || '',
        remarks: row[25] || ''
    };
}

export const sortBookings = (bookings) => {
    // Sort the filtered results by check-in date
    return bookings.sort((a, b) => {
        // Convert YYYY-MM-DD strings to Date objects for proper date comparison
        const dateA = a.checkInDate ? new Date(a.checkInDate) : new Date(0);
        const dateB = b.checkInDate ? new Date(b.checkInDate) : new Date(0);

        // If check-in dates are the same, sort by customer name
        if (dateA.getTime() === dateB.getTime()) {
            return a.customerName.localeCompare(b.customerName);
        }
        // Otherwise sort by check-in date (ascending order)
        return dateA - dateB;
    });
}