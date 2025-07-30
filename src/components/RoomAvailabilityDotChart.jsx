import React, { useEffect, useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { loadFromSheetToBookings, prepareChartData, roomAvailabilityStatusColors, roomOptions } from '../modules/constants';
import '../css/RoomAvailabilityDotChart.css';

const RoomAvailabilityDotChart = ({ startDate: propStartDate }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState([]);

    const DEFAULT_NUMBER_OF_DAYS = 28;

    const [startDate, setStartDate] = useState(
        propStartDate ? dayjs(propStartDate) : dayjs()
    );

    const dates = useMemo(() =>
        Array.from({ length: DEFAULT_NUMBER_OF_DAYS }, (_, i) =>
            dayjs(startDate).add(i, "day").format("YYYY-MM-DD")
        ), [startDate]
    );
    const memoizedDates = useMemo(() => dates, [dates]);

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
        // Implement your booking click logic here
    };

    const getStatusColor = (booking) => {
        if (booking.pastDate) {
            if (booking.status === 'Available') return 'dark-green'
            else if (booking.status === 'Confirmed') return 'dark-blue'
            else if (booking.status === 'Cancelled') return 'dark-orange';
            else if (booking.status === 'Closed') return 'gray';
        } else {
            if (booking.chartStatus === 'Available') return 'green'
            else if (booking.chartStatus === 'Confirmed') return 'blue'
            else if (booking.chartStatus === 'Cancelled') return 'orange';
            else if (booking.chartStatus === 'Closed') return 'gray';
        }
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase();
    };

    // Inverted cell renderer: date as row, room as column
    const renderCell = (date, roomName) => {
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

        let bgColor = '#5d595cff';
        if (bookingActual) {
            bgColor = getStatusColor(bookingActual);
        } else if (bookingInjected) {
            bgColor = getStatusColor(bookingInjected);
        }
        return (
            <td
                key={roomName}
                style={{
                    backgroundColor: `${bgColor}`,
                    cursor: 'pointer',
                    color: 'white',
                    textAlign: 'center',
                    minWidth: 40
                }}
                onClick={bookingActual && bookingActual.status !== 'Available'
                    ? () => onBookingClick(bookingActual)
                    : bookingInjected ? () => onBookingClick(bookingInjected) : undefined}
                title={bookingActual ?
                    bookingActual.customerName +
                    "\r\nCheck Out : " + dayjs(bookingActual.checkOutDate, "YYYY-MM-DD").format("MMM D") +
                    "\r\nGuests : " + bookingActual.numberOfPeople
                    : ''}
            >
                {bookingActual ? getInitials(bookingActual.customerName) : ''}
            </td>
        );
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
                        <th>Date</th>
                        {roomOptions.map(roomName => (
                            <th key={roomName}>{roomName}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {memoizedDates.map(date => (
                        <tr key={date}>
                            <td className="room-chart-first-column">
                                <strong>{dayjs(date, "YYYY-MM-DD").format("MMM DD")}</strong>
                            </td>
                            {roomOptions.map(roomName => renderCell(date, roomName))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RoomAvailabilityDotChart;
