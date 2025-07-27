import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './css/Navbar.css';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>The Westwood</h1>
      </div>
      <div className="navbar-links">
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
          Dashboard
        </Link>
        <Link to="/search" className={location.pathname === '/search' ? 'active' : ''}>
          Search Bookings
        </Link>
        <Link to="/booking" className={location.pathname.includes('/booking') ? 'active' : ''}>
          New Booking
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;