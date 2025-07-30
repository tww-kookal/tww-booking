import { RANGE, RANGE, SHEET_ID, DEFAULT_BOOKING, roomOptions } from "./constants";
import dayjs from 'dayjs';

/**
 * Returns the first specified number of characters from a given string.
 *
 * @param {string} name - The input string from which to extract characters.
 * @param {number} [numberOfCharacters=6] - The number of characters to extract from the start of the string. Defaults to 6.
 * @returns {string} The extracted substring, or the original string if its length is less than or equal to the specified number.
 */
export const getStartingCharacters = (name, numberOfCharacters = 6) => {
    if (!name) return '';
    if (name.length <= numberOfCharacters) {
        return name;
    } else {
        return name.substring(0, numberOfCharacters);
    }
}

/**
 * Extracts the initials from a given name.
 *
 * @param {string} name - The input name string.
 * @returns {string} The initials of the name, in uppercase.
 */
export const getInitials = (name) => {
    return name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase();
};

/**
 * Returns the commission percentage based on the source of booking.
 *
 * @param {string} source - The source of the booking.
 * @returns {number} The commission percentage.
 */
export const getCommissionPercent = (source) => {
    if (source === "sangeetha") return 8;
    else if (['walkin', 'direct', 'walk in'].includes(source)) return 0;
    else if (['mmt', 'agoda']) return 30;
    else if (['owners', 'owner', "pranav", "rk", "balan", ''].includes(source.trim().toLocaleLowerCase())) return 0;
    else return 10; // Who are supposed to be agents
};

/**
 * Converts Google Sheets data to an array of booking objects.
 *
 * @param {Array<Array<string>>} sheetData - The data from Google Sheets.
 * @returns {Array<Booking>} An array of booking objects.
 */
export const convertGoogleDataToBookings = (sheetData) => {
    // Skip header row
    // const rows = sheetData.slice(1);
    console.log("Query From Google Data Sheet Returned ", sheetData.length);
    return sheetData.map((row) => {
        return arrayToBooking(row);
    });
}

/**
 * Loads booking data from Google Sheets.
 *
 * @async
 * @returns {Promise<Array<Booking>>} A promise that resolves to an array of booking objects.
 */
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

/**
 * Calculates the commission amount based on the source and amount.
 *
 * @param {string} source - The source of the booking.
 * @param {number} amount - The total amount of the booking.
 * @returns {number} The calculated commission amount.
 */
export const calculateCommission = (source, amount) => {
    return (amount * getCommissionPercent(source)) / 100;
};

/**
 * Parses a value and converts it to a number, removing commas if necessary.
 *
 * @param {string|number} val - The value to parse.
 * @returns {number} The parsed number.
 */
export const parseNumber = (val) => {
    if (!val) return 0;
    return typeof val === 'string' ? Number(val.replace(/,/g, '')) || 0 : val;
};

/**
 * Converts an array row from Google Sheets into a booking object.
 *
 * @param {Array<string>} row - The array row from Google Sheets.
 * @returns {Booking} A booking object.
 */
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

/**
 * Sorts an array of booking objects by check-in date and then by customer name.
 *
 * @param {Array<Booking>} bookings - The array of booking objects to sort.
 * @returns {Array<Booking>} The sorted array of booking objects.
 */
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

/**
 * Prepares chart data by combining booking data with default values for available slots.
 *
 * @param {Array<Booking>} bookings - The array of booking objects.
 * @param {Set<string>} dateSet - A set of dates to include in the chart data.
 * @param {Array<string>} memoizedDates - An array of memoized dates.
 * @returns {Array<ChartData>} An array of chart data objects.
 */
export const prepareChartData = (bookings, dateSet, memoizedDates) =>{
    const chartData = bookings
        .filter((booking) => dateSet.has(booking.checkInDate))
        .map((booking) => ({
            ...booking,
            chartStatus: dayjs(booking.checkInDate, "YYYY-MM-DD").isBefore(dayjs()) ? 'Closed' : booking.status,
        }));

    const allData = [];
    for (const date of memoizedDates) {
        for (const room of roomOptions) {
            const booking = chartData.find((b) => dayjs(b.checkInDate, "YYYY-MM-DD").isSame(date) && b.roomName === room);
            if (!booking && dayjs(date, "YYYY-MM-DD").isBefore(dayjs())) {
                // If no booking exists for this room on this date and its a past date, add a default booking with Closed status
                allData.push({
                    ...DEFAULT_BOOKING,
                    roomName: room,
                    checkInDate: date,
                    checkOutDate: date,
                    chartStatus: 'Closed',
                    status: 'Available',
                    chartData: 'INJECTED',
                    pastDate: true
                });
            } else if (!booking) {
                // If no booking exists for this room for today and future
                allData.push({
                    ...DEFAULT_BOOKING,
                    roomName: room,
                    checkInDate: date,
                    checkOutDate: date,
                    chartStatus: 'Available',
                    status: 'Available',
                    chartData: 'INJECTED',
                    pastDate: false
                });
            } else if (booking && dayjs(booking.checkInDate, "YYYY-MM-DD").isBefore(dayjs())) {
                // If booking exists for this room on this date and its a past date, add a default booking with Closed status
                // This is to ensure that past bookings are shown as closed
                allData.push({
                    ...booking,
                    chartStatus: 'Closed',
                    chartData: 'ACTUAL',
                    pastDate: true
                });
            } else if (booking) {
                // If booking exists for this room on this date and future, add it to the data
                allData.push({
                    ...booking,
                    chartStatus: booking.status,
                    chartData: 'ACTUAL',
                    pastDate: false
                });
            }
        }
    }
    return allData;
}
