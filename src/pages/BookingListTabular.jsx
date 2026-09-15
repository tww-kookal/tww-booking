import React from 'react';
import dayjs from 'dayjs';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/booking/bookingListTabular.large.css';
import '../css/booking/bookingListTabular.handheld.css';
import { BOOKING_STATUS } from '../modules/constants';
import { isUserInRoles } from '../contexts/constants';

const BookingListTabular = ({
    loading,
    results,
    findAttachmentsForBooking,
    handleViewBooking,
}) => (
    <div className="results-section responsive-booking-list">
        <ToastContainer />
        {loading ? (
            <div className="loading-indicator">Loading bookings...</div>
        ) : results.length > 0 ? (
            <div className="table-container">
                <h3>Bookings Found ({results.length})</h3>
                <div className="scrollable-table-wrapper">
                    <table className="booking-table">
                        <thead>
                            <tr>
                                <th>Status</th>
                                <th>Booking ID</th>
                                <th>Room</th>
                                <th>Guest</th>
                                <th>Check In</th>
                                <th>Check Out</th>
                                <th>Nights</th>
                                <th>Guests</th>
                                <th>Contact</th>
                                <th>Source</th>
                                <th>Amount</th>
                                <th>Extras</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((booking, index) => {
                                const hasAttachment = findAttachmentsForBooking(booking.booking_id)?.length > 0;
                                const statusClass = booking.status === BOOKING_STATUS.CANCELLED
                                    ? 'cancelled'
                                    : booking.status === BOOKING_STATUS.CONFIRMED
                                        ? 'confirmed'
                                        : booking.status === BOOKING_STATUS.AVAILABLE
                                            ? 'available'
                                            : '';

                                return (
                                    <tr
                                        key={booking.booking_id || index}
                                        className={`booking-row ${statusClass}`}
                                        onClick={() => handleViewBooking(booking)}
                                    >
                                        <td>{booking.status || '-'}</td>
                                        <td>{booking.booking_id || '-'} {hasAttachment ? '📎' : ''}</td>
                                        <td>{booking.room_name || '-'}</td>
                                        <td>{booking.customer_name || '-'}</td>
                                        <td>{dayjs(booking.check_in).format('MMM DD, YYYY')}</td>
                                        <td>{dayjs(booking.check_out).format('MMM DD, YYYY')}</td>
                                        <td>{booking.number_of_nights || '-'}</td>
                                        <td>{booking.number_of_people || '-'}</td>
                                        <td>
                                            {booking.contact_number ? (
                                                <a
                                                    href={`tel:${booking.contact_number}`}
                                                    onClick={event => event.stopPropagation()}
                                                >
                                                    {booking.contact_number}
                                                </a>
                                            ) : '-'}
                                        </td>
                                        <td>{booking.source_of_booking || '-'}</td>
                                        <td>{isUserInRoles(['manager', 'owner']) ? `₹${booking.room_price || 0}` : '*****'}</td>
                                        <td>
                                            Breakfast {booking.service_price ? '· Campfire' : ''}{booking.remarks ? ' · Notes' : ''}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        ) : (
            <div className="no-results">No bookings found. Try adjusting your search criteria.</div>
        )}
    </div>
);

export default BookingListTabular;