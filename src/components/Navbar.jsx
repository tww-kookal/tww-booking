import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../css/Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand" style ={{ display: 'flex', alignItems: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
        The Westwood
      </div>

      {/* Hamburger menu icon for mobile */}
      <div className="menu-icon" onClick={toggleMenu}>
        ☰
      </div>

      <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`} style ={{ display: 'flex', alignItems: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
        <Link to="/" className={location.pathname === '/' ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>
          Dashboard
        </Link>
        <Link to="/availability" className={location.pathname === '/availability' ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>
          Availability
        </Link>
        <Link to="/search" className={location.pathname === '/search' ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>
          Search Bookings
        </Link>
        <Link to="/booking" className={location.pathname.includes('/booking') ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>
          New Booking
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;