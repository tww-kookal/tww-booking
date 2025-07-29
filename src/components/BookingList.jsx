import React from 'react';
import './css/bookingList.css';

const BookingList = ({ loading, results, paginatedResults, itemsPerPage, currentPage, handlePageChange, handleViewBooking, error }) => (
    <div className="results-section responsive-booking-list">
        {loading ? (
            <div className="loading-indicator">Loading bookings...</div>
        ) : results.length > 0 ? (
            <div className="table-container">
                <h3 style={{ fontSize: 'clamp(1.1rem, 2vw, 1.7rem)' }}>Bookings Found ({results.length})</h3>
                <div className="booking-table-scroll-wrapper" style={{ width: '100%', maxWidth: '100vw', overflowX: 'auto' }}>
                    <table id="bookingList" className="booking-table" style={{ width: '100%', tableLayout: 'auto' }}>
                        <thead>
                            <tr>
                                <th>Booking ID</th>
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
                                    <td>{booking.bookingID}</td>
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
                </div>

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
);

export default BookingList;