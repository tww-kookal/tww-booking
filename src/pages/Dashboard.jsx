import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Link, useNavigate } from 'react-router-dom';
import '../css/dashboard.handheld.css';
import '../css/dashboard.large.css';
import { getStartingCharacters } from '../modules/common.module';
import { getAllBookings, getGuestsForDay } from '../modules/booking.module';
import { BOOKING_STATUS } from '../modules/constants';

import dayjs from 'dayjs';

const Dashboard = () => {
  const [todayCheckIns, setTodayCheckIns] = useState(0);
  const [todayCheckOuts, setTodayCheckOuts] = useState(0);
  const [guestsForDay, setGuestsForDay] = useState(0);
  const [upcomingBookings, setUpcomingBookings] = useState(0);
  const [todayCheckInDetails, setTodayCheckInDetails] = useState([]);
  const [todayCheckOutDetails, setTodayCheckOutDetails] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookingStats();
  }, []);

  const fetchBookingStats = async () => {
    // No loading state set here to allow immediate render with default values

    getGuestsForDay(navigate).then(guests => {
      setGuestsForDay(guests);
    });

    getAllBookings(navigate).then(bookings => {
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
  };

  return (
    <div className="dashboard-container">
      <ToastContainer />
      <>
        <div className="stats-grid">
          <div className="stat-card">
            <Link to="/availability" state={{ exactStartDate: true }} className="action-button search">
              <h3>Today's Check-ins</h3>
            </Link>
            <p className="stat-value">{todayCheckIns}</p>
            {todayCheckInDetails.map((detail, index) => (
              <div key={index}>
                <span>{detail.room_name}: {detail.customer_name} (🧑‍💼{detail.number_of_people})</span>
              </div>
            ))}
          </div>

          <div className="stat-card">
            <Link to="/availability" state={{ exactStartDate: true }} className="action-button search">
              <h3>Today's Check-outs</h3>
            </Link>
            <p className="stat-value">{todayCheckOuts}</p>
            {todayCheckOutDetails.map((detail, index) => (
              <div key={index}>
                <span>{detail.room_name}: {detail.customer_name} (🧑‍💼{detail.number_of_people})</span>
              </div>
            ))}
          </div>
          <div className="stat-card">
            <Link
              to="/availability"
              state={{ defaultCheckInDate: "2020-01-01" }}
              className="action-button search"
            >
              <h3>Today's Guests Count</h3>
            </Link>
            <p className="stat-value">{guestsForDay}</p>
          </div>
          <div className="stat-card">
            <Link to="/search" className="action-button search">
              <h3>Upcoming Bookings</h3>
            </Link>
            <p className="stat-value">{upcomingBookings}</p>
          </div>
        </div>
        <div className="quick-actions">
          <div className="action-buttons">
            <Link to="/booking" state={{ from: 'dashboard' }} className="action-button create">
              <span className="icon">+</span>
              <span>New</span>
            </Link>
            <Link to="/availability" state={{ from: 'dashboard' }} className="action-button find">
              <span className="icon"></span>
              <span>Availability</span>
            </Link>
            <Link to="/search" className="action-button find">
              <span className="icon">🔍</span>
              <span>Search</span>
            </Link>
            <button onClick={fetchBookingStats} className="action-button refresh">
              <span className="icon">↻</span>
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </>
    </div>
  )
};

export default Dashboard;