import { SHEET_ID } from '../config';

export const BOOKING_DEFAULT = {
    BOOKING_DATE: new Date().toISOString().split('T')[0],
    ROOM_NAME: 'Cedar',
    STATUS: 'Confirmed'
}

export const RANGE = "Sheet1!A2:T"; // Adjust range

export { SHEET_ID };

export const roomOptions = ['Cedar', 'Pine', 'Teak', 'Maple', 'Tent'];

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

export const calculateCommission = (source, amount) => {
    return (amount * getCommissionPercent(source)) / 100;
};

export const parseNumber = (val) => {
    console.log("Val Received ", val);
    if (!val) return 0;
    return typeof val === 'string' ? Number(val.replace(/,/g, '')) || 0 : val;
};



