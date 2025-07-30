import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { sortBookings, loadFromSheetToBookings } from "../modules/constants";
import { useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import '../css/bookingSearch.css';
import BookingList from "./BookingList";

const BookingSearch = () => {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];
  const initialCheckInDate = useLocation().state?.defaultCheckInDate || today;
  const exactStartDate = useLocation().state?.exactStartDate || false;
  console.log("Initial Check-in Date:", initialCheckInDate, ", Exact Start Date:", exactStartDate);
  const [searchCriteria, setSearchCriteria] = useState({
    bookingDate: "",
    guestName: "",
    checkInDate: initialCheckInDate,
    contactNumber: "",
    bookingID: "", // Added bookingID to search criteria
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
      // If no bookings found, set results to empty and show error
      if (!allBookings || allBookings.length <= 0) {
        setResults([]);
        setError("No bookings found");
      }

      if (!searchCriteria.bookingDate && !searchCriteria.guestName && !searchCriteria.checkInDate && !searchCriteria.contactNumber && !searchCriteria.bookingID) {
        filteredResults = allBookings.filter(booking => {
          return dayjs(booking.checkInDate, "YYYY-MM-DD").isAfter(initialDate) && booking.status !== 'Cancelled';
        });
      } else {
        // Convert to bookings and filter based on search criteria
        // Filter results based on search criteria
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

  // Load all bookings on component mount
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

  const handleCreateNew = () => {
    navigate('/booking', { state: { from: 'search' } });
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
    <div className="search-booking-container">
      <div className="search-header">
        <h2>Search Bookings</h2>
        <button className="create-new-button" onClick={handleCreateNew}>Create New Booking</button>
      </div>

      <div className="search-form">
        <div className="search-row">
          <div className="search-field">
            <label>Booking Date:</label>
            <input
              type="date"
              name="bookingDate"
              value={searchCriteria.bookingDate}
              onChange={handleInputChange}
            />
          </div>

          <div className="search-field">
            <label>Guest Name:</label>
            <input
              type="text"
              name="guestName"
              placeholder="Enter guest name"
              value={searchCriteria.guestName}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="search-row">
          <div className="search-field">
            <label>Check In Date:</label>
            <input
              type="date"
              name="checkInDate"
              value={searchCriteria.checkInDate}
              onChange={handleInputChange}
            />
          </div>

          <div className="search-field">
            <label>Contact Number:</label>
            <input
              type="text"
              name="contactNumber"
              placeholder="Enter contact number"
              value={searchCriteria.contactNumber}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="search-row">
          <div className="search-field">
            <label>Booking ID:</label>
            <input
              type="text"
              name="bookingID"
              placeholder="Enter booking ID"
              value={searchCriteria.bookingID}
              onChange={handleInputChange}
            />
          </div>
          <div className="search-field">
            {/* Empty div to maintain grid layout */}
          </div>
        </div>

        <div className="search-actions">
          <button
            className="search-button"
            onClick={handleSearch}
            disabled={loading}
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
