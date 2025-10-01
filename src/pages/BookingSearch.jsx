import React, { useState, useEffect } from "react";
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from 'dayjs';
import BookingList from "./BookingList";
import { getAllAttachedBookings, getAllBookings } from "../modules/booking.module";
import { getAllCustomers } from '../modules/customer.module';

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
  const location = useLocation();
  const today = new Date().toISOString().split('T')[0];
  const initialCheckInDate = location.state?.defaultCheckInDate || today;
  const exactStartDate = location.state?.exactStartDate || false;
  const [customers, setCustomers] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [searchCriteria, setSearchCriteria] = useState({
    bookingDate: "",
    guestName: "",
    checkInDate: initialCheckInDate,
    contactNumber: "",
    bookingID: "",
  });
  const [results, setResults] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Reduced items per page for better mobile view

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchCriteria((prev) => ({ ...prev, [name]: value }));
  };

  const fetchFutureBookings = async (checkinSince = dayjs().add(-1, 'day').format('YYYY-MM-DD')) => {
    setLoading(true);
    try {
      const allBookings = await getAllBookings(navigate, checkinSince);
      if (!allBookings || allBookings.length <= 0) {
        setResults([]);
        return;
      }
      setResults(allBookings);

      const allAttachments = await getAllAttachedBookings(navigate);
      setAttachments(allAttachments?.files || []);
      setCurrentPage(1);
    } catch (err) {
      console.error("BookingSearch::FetchBookings::Error fetching data:", err);
      toast.error("Failed to fetch bookings. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllCustomers(navigate).then(customers => {
      setCustomers(customers);
      setCustomerOptions(customers.map(c => ({
        value: c.customer_id,
        label: `${c.customer_name} - ${c.phone}`
      })));
    })
    fetchFutureBookings();
  }, []);

  const handleCustomerChange = (e) => {
    setSelectedCustomer(e);
    handleChange({
      target: {
        name: "customer_id",
        value: e.value,
      }
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchCriteria((prev) => ({ ...prev, [name]: value }));
  }

  const handleSearch = () => {
    // if (!searchCriteria.bookingDate && !searchCriteria.guestName && !searchCriteria.checkInDate && !searchCriteria.contactNumber && !searchCriteria.bookingID) {
    //   filteredResults = allBookings.filter(booking => {
    //     return dayjs(booking.check_in, "YYYY-MM-DD").isAfter(initialDate) && booking.status !== BOOKING_STATUS.CANCELLED;
    //   });
    // } else {
    //   filteredResults = allBookings.filter(booking => {
    //     const matchesBookingDate = !searchCriteria.bookingDate ||
    //       booking.booking_date.includes(searchCriteria.bookingDate);

    //     const matchesGuestName = !searchCriteria.guestName ||
    //       booking.customer_name.toLowerCase().includes(searchCriteria.guestName.toLowerCase());

    //     const matchesCheckInDate = !searchCriteria.checkInDate ||
    //       exactStartDate ? booking.check_in.includes(searchCriteria.checkInDate) : dayjs(booking.check_in, 'YYYY-MM-DD').add(-1, "day").isAfter(dayjs(searchCriteria.checkInDate, 'YYYY-MM-DD'));

    //     const matchesContactNumber = !searchCriteria.contactNumber ||
    //       booking.contact_number.includes(searchCriteria.contactNumber);

    //     const matchesBookingID = !searchCriteria.bookingID ||
    //       booking.booking_id == searchCriteria.bookingID;

    //     return matchesBookingDate && matchesGuestName && matchesCheckInDate &&
    //       matchesContactNumber && matchesBookingID;
    //   });
    // }
    // fetchBookings( with respective search criteria object)
    fetchFutureBookings(searchCriteria.checkInDate);
  };

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
            <label htmlFor="checkInDate">Check In Date:</label>
            <input            
              type="date"
              id="checkInDate"
              name="checkInDate"
              value={searchCriteria.checkInDate}
              onChange={handleInputChange}
              style={{ width: '100%' }}
            />
          </div>

          <div className="search-field" >
            <label htmlFor="bookingDate">Booking Date:</label>
            <input
              type="date"
              id="bookingDate"
              name="bookingDate"
              value={searchCriteria.bookingDate}
              onChange={handleInputChange}
              style={{ width: '100%' }}
            />
          </div>

          <div className="search-field" >
            <label htmlFor="guestName">Guest Name:</label>
            <Select name="customer_id"
              isDisabled = {true}
              value={selectedCustomer}
              onChange={handleCustomerChange}
              options={customerOptions}
              placeholder="Select a guest..."
              isSearchable={true}
              classNamePrefix="react-select"
            />
          </div>

          <div className="search-field" >
            <label htmlFor="bookingID">Booking ID:</label>
            <input
              disabled = {true}
              type="text"
              id="bookingID"
              name="bookingID"
              placeholder="Enter booking ID"
              value={searchCriteria.bookingID}
              onChange={handleInputChange}
              style={{ width: '100%' }}
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
