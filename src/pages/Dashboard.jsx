import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Link, useNavigate } from 'react-router-dom';
import '../css/dashboard.handheld.css';
import '../css/dashboard.large.css';
import { getStartingCharacters } from '../modules/common.module';
import { getAllBookings, getGuestsForDay } from '../modules/booking.module';
import { getConslidatedFinancials } from '../modules/accounting.module';
import { BOOKING_STATUS, USER_LOCALE } from '../modules/constants';
import { isUserInRoles } from '../contexts/constants';
import dayjs from 'dayjs';

import ScrollToTop from '../site/ScrollToTop';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectFade, Autoplay } from 'swiper';
import '../styles.css'
import 'swiper/css/effect-fade';
import 'swiper/css';

const Dashboard = () => {
  const [todayCheckIns, setTodayCheckIns] = useState(0);
  const [todayCheckOuts, setTodayCheckOuts] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [grossProfit, setGrossProfit] = useState(0);
  const [guestsForDay, setGuestsForDay] = useState(0);
  const [upcomingBookings, setUpcomingBookings] = useState(0);
  const [todayCheckInDetails, setTodayCheckInDetails] = useState([]);
  const [todayCheckOutDetails, setTodayCheckOutDetails] = useState([]);
  const [grossProfitColor, setGrossProfitColor] = useState('black');
  const [isFinancialsLoading, setIsFinancialsLoading] = useState(true);
  const [isBookingsLoading, setIsBookingsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookingStats();
  }, []);

  const fetchBookingStats = async () => {
    // No loading state set here to allow immediate render with default values
    setIsFinancialsLoading(true);
    setIsBookingsLoading(true);
    const guestsForDayPromise = getGuestsForDay(navigate).then(guests => {
      setGuestsForDay(guests);
    });

    const financialsPromise = getConslidatedFinancials(navigate, {
      acc_category_type: 'transaction',
      transaction_date: dayjs().startOf('month').format('YYYY-MM-DD'),
      transaction_end_date: dayjs().endOf('month').format('YYYY-MM-DD')
    }).then(financials => {
      setMonthlyRevenue((financials?.sales || 0).toLocaleString(USER_LOCALE, { maximumFractionDigits: 0 }));
      setMonthlyExpenses((financials?.expenses || 0).toLocaleString(USER_LOCALE, { maximumFractionDigits: 0 }));
      setGrossProfit((financials?.revenue || 0).toLocaleString(USER_LOCALE, { maximumFractionDigits: 0 }));
      setGrossProfitColor(financials?.revenue < 0 ? 'red' : financials?.revenue > monthlyIncome * 0.3 ? 'rgb(30, 144, 255)' : 'black');
    });

    Promise.all([financialsPromise]).then(() => {
      setIsFinancialsLoading(false);
    });

    const bookingsPromise = getAllBookings(navigate).then(bookings => {
      if (bookings) {
        const today = new dayjs().format("YYYY-MM-DD");
        // Calculate stats
        const upcomingBookings = bookings.filter(booking => {
          return booking.check_in >= today && booking.status !== BOOKING_STATUS.CANCELLED;
        }).length;
        setUpcomingBookings(upcomingBookings);

        const todayCheckIns = bookings.filter(booking => {
          return booking.check_in === today && booking.status !== BOOKING_STATUS.CANCELLED;
        }).length;
        setTodayCheckIns(todayCheckIns);

        const todayCheckOuts = bookings.filter(booking => {
          return booking.check_out === today && booking.status == BOOKING_STATUS.CONFIRMED;
        }).length;
        setTodayCheckOuts(todayCheckOuts);

        const todayCheckInDetails = bookings.filter(booking => {
          return booking.check_in === today && booking.status !== BOOKING_STATUS.CANCELLED
        }).map(booking => ({
          customer_name: getStartingCharacters(booking.customer_name),
          number_of_people: booking.number_of_people,
          room_name: booking.room_name
        }));
        setTodayCheckInDetails(todayCheckInDetails);

        const todayCheckOutDetails = bookings.filter(booking => {
          return booking.check_out === today && booking.status !== BOOKING_STATUS.CANCELLED
        }).map(booking => ({
          customer_name: getStartingCharacters(booking.customer_name),
          number_of_people: booking.number_of_people,
          room_name: booking.room_name
        }));
        setTodayCheckOutDetails(todayCheckOutDetails);
      }
    }).catch(err => {
      console.error("Dashboard::fetchBookingStats::Error fetching booking stats:", err);
      toast.error("Failed to load booking statistics.");
    });

    Promise.all([guestsForDayPromise, bookingsPromise]).then(() => {
      setIsBookingsLoading(false);
    });
  };

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
      <ToastContainer />

      <div className="dashboard-container">
        <div className="quick-actions">
          <div className="action-buttons">
            {isUserInRoles(['manager', 'owner']) ?
              <Link to="/booking" state={{ from: 'dashboard' }} className="action-button create">
                <span className="icon">+</span>
                <span>New</span>
              </Link>
              : ''}

            <Link to="/availability" state={{ from: 'dashboard' }} className="action-button find">
              <span className="icon">↻</span>
              <span>Availability</span>
            </Link>
            <Link to="/booking/search" className="action-button find">
              <span className="icon">🔍</span>
              <span>Search</span>
            </Link>
            <button onClick={fetchBookingStats} className="action-button refresh">
              <span className="icon">↻</span>
              <span>Refresh</span>
            </button>
            <Link to="/transactions" className="action-button find">
              <span className="icon">➕</span>
              <span>Transaction</span>
            </Link>
          </div>
        </div>
        <div className="stats-grid">
          <div className="stat-card">
            <Link to="/availability" state={{ exactStartDate: true }} className="action-button search">
              <h3>Today's Check-ins</h3>
            </Link>
            {isBookingsLoading ?
              <div className="loading-spinner"></div>
              :
              <>
                <p className="stat-value">{todayCheckIns}</p>
                {todayCheckInDetails.map((detail, index) => (
                  <div key={index}>
                    <span>{detail.room_name}: {detail.customer_name} (🧑‍💼{detail.number_of_people})</span>
                  </div>
                ))}
              </>
            }
          </div>

          <div className="stat-card">
            <Link to="/availability" state={{ exactStartDate: true }} className="action-button search">
              <h3>Today's Check-outs</h3>
            </Link>
            {isBookingsLoading ?
              <div className="loading-spinner"></div>
              :
              <>
                <p className="stat-value">{todayCheckOuts}</p>
                {todayCheckOutDetails.map((detail, index) => (
                  <div key={index}>
                    <span>{detail.room_name}: {detail.customer_name} (🧑‍💼{detail.number_of_people})</span>
                  </div>
                ))}
              </>
            }
          </div>
          <div className="stat-card">
            <Link
              to="/availability"
              state={{ defaultCheckInDate: "2020-01-01" }}
              className="action-button search"
            >
              <h3>Today's Guests Count</h3>
            </Link>
            {isBookingsLoading ?
              <div className="loading-spinner"></div>
              :
              <p className="stat-value">{guestsForDay}</p>
            }
          </div>
          <div className="stat-card">
            <Link to="/booking/search" className="action-button search">
              <h3>Upcoming Bookings</h3>
            </Link>
            {isBookingsLoading ?
              <div className="loading-spinner"></div>
              :
              <p className="stat-value">{upcomingBookings}</p>
            }
          </div>
          {isUserInRoles(['manager', 'owner']) ?
            <div className="stat-card">
              <Link to="/transactions/search" className="action-button search">
                <h3>{dayjs().format("MMMM")} Expenses</h3>
              </Link>
              {isFinancialsLoading ?
                <div className="loading-spinner"></div>
                :
                <p className="stat-value">{monthlyExpenses}</p>
              }
            </div>
            : ''}
          {isUserInRoles(['manager', 'owner']) ?
            <div className="stat-card">
              <Link to="/expenses" className="action-button search">
                <h3>{dayjs().format("MMMM")} Revenue</h3>
              </Link>
              {isFinancialsLoading ?
                <div className="loading-spinner"></div>
                :
                <p className="stat-value">{monthlyRevenue}</p>
              }
            </div>
            : ''}
          {isUserInRoles(['manager', 'owner']) ?
            <div className="stat-card">
              <Link to="/expenses" className="action-button search">
                <h3>
                  {dayjs().format("MMMM")} Gross Profit
                </h3>
              </Link>
              {isFinancialsLoading ?
                <div className="loading-spinner"></div>
                :
                <p className="stat-value" style={{ color: grossProfitColor }}>
                  {grossProfit}
                </p>
              }
            </div>
            : ''}
        </div>
      </div>
    </div>
  )
};

export default Dashboard;