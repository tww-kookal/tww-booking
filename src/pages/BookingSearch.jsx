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
import * as XLSX from 'xlsx';

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

  const handleDownloadToExcel = async () => {
    const excelData = results.map(booking => ({
      'Booking ID': booking.booking_id,
      'Check In': dayjs(booking.check_in).format('YYYY-MM-DD'),
      'Check Out': dayjs(booking.check_out).format('YYYY-MM-DD'),
      'Total Nights': booking.number_of_nights,
      'Number of Guests': booking.number_of_people,
      'Room Name': booking.room_name,
      'Room Price': booking.room_price,
      'Guest Name': `${booking.customer_name} (${booking.customer_id})`,
      'Guest Phone': booking.contact_number,
      'Food Price': booking.food_price,
      'Service Price': booking.service_price,
      'Booked By': `${booking.source_of_booking} (${booking.source_of_booking_id})`,
      'Commission %': booking.commission_percent,
      'Commission': booking.commission,
      'Total Price': booking.total_price,
      'Remarks': booking.remarks || '',
    }));
    if (!excelData.length) {
      toast.error('No bookings to download.');
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");
    XLSX.writeFile(workbook, "tww.xlsx");
  }

  const validateSearchFields = () => {
    const { from_date, to_date } = searchCriteria;
    //if either the date is present then the next is mandatory
    if ((from_date && !to_date) || (!from_date && to_date)) {
      toast.error('Please select both dates.');
      return false;
    }
    if (to_date < from_date) {
      toast.error('To date must be above or equal to From date.');
      return false;
    }
    return true;
  }

  const handleSearch = async () => {
    setLoading(true);
    if(!validateSearchFields()) {
      setLoading(false);
      return;
    }
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
    setSelectedBookingSource({
      value: 0,
      label: 'Select a referral...',
    });
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
          {results.length > 0 && (
            <button
              className="download-button"
              onClick={handleDownloadToExcel}
              style={{ width: '100%', marginTop: '10px' }}
            >
              Download as Excel
            </button>
          )}
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
