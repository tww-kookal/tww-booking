import React from 'react';
import '../css/bookingList.large.css';
import '../css/bookingList.handheld.css';
import dayjs from 'dayjs';
import { BOOKING_STATUS } from '../modules/constants';

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
                            className={`booking-card ${booking.status === BOOKING_STATUS.CANCELLED ? 'cancelled-booking' : ''}`}
                            onClick={() => handleViewBooking(booking)}
                            style={{
                                background:
                                    booking.status === BOOKING_STATUS.CONFIRMED
                                        ? '#e3f2fd' // Light blue
                                        : booking.status === BOOKING_STATUS.CANCELLED
                                            ? '#ffe0b2' // Light orange
                                            : booking.status === BOOKING_STATUS.AVAILABLE
                                                ? '#c8e6c9' // Light green
                                                : '#eeeeee', // Light grey
                                border: `2px solid ${booking.status === BOOKING_STATUS.CONFIRMED
                                    ? '#1976d2'
                                    : booking.status === BOOKING_STATUS.CANCELLED
                                        ? '#e65100'
                                        : booking.status === BOOKING_STATUS.AVAILABLE
                                            ? '#388e3c'
                                            : '#a6a0a4ff' // Default color for other statuses
                                    }`
                            }}
                        >
                            <div className="card-row">
                                <span className="card-label">
                                    🛏️{booking.room_name}&nbsp;
                                </span>
                                <span className="card-value">
                                    <span className="card-value-status">{booking.status}&nbsp;🧑‍💼{booking.number_of_people || '- '}</span>
                                </span>
                            </div>
                            <div className="card-row">
                                <span className="card-label">Booking ID:&nbsp;</span>
                                <span className="card-value">{booking.booking_id}</span>
                            </div>
                            <div className="card-row" >
                                <span className="card-label" >Guest:&nbsp;</span>
                                <span className="card-value" >{booking.customer_name}</span>
                            </div>
                            <div className="card-row">
                                <span className="card-value">
                                    {dayjs(booking.check_in, "YYYY-MM-DD").format("MMM DD 'YY")} <span style={{ color: '#888' }}>to</span> {dayjs(booking.check_out, "YYYY-MM-DD").format("MMM DD 'YY")}
                                    &nbsp;({booking.number_of_nights || '----'} nights)
                                </span>
                            </div>
                            <div className="card-row">
                                {booking.contact_number && (
                                    // <div className="card-row">
                                    <span className="card-value"><a
                                        href={`tel:${booking.contact_number}`}
                                        style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 600 }}
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <span role="img" aria-label="phone" style={{ marginRight: '4px' }}>📞</span> {booking.contact_number || ' -- '}
                                    </a></span>
                                    // </div>
                                )}
                            </div>
                            <div className="card-row">
                                <span className="card-label">Source:&nbsp;</span> 
                                <span className="card-value">{booking.source_of_booking || '-'}</span>
                            </div>
                            <div className="card-row">
                                <span className="card-label">Amount:&nbsp;</span> 
                                <span className="card-value">₹{booking.room_price || 0}</span>
                            </div>
                            <div className="card-row">
                                <span className="card-value">{'✔️'} Breakfast</span>
                                <span className="card-value">&nbsp;{booking.service_price ? '✔️' : '❌'} Campfire</span>
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