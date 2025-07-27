import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SHEET_ID, RANGE, convertGoogleDataToBookings } from './constants';
import './css/Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingBookings: 0,
    todayCheckIns: 0,
    todayCheckOuts: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookingStats();
  }, []);

  const fetchBookingStats = async () => {
    try {
      setLoading(true);
      const res = await window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: RANGE,
      });

      const bookings = convertGoogleDataToBookings(res.result.values);

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

        setStats({
          totalBookings,
          upcomingBookings,
          todayCheckIns,
          todayCheckOuts
        });
      }
    } catch (err) {
      console.error("Error fetching booking stats:", err);
      setError("Failed to load booking statistics");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading statistics...</div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Bookings</h3>
              <p className="stat-value">{stats.totalBookings}</p>
            </div>
            <Link to="/search" className="action-button search">
            <div className="stat-card">              
              <h3>Upcoming Bookings</h3>
              <p className="stat-value">{stats.upcomingBookings}</p>
            </div>
            </Link>
            <div className="stat-card">
              <h3>Today's Check-ins</h3>
              <p className="stat-value">{stats.todayCheckIns}</p>
            </div>
            <div className="stat-card">
              <h3>Today's Check-outs</h3>
              <p className="stat-value">{stats.todayCheckOuts}</p>
            </div>
          </div>

          <div className="quick-actions">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <Link to="/booking" state={{ from: 'dashboard' }} className="action-button create">
                <span className="icon">+</span>
                <span>New Booking</span>
              </Link>
              <Link to="/search" className="action-button search">
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
  );
};

export default Dashboard;