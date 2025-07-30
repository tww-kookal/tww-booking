import React, { useEffect, useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { roomOptions } from '../modules/constants';
import { loadFromSheetToBookings, prepareChartData, getStartingCharacters } from '../modules/common.module';
import '../css/availabilityChart.handheld.css';
import '../css/availabilityChart.large.css';

const AvailabilityChart = ({ startDate: propStartDate }) => {
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

    // Mobile-friendly card layout: horizontal alignment for rooms per date
    const renderCards = () => (
        <div className="room-chartlist">
            {/* Header Card */}
            <div className="room-chart-rooms-horizontal">
                <div className="room-chart-date">
                    Date
                </div>
                {roomOptions.map(roomName => (
                    <div
                        key={roomName}
                        className="room-chart-room"
                        style={{
                            background: '#e3eafc',
                            color: '#1976d2',
                        }}
                    >
                        {roomName}
                    </div>
                ))}
            </div>
            {/* Data Cards */}
            {memoizedDates.map(date => (
                <div className="room-chart-rooms-horizontal" key={date} style={{ padding: '4px 0', background: '#fff' }}>
                    <div className="room-chart-date" style={{ color: '#1976d2' }}>
                        {dayjs(date, "YYYY-MM-DD").format("MMM DD 'YY")}
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
                                className="room-chart-room"
                                style={{ backgroundColor: bgColor }}
                                onClick={bookingActual && bookingActual.status !== 'Available'
                                    ? () => onBookingClick(bookingActual)
                                    : bookingInjected ? () => onBookingClick(bookingInjected) : undefined}
                            >
                                <span style={{ fontSize: '1.15em' }}> {/* Increased font size by 2 */}
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
            <div className='form-search'>
                <label>Start Date: &nbsp;</label>
                <input
                    type="date"
                    value={startDate.format("YYYY-MM-DD")}
                    onChange={handleDateChange}
                />
            </div>
            <div className="room-chart" style={{ width: '100%' }} >
                {renderCards()}
            </div>
        </div>
    );
};

export default AvailabilityChart;
