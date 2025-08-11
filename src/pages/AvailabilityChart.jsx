import React, { useEffect, useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { prepareChartData, getStartingCharacters, getDisplayText, getStatusColor } from '../modules/common.module';
import '../css/availabilityChart.handheld.css';
import '../css/availabilityChart.large.css';
import { getAllBookings, getAllRooms } from '../modules/booking.module';

const AvailabilityChart = ({ startDate: propStartDate }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState([]);
    const [rooms, setRooms] = useState([]);

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
            const dateSet = new Set(
                Array.from({ length: DEFAULT_NUMBER_OF_DAYS }, (_, i) => startDate.add(i, "day").format("YYYY-MM-DD"))
            );

            getAllRooms().then(rooms => {
                setLoading(true);
                setRooms(rooms || []);
                setError(null)
            }).catch(err => {
                console.error("AvailabilityChart::Error fetching rooms:", err);
                setError("Unable to get the rooms");
                setRooms([]);
            }).finally(() => {
                setLoading(false);
            })

            getAllBookings(startDate.format("YYYY-MM-DD")).then(bookings => {
                setLoading(true);
                const allData = prepareChartData(bookings, dateSet, memoizedDates);
                setError(null);
                setData(allData);
            }).catch(err => {
                console.error("AvailabilityChart::Error fetching data:", err);
                setError("Failed to fetch bookings. Please try again.");
                setData([]);
            }).finally(() => {
                setLoading(false);
            });
        };
        filterBookings();
    }, [startDate, propStartDate]);

    const handleDateChange = (e) => {
        setStartDate(dayjs(e.target.value));
    };

    const onBookingClick = (booking) => {
        // Implement your booking click logic here
    };

    // Mobile-friendly card layout: horizontal alignment for rooms per date
    const renderCards = () => (
        <div className="room-chartlist">
            {/* Header Card */}
            <div className="room-chart-rooms-horizontal">
                <div className="room-chart-date">
                    Date
                </div>
                {rooms.map(room => (
                    <div
                        key={room.room_id}
                        className="room-chart-room"
                        style={{
                            background: '#e3eafc',
                            color: '#1976d2',
                        }}
                    >
                        {room.room_name}
                    </div>
                ))}
            </div>
            {/* Data Cards */}
            {memoizedDates.map(date => (
                <div className="room-chart-rooms-horizontal" key={date} style={{ padding: '4px 0', background: '#fff' }}>
                    <div className="room-chart-date" style={{ color: '#1976d2' }}>
                        {dayjs(date, "YYYY-MM-DD").format("MMM DD 'YY")}
                    </div>
                    {rooms.map(room => {
                        const parameterDate = dayjs(date, "YYYY-MM-DD");
                        const bookingActual = data.find(
                            b =>
                                b.chart_data === 'ACTUAL' &&
                                b.room_name === room.room_name &&
                                new dayjs(b.check_in, "YYYY-MM-DD").isSame(parameterDate)
                        );
                        const bookingInjected = data.find(
                            b =>
                                b.chart_data === 'INJECTED' &&
                                b.room_name === room.room_name &&
                                new dayjs(b.check_in, "YYYY-MM-DD").isSame(parameterDate)
                        );
                        let bgColor = '#5d595cff';
                        let displayText = '';
                        if (bookingActual) {
                            bgColor = getStatusColor(bookingActual);
                            displayText = `${getStartingCharacters(bookingActual.customer_name)} 
                            ${bookingActual.number_of_people ? `(🧑‍💼${bookingActual.number_of_people})` : ''} `;
                        } else if (bookingInjected) {
                            bgColor = getStatusColor(bookingInjected);
                            displayText = getDisplayText(bookingInjected);
                        }
                        return (
                            <div
                                key={room.room_id}
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
