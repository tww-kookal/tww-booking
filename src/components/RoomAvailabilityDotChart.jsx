import React, { useEffect, useState, useMemo } from 'react';
import dayjs from 'dayjs';
import {loadFromSheetToBookings, prepareChartData, roomAvailabilityStatusColors, roomOptions } from '../modules/constants'; // Assuming roomOptions is defined in constants.js
import '../css/RoomAvailabilityDotChart.css'; // Add your CSS file for styling

const RoomAvailabilityDotChart = ({ startDate: propStartDate }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState([]);

    const DEFAULT_NUMBER_OF_DAYS = 28; // Default number of days to show in the chart

    const [startDate, setStartDate] = useState(
        propStartDate ? dayjs(propStartDate) : dayjs()
    );

    const dates = useMemo(() =>
        Array.from({ length: DEFAULT_NUMBER_OF_DAYS }, (_, i) =>
            dayjs(startDate).add(i, "day").format("YYYY-MM-DD")
        ), [startDate]
    );
    const memoizedDates = useMemo(() => dates, [dates]);

    const useWindowSize = () => {
        const [size, setSize] = useState([window.innerWidth, window.innerHeight]);

        useEffect(() => {
            const handleResize = () => setSize([window.innerWidth, window.innerHeight]);
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }, []);

        return size;
    };

    useEffect(() => {
        const filterBookings = async () => {
            setLoading(true);
            try {
                const dateSet = new Set(
                    Array.from({ length: DEFAULT_NUMBER_OF_DAYS }, (_, i) => startDate.add(i, "day").format("YYYY-MM-DD"))
                );

                const bookings = await loadFromSheetToBookings();
                const allData = prepareChartData(bookings, dateSet, memoizedDates);
                setError(null);
                setData(allData);
                return allData;
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to fetch bookings. Please try again.");
                return [];
            } finally {
                setLoading(false);
            }
        };
        filterBookings();
    }, [startDate, propStartDate]);

    const handleDateChange = (e) => {
        setStartDate(dayjs(e.target.value));
    };

    const onBookingClick = (booking) => {
    }

    const getStatusColor = (booking) => {
        if (booking.pastDate) {
            if (booking.status === 'Available') return 'dark-green'
            else if (booking.status === 'Confirmed') return 'dark-blue'
            else if (booking.status === 'Cancelled') return 'dark-orange';
            else if (booking.status === 'Closed') return 'gray'; // gray
        } else {
            if (booking.chartStatus === 'Available') return 'green'
            else if (booking.chartStatus === 'Confirmed') return 'blue'
            else if (booking.chartStatus === 'Cancelled') return 'orange';
            else if (booking.chartStatus === 'Closed') return 'gray'; // gray
        }
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase();
    };


    const renderCell = (roomName, date) => {
        const parameterDate = dayjs(date, "YYYY-MM-DD");
        const bookingActual = data.find(
            b =>
                b.chartData === 'ACTUAL' &&
                b.roomName === roomName &&
                new dayjs(b.checkInDate, "YYYY-MM-DD").isSame(parameterDate)
        );
        const bookingInjected = data.find(
            b =>
                b.chartData === 'INJECTED' &&
                b.roomName === roomName &&
                new dayjs(b.checkInDate, "YYYY-MM-DD").isSame(parameterDate)
        );

        let bgColor = '#5d595cff'; // Default color for injected bookings
        if (bookingActual) {
            bgColor = getStatusColor(bookingActual);
        } else if (bookingInjected) {
            bgColor = getStatusColor(bookingInjected);
        }
        return (
            <td
                key={date}
                style={{ backgroundColor: `${bgColor}`, cursor: 'pointer', color: 'white', textAlign: 'center' }}
                onClick={bookingActual && bookingActual.status !== 'Available' ? () => onBookingClick(bookingActual) : onBookingClick(bookingInjected)}
                title={bookingActual ?
                    bookingActual.customerName +
                    "\r\nCheck Out : " + dayjs(bookingActual.checkOutDate, "YYYY-MM-DD").format("MMM D") +
                    "\r\nGuests : " + bookingActual.numberOfPeople
                    : ''}
            >
                {bookingActual ? getInitials(bookingActual.customerName) : ''}
            </td>
        )

    };

    return (
        <div className="room-chart-container">
            {error && <div className="error-message">{error}</div>}
            {loading ? 'Fetching from data store...' : ''}
            <div className="chart-header">
                <h3>Room Availability Chart</h3>
            </div>
            <div style={{ marginBottom: 10 }}>
                <label className="date-label">
                    Start Date: &nbsp;</label>
                <input
                    type="date"
                    value={startDate.format("YYYY-MM-DD")}
                    onChange={handleDateChange}
                />

            </div>
            <table className="room-chart-table">
                <thead className="room-chart-table-header">
                    <tr>
                        <th>Room</th>
                        {memoizedDates.map(date => (
                            <th key={date}>{new dayjs(date, "YYYY-MM-DD").format("MMM DD")}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {roomOptions.map(roomName => (
                        <tr key={roomName}>
                            <td className="room-chart-first-column"><strong>{roomName}</strong></td>
                            {memoizedDates.map(date => renderCell(roomName, date))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RoomAvailabilityDotChart;
