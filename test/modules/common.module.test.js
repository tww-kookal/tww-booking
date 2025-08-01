import dayjs from 'dayjs';
import {
    roomOptions,
} from '../../src/modules/constants';

import {
    getStartingCharacters,
    getCommissionPercent,
    convertGoogleDataToBookings,
    loadFromSheetToBookings,
    calculateCommission,
    parseNumber,
    arrayToBooking,
    sortBookings,
    prepareChartData,
    getStatusColor,
    getDisplayText
} from '../../src/modules/common.module';

// Mock window.gapi for loadFromSheetToBookings
beforeAll(() => {
    global.window = {};
    window.gapi = {
        client: {
            sheets: {
                spreadsheets: {
                    values: {
                        get: jest.fn().mockResolvedValue({
                            result: {
                                values: [
                                    ["Cedar", "John Doe", "1234567890", "2", "2025-07-28", "2025-07-29", "1", "Confirmed", "2025-07-27", "Sangeetha", "1000", "500", "", "", "200", "100", "", "", "50", "0", "1250", "100", "1150", "", "BID123", "Test remarks"],
                                    ["Pine", "Jane Doe", "0987654321", "4", "2025-07-29", "2025-07-30", "1", "Cancelled", "2025-07-28", "MMT", "2000", "1000", "", "", "300", "150", "", "", "100", "0", "2550", "200", "2350", "", "BID124", "Other remarks"]
                                ]
                            }
                        })
                    }
                }
            }
        }
    };
});

