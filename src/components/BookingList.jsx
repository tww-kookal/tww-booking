import React from 'react';
import '../css/bookingList.large.css';
import '../css/bookingList.handheld.css';
import dayjs from 'dayjs';

const BookingList = ({
    loading,
    results,
    paginatedResults,
    itemsPerPage,
    currentPage,
    handlePageChange,
    handleViewBooking,
    error,
}) => (
    <div className="results-section responsive-booking-list">
        {loading ? (
            <div className="loading-indicator">Loading bookings...</div>
        ) : results.length > 0 ? (
            <div className="table-container">
                <h3>
                    Bookings Found ({results.length})
                </h3>
                <div className="card-list">
                    {paginatedResults.map((booking, index) => (
                        <div
                            key={index}
                            className={`booking-card ${booking.status === 'Cancelled' ? 'cancelled-booking' : ''}`}
                            onClick={() => handleViewBooking(booking)}
                            style={{
                                background:
                                    booking.status === 'Confirmed'
                                        ? '#e3f2fd' // Light blue
                                        : booking.status === 'Cancelled'
                                            ? '#ffe0b2' // Light orange
                                            : booking.status === 'Available'
                                                ? '#c8e6c9' // Light green
                                                : '#eeeeee', // Light grey
                                border: `2px solid ${booking.status === 'Confirmed'
                                    ? '#1976d2'
                                    : booking.status === 'Cancelled'
                                        ? '#e65100'
                                        : booking.status === 'Available'
                                            ? '#388e3c'
                                            : '#a6a0a4ff' // Default color for other statuses
                                    }`
                            }}
                        >
                            <div className="card-row">
                                <span className="card-label">
                                    🛏️{booking.roomName}&nbsp;
                                </span>
                                <span className="card-value">
                                    <span className="card-value-status">{booking.status}&nbsp;🧑‍💼{booking.numberOfPeople || '- '}</span>
                                </span>
                            </div>
                            <div className="card-row">
                                <span className="card-label">Booking ID:&nbsp;</span>
                                <span className="card-value">{booking.bookingID}</span>
                            </div>
                            <div className="card-row" >
                                <span className="card-label" >Guest:&nbsp;</span>
                                <span className="card-value" >{booking.customerName}</span>
                            </div>
                            <div className="card-row">
                                <span className="card-value">
                                    {dayjs(booking.checkInDate, "YYYY-MM-DD").format("MMM DD 'YY")} <span style={{ color: '#888' }}>to</span> {dayjs(booking.checkOutDate, "YYYY-MM-DD").format("MMM DD 'YY")}
                                    &nbsp;({booking.numberOfNights} nights)
                                </span>
                            </div>
                            <div className="card-row">
                                {booking.contactNumber && (
                                    // <div className="card-row">
                                    <span className="card-value"><a
                                        href={`tel:${booking.contactNumber}`}
                                        style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 600 }}
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <span role="img" aria-label="phone" style={{ marginRight: '4px' }}>📞</span> {booking.contactNumber}
                                    </a></span>
                                    // </div>
                                )}
                            </div>
                            <div className="card-row">
                                <span className="card-label">Source:&nbsp;</span> 
                                <span className="card-value">{booking.sourceOfBooking || '-'}</span>
                            </div>
                            <div className="card-row">
                                <span className="card-label">Amount:&nbsp;</span> 
                                <span className="card-value">₹{booking.roomAmount || 0}</span>
                            </div>
                            <div className="card-row">
                                <span className="card-value">{'✔️'} Breakfast</span>
                                <span className="card-value">&nbsp;{booking.campFire ? '✔️' : '❌'} Campfire</span>
                                <span className="card-value">&nbsp;{booking.remarks ? '📒' : ''}</span>
                            </div>
                        </div>
                    ))}
                </div>
                {results.length > itemsPerPage && (
                    <div className="pagination">
                        <button
                            className="pagination-button"                        
                            onClick={() => handlePageChange('prev')}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <span className="page-info">
                            Page {currentPage} of {Math.ceil(results.length / itemsPerPage)}
                        </span>
                        <button
                            className="pagination-button"
                            onClick={() => handlePageChange('next')}
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