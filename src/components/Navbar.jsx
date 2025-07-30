import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../css/navbar.large.css';
import '../css/navbar.handheld.css';

const Navbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        The Westwood
      </div>

      {/* Hamburger menu icon for mobile */}
      <div className="menu-icon" onClick={toggleMenu}>
        ☰
      </div>

      <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`} >
        <Link to="/" className={location.pathname === '/' ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>
          Dashboard
        </Link>
        <Link to="/availability" className={location.pathname === '/availability' ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>
          Availability
        </Link>
        <Link to="/search" className={location.pathname === '/search' ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>
          Search
        </Link>
        <Link to="/booking" className={location.pathname.includes('/booking') ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>
          New
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;