describe('common.module.test.js', () => {

    test('getCommissionPercent returns correct percent', () => {
        expect(getCommissionPercent('Sangeetha')).toBe(8);
        expect(getCommissionPercent('Ganesh Agent')).toBe(10);
        expect(getCommissionPercent('MMT')).toBe(30);
        expect(getCommissionPercent('RK')).toBe(0);
        expect(getCommissionPercent('Unknown')).toBe(0);
    });

    test('calculateCommission returns correct value', () => {
        expect(calculateCommission('Sangeetha', 1000)).toBe(80);
        expect(calculateCommission('MMT', 2000)).toBe(600);
        expect(calculateCommission('Unknown', 1000)).toBe(0);
    });

    test('parseNumber parses numbers and strings', () => {
        expect(parseNumber('1,000')).toBe(1000);
        expect(parseNumber('')).toBe(0);
        expect(parseNumber(500)).toBe(500);
        expect(parseNumber('abc')).toBe(0);
    });

    test('arrayToBooking maps array to booking object', () => {
        const arr = ["Cedar", "John Doe", "1234567890", "2", "2025-07-28", "2025-07-29", "1", "Confirmed", "2025-07-27", "Sangeetha", "1000", "500", "", "", "200", "100", "", "", "50", "0", "1250", "100", "1150", "", "BID123", "Test remarks"];
        const booking = arrayToBooking(arr);
        expect(booking.roomName).toBe('Cedar');
        expect(booking.customerName).toBe('John Doe');
        expect(booking.status).toBe('Confirmed');
        expect(booking.bookingID).toBe('BID123');
        expect(booking.remarks).toBe('Test remarks');
    });

    test('sortBookings sorts by checkInDate and customerName', () => {
        const bookings = [
            { checkInDate: '2025-07-29', customerName: 'Jane' },
            { checkInDate: '2025-07-28', customerName: 'John' },
            { checkInDate: '2025-07-28', customerName: 'Alice' }
        ];
        const sorted = sortBookings(bookings);
        expect(sorted[0].customerName).toBe('Alice');
        expect(sorted[1].customerName).toBe('John');
        expect(sorted[2].customerName).toBe('Jane');
    });

    test('convertGoogleDataToBookings maps sheet data to bookings', () => {
        const sheetData = [
            ["Cedar", "John Doe", "1234567890", "2", "2025-07-28", "2025-07-29", "1", "Confirmed", "2025-07-27", "Sangeetha", "1000", "500", "", "", "200", "100", "", "", "50", "0", "1250", "100", "1150", "", "BID123", "Test remarks"]
        ];
        const bookings = convertGoogleDataToBookings(sheetData);
        expect(bookings.length).toBe(1);
        expect(bookings[0].customerName).toBe('John Doe');
    });

    test('loadFromSheetToBookings fetches and converts bookings', async () => {
        const bookings = await loadFromSheetToBookings();
        expect(bookings.length).toBeGreaterThan(0);
        expect(bookings[0].roomName).toBe('Cedar');
    });

    test('prepareChartData returns correct chart data', () => {
        const bookings = [
            { roomName: 'Cedar', checkInDate: '2025-07-28', status: 'Confirmed' },
            { roomName: 'Pine', checkInDate: '2025-07-29', status: 'Cancelled' }
        ];
        const dateSet = new Set(['2025-07-28', '2025-07-29']);
        const memoizedDates = ['2025-07-28', '2025-07-29'];
        const chartData = prepareChartData(bookings, dateSet, memoizedDates);
        expect(chartData.length).toBe(roomOptions.length * memoizedDates.length);
        expect(chartData.some(d => d.roomName === 'Cedar')).toBe(true);
        expect(chartData.some(d => d.roomName === 'Pine')).toBe(true);
    });

    test('prepareChartData handles past checkindate', () => {
        const bookings = [
            { roomName: 'Cedar', checkInDate: dayjs("3025-07-28", "YYYY-MM-DD").format("YYYY-MM-DD"), status: 'Confirmed' },
            { roomName: 'Pine', checkInDate: dayjs("3025-07-28", "YYYY-MM-DD").format("YYYY-MM-DD"), status: 'Cancelled' }
        ];
        const dateSet = new Set(['3025-07-27', '3025-07-28', '3025-07-29', '3025-07-30']);
        const memoizedDates = ['3025-07-27', '3025-07-28', '3025-07-29', '3025-07-30'];
        const chartData = prepareChartData(bookings, dateSet, memoizedDates);
        expect(chartData.length).toBe(roomOptions.length * memoizedDates.length);
        expect(chartData.every(d => d.status === 'Available')).toBe(false);
    });

    test('When there is no bookings in googlesheet, loadFromSheetToBookings returns empty array', async () => {
        window.gapi.client.sheets.spreadsheets.values.get.mockResolvedValue({ result: { values: [] } });
        const bookings = await loadFromSheetToBookings();
        expect(bookings).toEqual([]);
    });

    test('for correct Status color', () => {
        expect(getStatusColor({ pastDate: true, status: 'Available' })).toBe('#1c461eff');
        expect(getStatusColor({ pastDate: true, status: 'Confirmed' })).toBe('#0d447cff');
        expect(getStatusColor({ pastDate: true, status: 'Cancelled' })).toBe('#762900ff');
        expect(getStatusColor({ pastDate: true, status: 'Closed' })).toBe('#6c686bff');
        expect(getStatusColor({ pastDate: false, chartStatus: 'Available' })).toBe('#388e3c');
        expect(getStatusColor({ pastDate: false, chartStatus: 'Confirmed' })).toBe('#1976d2');
        expect(getStatusColor({ pastDate: false, chartStatus: 'Cancelled' })).toBe('#e65100');
        expect(getStatusColor({ pastDate: false, chartStatus: 'Closed' })).toBe('#a6a0a4ff');
        expect(getStatusColor({ pastDate: true, status: 'Unknown' })).toBe('#5d595cff');
        expect(getStatusColor({ pastDate: false, chartStatus: 'Unknown' })).toBe('#5d595cff');
        expect(getStatusColor({})).toBe('#5d595cff');
    });

    test('for correct displayText ', () => {
        expect(getDisplayText({ pastDate: true })).toBe('Blocked');
        expect(getDisplayText({ pastDate: false, chartStatus: 'Available' })).toBe('Available');
        expect(getDisplayText({ chartStatus: 'Confirmed' })).toBe('Confirmed');
        expect(getDisplayText({ chartStatus: 'Cancelled' })).toBe('Cancelled');
        expect(getDisplayText({ chartStatus: 'Closed' })).toBe('Closed');
        expect(getDisplayText({})).toBe('NONE');
        expect(getDisplayText({ pastDate: false })).toBe('NONE');
        expect(getDisplayText({ pastDate: false, chartStatus: 'Confirmed' })).toBe('Confirmed');
    });
});