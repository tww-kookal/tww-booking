import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import api from "../modules/apiClient";
import { clearTokens, getUserContext, isTokenReceived, isUserInRoles, persistTokensReceived } from "../contexts/constants";

const Header = () => {

  const resetRoomFilterData = () => {
  }

  const navigate = useNavigate();
  const [header, setHeader] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBookingOpen, setBookingOpen] = useState(false);
  const [isTransactionsOpen, setTransactionsOpen] = useState(false);

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
                {isUserInRoles(['manager', 'owner', 'employee']) &&
                  <>
                    <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''} onClick={() => toggleMenu()}>
                      Dashboard
                    </Link>
                    <Link to="/availability" className={location.pathname === '/availability' ? 'active' : ''} onClick={() => toggleMenu()}>
                      Availability
                    </Link>
                  </>
                }

                {/* Booking */}
                {isUserInRoles(['manager', 'owner', 'employee']) &&
                  <>
                    <div className='font-bold'>Booking</div>
                    <Link to="/booking/search" className={`ml-4 ${location.pathname === '/booking/search' ? 'active' : ''}`} onClick={() => toggleMenu()}>
                      Search
                    </Link>
                    {isUserInRoles(['manager', 'owner']) &&
                      <Link to="/booking" className={`ml-4 ${location.pathname.includes('/booking') ? 'active' : ''}`} onClick={() => toggleMenu()}>
                        New
                      </Link>
                    }
                  </>
                }

                {/* Transactions */}
                {isUserInRoles(['manager', 'owner', 'employee']) &&
                  <>
                    <div className='font-bold'>Transactions</div>
                    <Link to="/transactions/search" className={`ml-4 ${location.pathname === '/transactions/search' ? 'active' : ''}`} onClick={() => toggleMenu()}>
                      Search
                    </Link>
                    <Link to="/expenses" className={`ml-4 ${location.pathname === '/expenses/new' ? 'active' : ''}`} onClick={() => toggleMenu()}>
                      Add Expense
                    </Link>
                  </>
                }

                {isTokenReceived() == false
                  ?
                  <Link className={location.pathname === '/signin' ? 'active' : ''} onClick={() => { toggleMenu(); login(); }}>
                    Sign in
                  </Link>
                  :
                  <Link to="/" onClick={() => { toggleMenu(); logout() }} className='transition hover:text-accent' key='/signin'>
                    SignOut-[{getUserContext().logged_in_user.first_name}]
                  </Link>
                }
              </div>
            </div>
          )}

          {/* Always visible links on large screens */}
          <div className="hidden lg:flex items-center gap-x-8">
            <Link to='/' className='transition hover:text-accent' key='/'>
              Home
            </Link>
            {isUserInRoles(['manager', 'owner', 'employee']) &&
              <>
                <Link to="/dashboard" className='transition hover:text-accent' key='/dashboard'>
                  Dashboard
                </Link>
                <Link to="/availability" className='transition hover:text-accent' key='/availability'>
                  Availability
                </Link>
              </>
            }

            {/* Booking Dropdown */}
            {isUserInRoles(['manager', 'owner', 'employee']) &&
              <div className="relative" onMouseEnter={() => setBookingOpen(true)} onMouseLeave={() => setBookingOpen(false)}>
                <button className='transition hover:text-accent'>BOOKING</button>
                {isBookingOpen && (
                  <div className="absolute top-full left-0 bg-white shadow-lg rounded-md py-2 w-32" onMouseEnter={() => setBookingOpen(true)} onMouseLeave={() => setBookingOpen(false)}>
                    <Link to="/booking/search" className='block px-4 py-2 text-gray-800 hover:bg-gray-100'>Search</Link>
                    <Link to="/booking" className='block px-4 py-2 text-gray-800 hover:bg-gray-100'>
                      New
                    </Link>
                  </div>
                )}
              </div>
            }

            {/* Transactions Dropdown */}
            {isUserInRoles(['manager', 'owner']) &&
              <div className="relative" onMouseEnter={() => setTransactionsOpen(true)} onMouseLeave={() => setTransactionsOpen(false)}>
                <button className='transition hover:text-accent'>TRANSACTIONS</button>
                {isTransactionsOpen && (
                  <div className="absolute top-full left-0 bg-white shadow-lg rounded-md py-2 w-32" onMouseEnter={() => setTransactionsOpen(true)} onMouseLeave={() => setTransactionsOpen(false)}>
                    <Link to="/transactions/search" className='block px-4 py-2 text-gray-800 hover:bg-gray-100'>Search</Link>
                    <Link to="/expenses" className='block px-4 py-2 text-gray-800 hover:bg-gray-100'>Add Expense</Link>
                  </div>
                )}
              </div>
            }

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
