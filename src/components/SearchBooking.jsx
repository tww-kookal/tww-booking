// SearchBooking.jsx
import React, { useState, useEffect } from "react";
import { SHEET_ID } from "../config";
import { useNavigate } from "react-router-dom";
import { BOOKING_DEFAULT, RANGE, roomOptions, statusOptions, sourceOptions, getCommissionPercent, calculateCommission, parseNumber } from "./constants";

import './css/searchBooking.css';

const SearchBooking = () => {
  const navigate = useNavigate();
  const [searchCriteria, setSearchCriteria] = useState({
    bookingDate: "",
    guestName: "",
    checkInDate: "",
    contactNumber: "",
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

  const convertGoogleDataToBookings = (sheetData) => {
    // Skip header row
    // const rows = sheetData.slice(1);
    console.log("Query From Google Data Sheet Returned ", sheetData.length);
    return sheetData.map((row) => {
      return {
        roomName: row[0] || '',
        customerName: row[1] || '',
        bookingDate: row[2] || '',
        checkInDate: row[3] || '',
        checkOutDate: row[4] || '',
        contactNumber: row[5] || '',
        numberOfPeople: Number(row[6] ? row[6].replace(/,/g, '') : 0) || 0,
        numberOfNights: Number(row[7] ? row[7].replace(/,/g, '') : 0) || 0,
        status: row[8] || '',
        sourceOfBooking: row[9] || '',
        roomAmount: Number(row[10] ? row[10].replace(/,/g, '') : 0) || 0,
        advancePaid: Number(row[11] ? row[11].replace(/,/g, '') : 0) || 0,
        advancePaidTo: row[12] || '',
        food: Number(row[13] ? row[13].replace(/,/g, '') : 0) || 0,
        campFire: Number(row[14] ? row[14].replace(/,/g, '') : 0) || 0,
        commission: Number(row[15] ? row[15].replace(/,/g, '') : 0) || 0,
        balanceToPay: Number(row[16] ? row[16].replace(/,/g, '') : 0) || 0,
        twwRevenue: Number(row[17] ? row[17].replace(/,/g, '') : 0) || 0,
        balancePaidTo: row[18] || '',
        remarks: row[19] || ''
      };
    });
  }

  const fetchGoogleSheetRecords = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: RANGE,
      });
      
      if (res.result.values && res.result.values.length > 0) {
        // Convert to bookings and filter based on search criteria
        const allBookings = convertGoogleDataToBookings(res.result.values);
        
        // Filter results based on search criteria
        const filteredResults = allBookings.filter(booking => {
          const matchesBookingDate = !searchCriteria.bookingDate || 
            booking.bookingDate.includes(searchCriteria.bookingDate);
          
          const matchesGuestName = !searchCriteria.guestName || 
            booking.customerName.toLowerCase().includes(searchCriteria.guestName.toLowerCase());
          
          const matchesCheckInDate = !searchCriteria.checkInDate || 
            booking.checkInDate.includes(searchCriteria.checkInDate);
          
          const matchesContactNumber = !searchCriteria.contactNumber || 
            booking.contactNumber.includes(searchCriteria.contactNumber);
          
          return matchesBookingDate && matchesGuestName && matchesCheckInDate && matchesContactNumber;
        });
        
        setResults(filteredResults);
        setCurrentPage(1);
      } else {
        setResults([]);
        setError("No bookings found");
      }
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
        
        <div className="search-actions">
          <button 
            className="search-button" 
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      <div className="results-section">
        {loading ? (
          <div className="loading-indicator">Loading bookings...</div>
        ) : results.length > 0 ? (
          <div className="table-container">
            <h3>Bookings Found ({results.length})</h3>
            <table className="booking-table">
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Guest Name</th>
                  <th>Booking Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>                  
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedResults.map((booking, index) => (
                  <tr key={index} className={booking.status === 'Cancelled' ? 'cancelled-booking' : ''}>
                    <td>{booking.roomName}</td>
                    <td>{booking.customerName}</td>
                    <td>{booking.bookingDate}</td>
                    <td>{booking.checkInDate}</td>
                    <td>{booking.checkOutDate}</td>
                    <td>{booking.contactNumber}</td>
                    <td>
                      <span className={`status-badge status-${booking.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="view-button" 
                        onClick={() => handleViewBooking(booking)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {results.length > itemsPerPage && (
              <div className="pagination">
                <button 
                  className="pagination-button" 
                  onClick={() => handlePageChange("prev")} 
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span className="page-info">Page {currentPage} of {Math.ceil(results.length / itemsPerPage)}</span>
                <button 
                  className="pagination-button" 
                  onClick={() => handlePageChange("next")} 
                  disabled={currentPage * itemsPerPage >= results.length}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : !error && (
          <div className="no-results">No bookings found. Try adjusting your search criteria.</div>
        )}
      </div>


    </div >
  );
};

export default SearchBooking;