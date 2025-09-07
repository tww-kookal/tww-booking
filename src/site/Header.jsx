import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import api from "../modules/apiClient";
import { clearTokens, getUserContext, isTokenReceived, isUserInRoles, persistTokensReceived } from "../contexts/constants";

import '../css/login.large.css';
import '../css/login.handheld.css';

const Header = () => {

  const resetRoomFilterData = () => {
  }

  const navigate = useNavigate();
  const [header, setHeader] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    window.addEventListener('scroll', () =>
      window.scrollY > 50
        ? setHeader(true)
        : setHeader(false)
    );
  });

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const logout = () => {
    clearTokens();
    navigate("/");
  }

  // 🔑 Single flow: login once and get access token
  const login = useGoogleLogin({
    flow: "implicit", // or "auth-code" if you want to exchange server-side
    scope: "openid profile email https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive",
    response_type: "id_token token",   // ask for both
    onSuccess: async (tokenResponse) => {
      const { access_token, id_token } = tokenResponse;

      try {
        const resp = await api.post(`/users/googleAuth/login`, JSON.stringify({ token: access_token }));
        persistTokensReceived(resp?.data?.user || undefined, access_token);
        navigate('/dashboard')
      } catch (err) {
        console.error("Error logging in:", err.status);
        if (err.status == 404) {
          try {
            console.debug("Sign up.....")
            const signUpResp = await api.post(`/users/googleAuth/signup`, { token: access_token });
            persistTokensReceived(signUpResp?.data?.user || undefined, access_token);
            navigate("/dashboard");
          } catch (err) {
            console.error("Error signing up:", err);
            toast.error("Signup failed");
            return;
          }
        }
      }
    },
    onError: (err) => {
      console.error("Login Failed:", err);
      toast.error("Login failed");
    }
  });

  return (
    <header
      className={`fixed z-50 w-full transition-all duration-300 
      ${header ? 'bg-gray-600 py-2 shadow-lg' : 'bg-gray-400 py-2'}`}
    >

      <div className='container mx-auto flex flex-col lg:flex-row items-center lg:justify-between gap-y-6 lg:gap-y-0'>

        {/* Nav */}
        <nav className={`${header ? 'text-primary' : 'text-secondary'}
        flex gap-x-4 lg:gap-x-8 font-tertiary tracking-[3px] text-[15px] items-center uppercase`}>
          {/* Logo */}
          <Link to="/" onClick={resetRoomFilterData}>
            {
              header
                ? <img className='w-[180px]' src='./images/westwoodlogo2.png' />
                : <img className='w-[180px]' src='./images/westwoodlogo2.png' />
            }
          </Link>

          {/* Hamburger menu icon for mobile */}
          <div className="menu-icon" onClick={() => toggleMenu()}>
            ☰
          </div>

          {/* Overlay menu for mobile */}
          {isMenuOpen && (
            <div className="navbar-overlay" onClick={() => setIsMenuOpen(false)}>
              <div className="navbar-links-overlay" onClick={e => e.stopPropagation()}>
                <Link to='/' className='transition hover:text-accent' key='/' onClick={() => toggleMenu()}>
                  Home
                </Link>
                <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''} onClick={() => toggleMenu()}>
                  Dashboard
                </Link>
                <Link to="/availability" className={location.pathname === '/availability' ? 'active' : ''} onClick={() => toggleMenu()}>
                  Availability
                </Link>
                <Link to="/search" className={location.pathname === '/search' ? 'active' : ''} onClick={() => toggleMenu()}>
                  Search
                </Link>
                {isUserInRoles(['manager', 'owner']) ?
                  <Link to="/booking" className={location.pathname.includes('/booking') ? 'active' : ''} onClick={() => toggleMenu()}>
                    New
                  </Link>
                  : ''}
                {isUserInRoles(['manager', 'owner', 'employee']) ?
                  <Link to="/expenses" className={location.pathname === ('/expenses') ? 'active' : ''} onClick={() => toggleMenu()}>
                    Add Expense
                  </Link>
                  : ''}
                {isUserInRoles(['manager', 'owner', 'employee']) ?
                  <Link to="/expenses/search" className={location.pathname === '/expenses/search' ? 'active' : ''} onClick={() => toggleMenu()}>
                    Expenses
                  </Link>
                  : ''}
                {isTokenReceived() == false
                  ?
                  <Link className={location.pathname === '/signin' ? 'active' : ''} onClick={() => { toggleMenu(); login(); }}>
                    Sign in
                  </Link>
                  : ''}
              </div>
            </div>
          )}

          {/* Always visible links on large screens */}
          <div className="navbar-links-large">
            <Link to='/' className='transition hover:text-accent' key='/' >
              Home
            </Link>
            {isTokenReceived()
              ?
              <Link to="/dashboard" className='transition hover:text-accent' key='/dashboard'>
                Dashboard
              </Link>
              : ''}
            {isTokenReceived()
              ?
              <Link to="/availability" className='transition hover:text-accent' key='/availability'>
                Availability
              </Link>
              : ''}
            {isTokenReceived()
              ?
              <Link to="/search" className='transition hover:text-accent' key='/search'>
                Search
              </Link>
              : ''}
            {isUserInRoles(['manager', 'owner']) ?
              <Link to="/booking" className='transition hover:text-accent' key='/booking'>
                New
              </Link>
              : ''}
            {isUserInRoles(['manager', 'owner', 'employee']) ?
              <Link to="/expenses/search" className='transition hover:text-accent' key='/expenses/search'>
                Expenses
              </Link>
              : ''}
            {isTokenReceived()
              ?
              <Link to="/" onClick={() => logout()} className='transition hover:text-accent' key='/signin'>
                SignOut-[{getUserContext().logged_in_user.first_name}]
              </Link>
              :
              <Link onClick={() => login()} className='transition hover:text-accent' key='/signin'>
                Sign in
              </Link>
            }
          </div>

        </nav>

      </div>

    </header>
  );
};

export default Header;
