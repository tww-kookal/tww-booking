import React from 'react';
import '../css/bookingList.css';
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
                <h3 style={{ fontSize: 'clamp(1.1rem, 2vw, 1.7rem)' }}>
                    Bookings Found ({results.length})
                </h3>
                <div className="mobile-card-list">
                    {paginatedResults.map((booking, index) => (
                        <div
                            key={index}
                            className={`booking-card ${booking.status === 'Cancelled' ? 'cancelled-booking' : ''}`}
                            onClick={() => handleViewBooking(booking)}
                            style={{
                                borderLeft: `6px solid ${booking.status === 'Confirmed'
                                    ? '#1976d2'
                                    : booking.status === 'Cancelled'
                                        ? '#e65100'
                                        : booking.status === 'Available'
                                            ? '#388e3c'
                                            : '#a6a0a4ff' // Default color for other statuses
                                    }`,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                                marginBottom: '1rem',
                                padding: '1rem',
                                borderRadius: '8px',
                                background: '#fff',
                                cursor: 'pointer',
                                transition: 'box-shadow 0.2s',
                            }}
                        >
                            <div className="card-row" style={{
                                backgroundColor: `6px solid ${booking.status === 'Confirmed'
                                    ? '#1976d2'
                                    : booking.status === 'Cancelled'
                                        ? '#e65100'
                                        : booking.status === 'Available'
                                            ? '#388e3c'
                                            : '#a6a0a4ff' // Default color for other statuses
                                    }`,
                                marginBottom: '0.5rem'
                            }}>
                                <span className="card-label" style={{ fontWeight: 600, color: '#555' }}>
                                    <span role="img" aria-label="room" style={{ marginRight: '4px' }}>🛏️</span>
                                    {booking.roomName}
                                </span>
                                <span className="card-value" style={{ color: '#222' }}>
                                    <span style={{ fontWeight: 700 }}> {booking.status} &nbsp; 🧑‍💼{booking.numberOfPeople || '- '}</span>
                                </span>
                            </div>
                            <div className="card-row" style={{ marginBottom: '0.5rem' }}>
                                <span className="card-label" style={{ fontWeight: 600, color: '#555' }}>Booking ID :</span>
                                <span className="card-value" style={{ color: '#222' }}>{booking.bookingID}</span>
                            </div>
                            <div className="card-row" style={{ marginBottom: '0.5rem' }}>
                                <span className="card-label" style={{ fontWeight: 600, color: '#555' }}>Guest :</span>
                                <span className="card-value" style={{ color: '#222' }}>{booking.customerName}</span>
                            </div>
                            <div className="card-row" style={{ marginBottom: '0.5rem' }}>
                                <span className="card-label" style={{ fontWeight: 600, color: '#555' }}>Dates :</span>
                                <span className="card-value" style={{ color: '#222' }}>
                                    {dayjs(booking.checkInDate, "YYYY-MM-DD").format("MMM DD 'YY")} <span style={{ color: '#888' }}>to</span> {dayjs(booking.checkOutDate, "YYYY-MM-DD").format("MMM DD 'YY")}
                                    &nbsp;({booking.numberOfNights} nights)
                                </span>
                            </div>
                            <div className="card-row" style={{ marginBottom: '0.5rem' }}>
                                {booking.contactNumber && (
                                    // <div className="card-row" style={{ marginBottom: '0.5rem' }}>
                                    <span className="card-value" style={{ color: '#222' }}><a
                                        href={`tel:${booking.contactNumber}`}
                                        style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 600 }}
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <span role="img" aria-label="phone" style={{ marginRight: '4px' }}>📞</span> {booking.contactNumber}
                                    </a></span>
                                    // </div>
                                )}
                            </div>
                            <div className="card-row" style={{ marginBottom: '0.5rem' }}>
                                <span className="card-label" style={{ fontWeight: 600, color: '#555' }}>Source: </span>
                                <span className="card-value" style={{ color: '#222' }}>{booking.sourceOfBooking || '-'}</span>
                            </div>
                            <div className="card-row" style={{ marginBottom: '0.5rem' }}>
                                <span className="card-label" style={{ fontWeight: 600, color: '#555' }}>Amount: </span>
                                <span className="card-value" style={{ color: '#222' }}>₹{booking.roomAmount || 0} </span>
                            </div>
                            <div className="card-row" style={{ marginBottom: '0.5rem' }}>
                                <span className="card-value" style={{ color: '#222' }}>{'✔️'} Breakfast.</span>
                                <span className="card-value" style={{ color: '#222' }}>&nbsp;{booking.campFire ? '✔️' : '❌'} Campfire.</span>
                                <span className="card-value" style={{ color: '#222' }}>&nbsp;{booking.remarks ? '📒' : ''}</span>
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