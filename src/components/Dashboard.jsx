import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { loadFromSheetToBookings } from '../modules/constants';
import '../css/Dashboard.css';
import { getStartingCharacters } from '../modules/common.module';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingBookings: 0,
    todayCheckIns: 0,
    todayCheckOuts: 0,
    todayCheckInDetails: [],
    todayCheckOutDetails: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookingStats();
  }, []);

  const fetchBookingStats = async () => {
    try {
      setLoading(true);

      const bookings = await loadFromSheetToBookings();

      if (bookings) {
        const today = new Date().toISOString().split('T')[0];
        // Calculate stats
        const totalBookings = bookings.length;
        const upcomingBookings = bookings.filter(booking => {
          return booking.checkInDate >= today && booking.status !== 'Cancelled'; // Assuming index 8 is status
        }).length;

        const todayCheckIns = bookings.filter(booking => {
          return booking.checkInDate === today && booking.status !== 'Cancelled';
        }).length;

        const todayCheckOuts = bookings.filter(booking => {
          return booking.checkOutDate === today && booking.status !== 'Cancelled'; // Assuming index 4 is check-out date
        }).length;

        const todayCheckInDetails = bookings.filter(booking => {
          return booking.checkInDate === today && booking.status !== 'Cancelled'
        }).map(booking => ({
          customerName: getStartingCharacters(booking.customerName),
          numberOfPeople: booking.numberOfPeople,
          roomName: booking.roomName
        }));

        const todayCheckOutDetails = bookings.filter(booking => {
          return booking.checkOutDate === today && booking.status !== 'Cancelled'
        }).map(booking => ({
          customerName: getStartingCharacters(booking.customerName),
          numberOfPeople: booking.numberOfPeople,
          roomName: booking.roomName
        }));

        setStats({
          totalBookings,
          upcomingBookings,
          todayCheckIns,
          todayCheckOuts,
          todayCheckInDetails,
          todayCheckOutDetails
        });
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching booking stats:", err);
      setError("Failed to load booking statistics");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <div>
        <h2 style={{ textAlign: "center" }}>Dashboard</h2>
        {error && <div className="error-message">{error}</div>}
      </div>
      <div className="dashboard-container">
        {loading ? (
          <div className="loading">Loading statistics...</div>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <Link to="/search" state={{ exactStartDate: true }} className="action-button search">
                  <h3>Today's Check-ins</h3>
                </Link>
                <p className="stat-value">{stats.todayCheckIns}</p>
                {stats.todayCheckInDetails.map((detail, index) => (
                  <div key={index}>
                    <span>{detail.roomName}: {detail.customerName} (🧑‍💼{detail.numberOfPeople})</span>
                  </div>
                ))}
              </div>

              <div className="stat-card">
                <Link to="/search" state={{ exactStartDate: true }} className="action-button search">
                  <h3>Today's Check-outs</h3>
                </Link>
                <p className="stat-value">{stats.todayCheckOuts}</p>
                {stats.todayCheckOutDetails.map((detail, index) => (
                  <div key={index}>
                    <span>{detail.roomName}: {detail.customerName} (🧑‍💼{detail.numberOfPeople})</span>
                  </div>
                ))}
              </div>
              <div className="stat-card">
                <Link to="/search" className="action-button search">
                  <h3>Upcoming Bookings</h3>
                </Link>
                <p className="stat-value">{stats.upcomingBookings}</p>
              </div>
              <div className="stat-card">
                <Link
                  to="/search"
                  state={{ defaultCheckInDate: "2020-01-01" }}
                  className="action-button search"
                >
                  <h3>Total Bookings</h3>
                </Link>
                <p className="stat-value">{stats.totalBookings}</p>
              </div>
            </div>

            <div className="quick-actions">
              <h3>Quick Actions</h3>
              <div className="action-buttons">
                <Link to="/booking" state={{ from: 'dashboard' }} className="action-button create">
                  <span className="icon">+</span>
                  <span>New Booking</span>
                </Link>
                <Link to="/search" className="action-button find">
                  <span className="icon">🔍</span>
                  <span>Search Bookings</span>
                </Link>
                <button onClick={fetchBookingStats} className="action-button refresh">
                  <span className="icon">↻</span>
                  <span>Refresh Data</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;