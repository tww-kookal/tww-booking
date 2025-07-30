import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { sortBookings, loadFromSheetToBookings } from "../modules/common.module";
import dayjs from 'dayjs';
import '../css/bookingSearch.large.css';
import '../css/bookingSearch.handheld.css';
import BookingList from "./BookingList";

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
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Reduced items per page for better mobile view

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchCriteria((prev) => ({ ...prev, [name]: value }));
  };

  const fetchGoogleSheetRecords = async () => {
    setLoading(true);
    setError("");
    try {
      const allBookings = await loadFromSheetToBookings();
      let filteredResults = [];
      const initialDate = dayjs(initialCheckInDate, "YYYY-MM-DD");

      if (!allBookings || allBookings.length <= 0) {
        setResults([]);
        setError("No bookings found");
        return;
      }

      if (!searchCriteria.bookingDate && !searchCriteria.guestName && !searchCriteria.checkInDate && !searchCriteria.contactNumber && !searchCriteria.bookingID) {
        filteredResults = allBookings.filter(booking => {
          return dayjs(booking.checkInDate, "YYYY-MM-DD").isAfter(initialDate) && booking.status !== 'Cancelled';
        });
      } else {
        filteredResults = allBookings.filter(booking => {
          const matchesBookingDate = !searchCriteria.bookingDate ||
            booking.bookingDate.includes(searchCriteria.bookingDate);

          const matchesGuestName = !searchCriteria.guestName ||
            booking.customerName.toLowerCase().includes(searchCriteria.guestName.toLowerCase());

          const matchesCheckInDate = !searchCriteria.checkInDate ||
            exactStartDate ? booking.checkInDate.includes(searchCriteria.checkInDate) : dayjs(booking.checkInDate, 'YYYY-MM-DD').add(-1, "day").isAfter(dayjs(searchCriteria.checkInDate, 'YYYY-MM-DD'));

          const matchesContactNumber = !searchCriteria.contactNumber ||
            booking.contactNumber.includes(searchCriteria.contactNumber);

          const matchesBookingID = !searchCriteria.bookingID ||
            booking.bookingID.toLowerCase().includes(searchCriteria.bookingID.toLowerCase());

          return matchesBookingDate && matchesGuestName && matchesCheckInDate &&
            matchesContactNumber && matchesBookingID;
        });
      }
      setResults(sortBookings(filteredResults));
      setCurrentPage(1);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch bookings. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoogleSheetRecords();
  }, []);

  const handleSearch = () => {
    fetchGoogleSheetRecords();
  };

  const handleViewBooking = (booking) => {
    navigate(`/booking/${encodeURIComponent(booking.customerName)}`, {
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
      <div className="search-header" >
        Search
      </div>

      <div className="search-form" >
        <div className="search-field" >
          <label>Booking Date:</label>
          <input
            type="date"
            name="bookingDate"
            value={searchCriteria.bookingDate}
            onChange={handleInputChange}
            style={{ width: '100%' }}
          />
        </div>

        <div className="search-field" >
          <label>Guest Name:</label>
          <input
            type="text"
            name="guestName"
            placeholder="Enter guest name"
            value={searchCriteria.guestName}
            onChange={handleInputChange}
            style={{ width: '100%' }}
          />
        </div>

        <div className="search-field" >
          <label>Check In Date:</label>
          <input
            type="date"
            name="checkInDate"
            value={searchCriteria.checkInDate}
            onChange={handleInputChange}
            style={{ width: '100%' }}
          />
        </div>

        <div className="search-field" >
          <label>Contact Number:</label>
          <input
            type="text"
            name="contactNumber"
            placeholder="Enter contact number"
            value={searchCriteria.contactNumber}
            onChange={handleInputChange}
            style={{ width: '100%' }}
          />
        </div>

        <div className="search-field" >
          <label>Booking ID:</label>
          <input
            type="text"
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

      {error && <div className="error-message">{error}</div>}

      <BookingList
        loading={loading}
        results={results}
        paginatedResults={paginatedResults}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        handlePageChange={handlePageChange}
        handleViewBooking={handleViewBooking}
        error={error}
      />
    </div>
  );
};

export default BookingSearch;
