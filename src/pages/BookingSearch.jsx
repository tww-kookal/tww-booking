import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from 'dayjs';
import BookingList from "./BookingList";
import { getAllBookings } from "../modules/booking.module";

import '../css/bookingSearch.large.css';
import '../css/bookingSearch.handheld.css';

const BookingSearch = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const today = new Date().toISOString().split('T')[0];
  const initialCheckInDate = location.state?.defaultCheckInDate || today;
  const exactStartDate = location.state?.exactStartDate || false;

  const [searchCriteria, setSearchCriteria] = useState({
    bookingDate: "",
    guestName: "",
    checkInDate: initialCheckInDate,
    contactNumber: "",
    bookingID: "",
  });
  const [results, setResults] = useState([]);
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
    fetchFutureBookings();
  }, []);

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
    <div className="search-booking-container" >
      <ToastContainer />
      <div className="search-header" >
        Search Bookings
      </div>

      <div className="search-form" >
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
          <input
            type="text"
            id="guestName"
            name="guestName"
            placeholder="Enter guest name"
            value={searchCriteria.guestName}
            onChange={handleInputChange}
            style={{ width: '100%' }}
          />
        </div>

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
          <label htmlFor="contactNumber">Contact Number:</label>
          <input
            type="text"
            id="contactNumber"
            name="contactNumber"
            placeholder="Enter contact number"
            value={searchCriteria.contactNumber}
            onChange={handleInputChange}
            style={{ width: '100%' }}
          />
        </div>

        <div className="search-field" >
          <label htmlFor="bookingID">Booking ID:</label>
          <input
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
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        handlePageChange={handlePageChange}
        handleViewBooking={handleViewBooking}
      />
    </div>
  );
};

export default BookingSearch;
