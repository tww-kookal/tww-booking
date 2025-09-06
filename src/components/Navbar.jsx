// FILEPATH: d:/xigma/apps/reactjs/tww-booking/src/components/NavBar.jsx

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { isUserInRoles } from '../contexts/constants';

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

      {/* Overlay menu for mobile */}
      {isMenuOpen && (
        <div className="navbar-overlay" onClick={() => setIsMenuOpen(false)}>
          <div className="navbar-links-overlay" onClick={e => e.stopPropagation()}>
            <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>
              Dashboard
            </Link>
            <Link to="/availability" className={location.pathname === '/availability' ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>
              Availability
            </Link>
            <Link to="/search" className={location.pathname === '/search' ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>
              Search
            </Link>
            {isUserInRoles(['manager', 'owner']) ?
              <Link to="/booking" className={location.pathname.includes('/booking') ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>
                New
              </Link>
              : ''}
            {isUserInRoles(['manager', 'owner', 'employee']) ?
              <Link to="/expenses" className={location.pathname === ('/expenses') ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>
                Add Expense
              </Link>
              : ''}
            {isUserInRoles(['manager', 'owner', 'employee']) ?
              <Link to="/expenses/search" className={location.pathname === '/expenses/search' ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>
                List Expenses
              </Link>
              : ''}
          </div>
        </div>
      )}

      {/* Always visible links on large screens */}
      <div className="navbar-links-large">
        <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
          Dashboard
        </Link>
        <Link to="/availability" className={location.pathname === '/availability' ? 'active' : ''}>
          Availability
        </Link>
        <Link to="/search" className={location.pathname === '/search' ? 'active' : ''}>
          Search
        </Link>
        <Link to="/booking" className={location.pathname.includes('/booking') ? 'active' : ''}>
          New
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;