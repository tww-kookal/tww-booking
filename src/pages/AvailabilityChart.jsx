import React, { useEffect, useState, useMemo } from 'react';
import ScrollToTop from '../site/ScrollToTop';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectFade, Autoplay } from 'swiper';
import '../styles.css'
import 'swiper/css/effect-fade';
import 'swiper/css';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import dayjs from 'dayjs';
import { prepareChartData, getStartingCharacters, getDisplayText, getStatusColorForActual, getStatusColor } from '../modules/common.module';
import '../css/availabilityChart.handheld.css';
import '../css/availabilityChart.large.css';
import { getAllBookings, getBooking, getAllRooms } from '../modules/booking.module';

const AvailabilityChart = ({ startDate: propStartDate }) => {
    const [chartLoading, setChartLoading] = useState(true);
    const [data, setData] = useState([]);
    const [rooms, setRooms] = useState([]);
    const navigate = useNavigate();

    const DEFAULT_NUMBER_OF_DAYS = 28;

    const [startDate, setStartDate] = useState(
        propStartDate ? dayjs(propStartDate) : dayjs().add(-3, 'day')
    );

    const dates = useMemo(() =>
        Array.from({ length: DEFAULT_NUMBER_OF_DAYS }, (_, i) =>
            dayjs(startDate).add(i, "day").format("YYYY-MM-DD")
        ), [startDate]
    );
    const memoizedDates = useMemo(() => dates, [dates]);

    useEffect(() => {
        const filterBookings = async () => {
            setChartLoading(true);
            try {
                const dateSet = new Set(
                    Array.from({ length: DEFAULT_NUMBER_OF_DAYS }, (_, i) => startDate.add(i, "day").format("YYYY-MM-DD"))
                );

                const rooms = await getAllRooms(navigate);
                setRooms(rooms || []);

                const bookings = await getAllBookings(navigate, startDate.format("YYYY-MM-DD"));
                const allData = prepareChartData(bookings, dateSet, memoizedDates);
                setData(allData);

            } catch (err) {
                console.error("AvailabilityChart::Error fetching data:", err);
                toast.error("Failed to fetch data. Please try again.");
                setRooms([]);
                setData([]);
            } finally {
                setChartLoading(false);
            }
        };
        filterBookings();
    }, [startDate, propStartDate]);

    const handleDateChange = (e) => {
        setStartDate(dayjs(e.target.value));
    };

    const onBookingClick = (booking, selectedDate, selectedRoom) => {
        console.debug("Is Injected or Actual ", booking, booking.booking_id)
        if (booking.chart_data === 'ACTUAL') {
            getBooking(navigate, booking.booking_id).then(booking => {
                navigate("/booking", { state: { preloadedBooking: booking } })
            }).catch(err => {
                console.error("AvailabilityChart::Error fetching booking:", err);
                toast.error("Failed to fetch booking. Please try again.");
            })
        } else if (booking.chart_data === 'INJECTED' && booking.chart_status === 'available') {
            // Navigate to booking to create a new booking
            navigate("/booking", { state: { checkInDate: selectedDate, selectedRoom: selectedRoom } })
        }
    };

    // Mobile-friendly card layout: horizontal alignment for rooms per date
    const renderCards = () => (
        <div className="room-chartlist">
            {/* Header Card */}
            <div className="room-chart-rooms-horizontal room-chart-header">
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
                        let bookingActual = data.find(
                            b =>
                                b.chart_data === 'ACTUAL' &&
                                b.room_name === room.room_name &&
                                //check if parameterDate is between check_in and check_out
                                (new dayjs(b.check_in, "YYYY-MM-DD").isSame(parameterDate) ||
                                    //new dayjs(b.check_out, "YYYY-MM-DD").isSame(parameterDate) ||
                                    (parameterDate.isAfter(new dayjs(b.check_in, "YYYY-MM-DD")) &&
                                        parameterDate.isBefore(new dayjs(b.check_out, "YYYY-MM-DD"))))
                        );

                        //update BookingActual roomname = 'none' and room id as 0 and status as available
                        if (bookingActual) {
                            let actualCheckOut = dayjs(bookingActual.check_out, "YYYY-MM-DD")
                            let actualCheckIn = dayjs(bookingActual.check_in, "YYYY-MM-DD")
                            if (parameterDate.isSame(actualCheckIn)) {
                                bookingActual = {
                                    ...bookingActual,
                                    isTodayCheckIn: true,
                                    isTodayCheckOut: false,
                                };
                            } else if (parameterDate.isSame(actualCheckOut)) {
                                bookingActual = {
                                    ...bookingActual,
                                    isTodayCheckOut: true,
                                    isTodayCheckIn: false,
                                };
                            } else if (parameterDate.isSame(actualCheckIn) && parameterDate.isSame(actualCheckOut)) {
                                bookingActual = {
                                    ...bookingActual,
                                    isTodayCheckIn: true,
                                    isTodayCheckOut: true,
                                };
                            }
                        }

                        const bookingInjected = data.find(
                            b =>
                                b.chart_data === 'INJECTED' &&
                                b.room_name === room.room_name &&
                                new dayjs(b.check_in, "YYYY-MM-DD").isSame(parameterDate)
                        );
                        let bgColor = '#5d595cff';
                        let displayText = '';
                        if (bookingActual) {
                            bgColor = getStatusColorForActual(bookingActual);
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
                                    ? () => onBookingClick(bookingActual, date, room)
                                    : bookingInjected ? () => onBookingClick(bookingInjected, date, room) : undefined}
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
        <div style={{ backgroundColor: 'black' }}>
            <ScrollToTop />
            <Swiper
                modules={[EffectFade, Autoplay]}
                effect={'fade'}
                loop={true}
                autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                }}
                className='heroSlider h-[100px] lg:h-[27px]'
            ></Swiper>
            <div className="room-chart-container">
                <ToastContainer />
                <div className='form-search'>
                    <label>Start Date: &nbsp;</label>
                    <input
                        type="date"
                        value={startDate.format("YYYY-MM-DD")}
                        onChange={handleDateChange}
                    />
                </div>
                <div className='room-chart-inner-container'>
                    {chartLoading && (
                        <div className='glass-pane'>
                            <div className="loading-spinner-large" />
                        </div>
                    )}
                    <div className="room-chart" style={{ width: '100%', maxHeight: '80vh', overflowY: 'auto' }}>
                        {renderCards()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AvailabilityChart;
