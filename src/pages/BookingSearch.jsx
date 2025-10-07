import React, { useState, useEffect } from "react";
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from 'dayjs';
import BookingList from "./BookingList";
import { getAllAttachedBookings, getAllBookings, searchBookings } from "../modules/booking.module";
import { getAllBookingSources } from '../modules/users.module';

import '../css/bookingSearch.large.css';
import '../css/bookingSearch.handheld.css';

import ScrollToTop from '../site/ScrollToTop';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectFade, Autoplay } from 'swiper';
import '../styles.css'
import 'swiper/css/effect-fade';
import 'swiper/css';

const BookingSearch = () => {
  const navigate = useNavigate();

  const [searchCriteria, setSearchCriteria] = useState({});
  const [results, setResults] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Reduced items per page for better mobile view
  const [users, setUsers] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [selectedBookingSource, setSelectedBookingSource] = useState(null);

  useEffect(() => {
    getAllBookingSources(navigate).then(users => {
      setUsers(users);
      setUserOptions(users.map(u => ({
        value: u.user_id,
        label: `${u.first_name} ${u.last_name} - ${u.phone}`,
      })));
    }).catch(err => {
      console.error('Booking::Error fetching users:', err);
      toast.error('Failed to fetch users');
    }).finally(() => {
    })
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchCriteria((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const bookings = await searchBookings(navigate, searchCriteria);
      setResults(bookings);
      const allAttachments = await getAllAttachedBookings(navigate);
      setAttachments(allAttachments?.files || []);
      setCurrentPage(1);
    } catch (error) {
      console.error('BookingSearch::Error fetching bookings:', error);
      toast.error("Failed to fetch bookings. Please try again.");
      setResults([]);
      setAttachments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setLoading(false);
    setSearchCriteria({});
    setResults([]);
  }

  const findAttachmentsForBooking = (booking_id) => {
    if (!booking_id) {
      return []
    }
    return attachments.filter(attachment => {
      return attachment.name == booking_id;
    })
  }

  const handleViewBooking = (booking) => {
    navigate(`/booking`, {
      state: {
        preloadedBooking: booking,
        from: 'search'
      }
    });
  };

  const paginatedResults = results.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (direction) => {
    if (direction === "prev" && currentPage > 1) setCurrentPage(currentPage - 1);
    if (direction === "next" && currentPage < Math.ceil(results.length / itemsPerPage)) setCurrentPage(currentPage + 1);
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
      <div className="search-booking-container" >
        <div className="search-header" >
          Search Bookings
        </div>

        <div className="search-form" >
          <div className="search-field" >
            <label htmlFor="from_date">From Date:</label>
            <input
              type="date"
              id="from_date"
              name="from_date"
              value={searchCriteria.from_date}
              onChange={handleInputChange}
              style={{ width: '100%' }}
            />
          </div>

          <div className="search-field" >
            <label htmlFor="to_date">To Date:</label>
            <input
              type="date"
              id="to_date"
              name="to_date"
              value={searchCriteria.to_date}
              onChange={handleInputChange}
              style={{ width: '100%' }}
            />
          </div>

          <div className="search-field" >
            <label htmlFor="guest_name">Guest Name:</label>
            <input
              type="text"
              id="guest_name"
              name="guest_name"
              value={searchCriteria.guest_name}
              onChange={handleInputChange}
              style={{ width: '100%' }}
            />
          </div>

          <div className="search-field" >
            <label htmlFor="guest_phone">Phone Number:</label>
            <input
              type="text"
              id="guest_phone"
              name="guest_phone"
              value={searchCriteria.guest_phone}
              onChange={handleInputChange}
              style={{ width: '100%' }}
            />
          </div>

          <div className='search-field'>
            <label>Source</label>
            <Select name="source_of_booking_id"
              value={selectedBookingSource}
              onChange={e => {
                setSearchCriteria(prev => ({ ...prev, source_of_booking_id: e.value }));
                setSelectedBookingSource({
                  value: e.value,
                  label: e.label,
                });
              }}
              options={userOptions}
              placeholder="Select a referral..."
              isSearchable={true}
              classNamePrefix="react-select"
              className="react-select-style"
            />
          </div>

          <button
            className="search-button"
            onClick={handleSearch}
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? (
              <span className="searching-animation">
                Searching
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </span>
            ) : 'Search'}
          </button>
          <button
            className="cancel-button"
            onClick={handleCancel}
            disabled={loading}
            style={{ width: '100%' }}
          >
            Cancel
          </button>
        </div>

        <BookingList
          loading={loading}
          results={results}
          paginatedResults={paginatedResults}
          findAttachmentsForBooking={findAttachmentsForBooking}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          handlePageChange={handlePageChange}
          handleViewBooking={handleViewBooking}
        />
      </div>
    </div>
  );
};

export default BookingSearch;
