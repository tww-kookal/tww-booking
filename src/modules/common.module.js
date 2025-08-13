import { DEFAULT_BOOKING, roomOptions, BOOKING_STATUS } from "./constants";
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
    return 0;
    if (source && source.trim().toLocaleLowerCase() === "sangeetha") return 8;
    else if (source && ['walkin', 'direct', 'walk-in'].includes(source.trim().toLocaleLowerCase())) return 0;
    else if (source && ['mmt', 'agoda'].includes(source.trim().toLocaleLowerCase())) return 30;
    else if (source && ['owners', 'owner', "pranav", "rk", "balan", 'unknown', 'undefined', ''].includes(source.trim().toLocaleLowerCase())) return 0;
    else if (source && ['tww', 'the westwood'].includes(source.trim().toLocaleLowerCase())) return 10;
    else return 10; // Who are supposed to be agents
};

/**
 * Calculates the commission amount based on the source and amount.
 *
 * @param {string} source - The source of the booking.
 * @param {number} amount - The total amount of the booking.
 * @returns {number} The calculated commission amount.
 */
export const calculateCommission = (source, amount) => {
    return (parseNumber(amount) * getCommissionPercent(source)) / 100;
};

/**
 * Parses a value and converts it to a number, removing commas if necessary.
 *
 * @param {string|number} val - The value to parse.
 * @returns {number} The parsed number.
 */
export const parseNumber = (val) => {
    try {
        if (!val) return 0;
        return typeof val === 'string' ? Number(val.replace(/,/g, '')) || 0 : val;
    } catch (error) {
        console.log("Error parsing number: ", val, ", ", error);
        return 0;
    }
};

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
        const dateA = a.check_in ? new Date(a.check_in) : new Date(0);
        const dateB = b.check_in ? new Date(b.check_in) : new Date(0);

        // If check-in dates are the same, sort by customer name
        if (dateA.getTime() === dateB.getTime()) {
            return a.customer_name.localeCompare(b.customer_name);
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
export const prepareChartData = (bookings, dateSet, memoizedDates) => {
    const chartData = bookings
        .filter((booking) => dateSet.has(booking.check_in))
        .map((booking) => ({
            ...booking,
            chart_status: dayjs(booking.check_in, "YYYY-MM-DD").isBefore(dayjs()) ? BOOKING_STATUS.CLOSED : booking.status,
        }));

    const allData = [];
    for (const date of memoizedDates) {
        for (const room of roomOptions) {
            const booking = chartData.find((b) => dayjs(b.check_in, "YYYY-MM-DD").isSame(date) && b.room_name === room);
            if (!booking && dayjs(date, "YYYY-MM-DD").isBefore(dayjs())) {
                // If no booking exists for this room on this date and its a past date, add a default booking with Closed status
                allData.push({
                    ...DEFAULT_BOOKING,
                    room_name: room,
                    check_in: date,
                    check_out: date,
                    chart_status: BOOKING_STATUS.CLOSED,
                    status: BOOKING_STATUS.AVAILABLE,
                    chart_data: 'INJECTED',
                    past_date: true
                });
            } else if (!booking) {
                // If no booking exists for this room for today and future
                allData.push({
                    ...DEFAULT_BOOKING,
                    room_name: room,
                    check_in: date,
                    check_out: date,
                    chart_status: BOOKING_STATUS.AVAILABLE,
                    status: BOOKING_STATUS.AVAILABLE,
                    chart_data: 'INJECTED',
                    past_date: false
                });
            } else if (booking && dayjs(booking.check_in, "YYYY-MM-DD").isBefore(dayjs())) {
                // If booking exists for this room on this date and its a past date, add a default booking with Closed status
                // This is to ensure that past bookings are shown as closed
                allData.push({
                    ...booking,
                    chart_status: BOOKING_STATUS.CLOSED,
                    chart_data: 'ACTUAL',
                    past_date: true
                });
            } else if (booking) {
                // If booking exists for this room on this date and future, add it to the data
                allData.push({
                    ...booking,
                    chart_status: booking.status,
                    chart_data: 'ACTUAL',
                    past_date: false
                });
            }
        }
    }
    return allData;
}

export const getStatusColor = (booking) => {
    if (booking.past_date) {
        if (booking.status === BOOKING_STATUS.AVAILABLE) return '#1c461eff'
        else if (booking.status === BOOKING_STATUS.CONFIRMED) return '#0d447cff'
        else if (booking.status === BOOKING_STATUS.CANCELLED) return '#762900ff';
        else if (booking.status === BOOKING_STATUS.CLOSED) return '#6c686bff';
    } else {
        if (booking.chart_status === BOOKING_STATUS.AVAILABLE) return '#388e3c'
        else if (booking.chart_status === BOOKING_STATUS.CONFIRMED) return '#1976d2'
        else if (booking.chart_status === BOOKING_STATUS.CANCELLED) return '#e65100';
        else if (booking.chart_status === BOOKING_STATUS.CLOSED) return '#a6a0a4ff';
    }
    return '#5d595cff';
};

export const getDisplayText = (booking) => {
    if (booking.past_date) {
        return 'Blocked';
    }
    return booking.chart_status || 'NONE';
}
