import React, { useEffect, useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { loadFromSheetToBookings, prepareChartData, roomAvailabilityStatusColors, roomOptions } from '../modules/constants';
import '../css/RoomAvailabilityDotChart.css';
import { getStartingCharacters } from '../modules/roomAvailabilityDotChart.module';

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
            if (booking.status === 'Available') return '#388e3c'
            else if (booking.status === 'Confirmed') return '#1976d2'
            else if (booking.status === 'Cancelled') return '#e65100';
            else if (booking.status === 'Closed') return '#a6a0a4ff';
        } else {
            if (booking.chartStatus === 'Available') return '#388e3c'
            else if (booking.chartStatus === 'Confirmed') return '#1976d2'
            else if (booking.chartStatus === 'Cancelled') return '#e65100';
            else if (booking.chartStatus === 'Closed') return '#a6a0a4ff';
        }
        return '#5d595cff';
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
                    minWidth: 40,
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: '1rem',
                    border: '2px solid #fff'
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
                {/* {bookingActual ? getInitials(bookingActual.customerName) : ''} */}
                {bookingActual ? bookingActual.customerName : ''} &nbsp;
                ({bookingActual ? bookingActual.numberOfPeople : ''})
            </td>
        );
    };

    // Mobile-friendly card layout: horizontal alignment for rooms per date
    const renderMobileCards = () => (
        <div className="room-chart-mobile-list">
            {/* Header Card */}
            <div className="room-chart-mobile-rooms-horizontal" style={{
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                padding: '8px 0',
                alignItems: 'center',
                background: '#a0a0a0ff',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.35)',
                marginBottom: '1px',
                fontWeight: 'bold'
            }}>
                <div className="room-chart-mobile-date" style={{
                    minWidth: 70,
                    color: '#1976d2',
                    fontSize: '1.05rem',
                    textAlign: 'center'
                }}>
                    Date
                </div>
                {roomOptions.map(roomName => (
                    <div
                        key={roomName}
                        className="room-chart-mobile-room"
                        style={{
                            minWidth: 80,
                            padding: '8px 12px',
                            borderRadius: 8,
                            background: '#e3eafc',
                            color: '#1976d2',
                            textAlign: 'center',
                            fontWeight: 'bold',
                            fontSize: '1rem'
                        }}
                    >
                        {roomName}
                    </div>
                ))}
            </div>
            {/* Data Cards */}
            {memoizedDates.map(date => (
                <div className="room-chart-mobile-rooms-horizontal" key={date} style={{
                    display: 'flex',
                    gap: '8px',
                    overflowX: 'auto',
                    padding: '4px 0',
                    alignItems: 'center',
                    background: '#fff',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                    marginBottom: '1px'
                }}>
                    <div className="room-chart-mobile-date" style={{
                        minWidth: 70,
                        fontWeight: 'bold',
                        color: '#1976d2',
                        fontSize: '1.05rem',
                        textAlign: 'center'
                    }}>
                        {dayjs(date, "YYYY-MM-DD").format("MMM DD")}
                    </div>
                    {roomOptions.map(roomName => {
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
                        let displayText = '';
                        if (bookingActual) {
                            bgColor = getStatusColor(bookingActual);
                            displayText = `${getStartingCharacters(bookingActual.customerName)} 
                            ${bookingActual.numberOfPeople ? `(🧑‍💼${bookingActual.numberOfPeople})` : ''} `;
                        } else if (bookingInjected) {
                            bgColor = getStatusColor(bookingInjected);
                            displayText = bookingInjected.status || 'NONE';
                        }
                        return (
                            <div
                                key={roomName}
                                className="room-chart-mobile-room"
                                style={{
                                    backgroundColor: bgColor,
                                    color: '#fff',
                                    borderRadius: 8,
                                    minWidth: 80,
                                    padding: '8px 12px',
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.07)'
                                }}
                                onClick={bookingActual && bookingActual.status !== 'Available'
                                    ? () => onBookingClick(bookingActual)
                                    : bookingInjected ? () => onBookingClick(bookingInjected) : undefined}
                            >
                                <span style={{ fontSize: '0.95em' }}>
                                    {displayText}
                                </span>
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );

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
            <div className="room-chart-desktop">
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
            <div className="room-chart-mobile">
                {renderMobileCards()}
            </div>
        </div>
    );
};

export default RoomAvailabilityDotChart;
