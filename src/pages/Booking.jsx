import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import { statusOptions, sourceOptions, DEFAULT_BOOKING } from "../modules/constants";
import { getCommissionPercent, calculateCommission, parseNumber } from "../modules/common.module";
import { getAllCustomers } from '../modules/customer.module';
import { uploadToDrive } from '../modules/googleDriveService';
import { validateBooking, handleGenerateReceipt, getAllBookings, getAllRooms } from '../modules/booking.module';

import '../css/booking.large.css';
import '../css/booking.handheld.css';

const Booking = () => {
    const { id } = useParams();
    const location = useLocation();
    const preloadedBooking = location.state?.preloadedBooking;
    const navigate = useNavigate();
    const defaultBooking = DEFAULT_BOOKING;
    const [records, setRecords] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [booking, setBooking] = useState({
        ...defaultBooking
    });

    const [rooms, setRooms] = useState([]);
    const [customers, setCustomers] = useState([]);

    useEffect(() => {
        if (location.state?.bookingDraft) {
            setFormData(location.state.bookingDraft);
        }
        if (location.state?.createdCustomer) {
            setCustomers(prev => [...prev, location.state.createdCustomer]);
        }
    }, [location.state]);

    useEffect(() => {
        getAllCustomers().then(customers => {
            setCustomers(customers);
            setErrorMessage('');
        }).catch(err => {
            console.error('Booking::Error fetching customers:', err);
            setErrorMessage('Failed to fetch customers');
        }).finally(() => {
        })
    }, [])


    useEffect(() => {
        getAllRooms().then(rooms => {
            setRooms(rooms);
            setErrorMessage('');
        }).catch(err => {
            console.error('Booking::Error fetching rooms:', err);
            setErrorMessage('Failed to fetch rooms');
        }).finally(() => {
        })
    }, [])

    useEffect(() => {
        if (preloadedBooking) {
            setBooking({
                ...preloadedBooking
            });
        } else if (id) {
            // If we have an ID but no preloaded booking, we should fetch the booking data
            const fetchBookingById = async () => {
                setIsSubmitting(true);
                try {
                    const allBookings = await getAllBookings();
                    if (allBookings && allBookings.length > 0) {
                        // Convert to bookings and find the one with matching ID (customer name)

                        const decodedId = decodeURIComponent(id);
                        const foundBooking = allBookings.find(booking => booking.customer_name === decodedId);

                        if (foundBooking) {
                            setBooking(foundBooking);
                        } else {
                            setErrorMessage(`Booking for ${decodedId} not found`);
                        }
                    } else {
                        setErrorMessage('No bookings found in the system');
                    }
                } catch (err) {
                    console.error('Booking::Error fetching booking:', err);
                    setErrorMessage('Failed to fetch booking details');
                } finally {
                    setIsSubmitting(false);
                }
            };

            fetchBookingById();
        }
    }, [preloadedBooking, id]);

    useEffect(() => {
        // Auto calculate nights, commission, balances, etc.
        const inDate = new Date(booking.check_in);
        const outDate = new Date(booking.check_out);
        const numberOfNights = booking.number_of_nights || Math.max(0, (outDate - inDate) / (1000 * 60 * 60 * 24));

        const commission = calculateCommission(booking.source_of_booking, booking.room_price);
        const balanceToPay = (booking.room_price + booking.food_price + booking.service_price) - booking.advance_paid || 0;
        const twwRevenue = (booking.room_price + booking.food_price + booking.service_price) - commission;

        setBooking(prev => ({
            ...prev,
            numberOfNights,
            commission,
            balanceToPay,
            twwRevenue
        }));
    }, [booking.check_in, booking.check_out, booking.room_price, booking.food_price, booking.service_price, booking.advance_paid || 0]);

    // const handleChange = (e) => {
    //     const { name, value } = e.target;
    //     setBooking(prev => ({ ...prev, [name]: name === 'numberOfPeople' || name.includes('Amount') || name === 'food' || name === 'campFire' || name === 'advancePaid' ? +value : value }));
    // };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBooking(prev => {
            const updated = {
                ...prev,
                [name]: value,
            };
            console.log("Changed ", updated)
            
            const checkInDate = dayjs(updated.check_in, "YYYY-MM-DD");
            const checkOutDate = dayjs(updated.check_out, "YYYY-MM-DD");

            if (checkInDate.isValid() && checkOutDate.isValid() && checkOutDate.isAfter(checkInDate)) {
                updated.number_of_nights = checkOutDate.diff(checkInDate, 'day');
            } else {
                updated.number_of_nights = '';
            }

            // Calculate commission based on source of booking
            const source = updated.source_of_booking || '';
            const roomAmount = parseNumber(updated.room_price || 0);
            const food = parseNumber(updated.food_price || 0);
            const campFire = parseNumber(updated.service_price || 0);
            const advance = parseNumber(updated.advance_paid || 0);
            updated.commission = calculateCommission(source, roomAmount);

            // Balance To Pay = Room + Food + Camp - Advance
            //updated.balanceToPay = roomAmount + food + campFire - advance;

            // TWW Revenue = Room + Food + Camp - Commission
            updated.tww_revenue = roomAmount + food + campFire - updated.commission;

            return updated;
        });
    };

    const handleAddNew = () => {
        setBooking({ ...defaultBooking });
        setCurrentIndex(-1);
        // Clear file input on form clear
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
    };

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isFormDisabled, setIsFormDisabled] = useState(false);

    const handleUpdate = async () => {
        setIsFormDisabled(true); // Disable the form
        setIsSubmitting(true);
        // Validate required fields
        let errors = validateBooking(booking);
        if (errors && errors.length > 0) {
            setErrorMessage(errors.join(', '));
            setIsFormDisabled(false); // Re-enable on error
            return;
        }

        // Upload file if one was selected
        if (uploadedFile) {
            try {
                //await uploadToDrive(uploadedFile, booking.bookingID);
                console.log('Identity Document uploaded successfully');
            } catch (error) {
                console.error('Booking:: Error uploading file:', error);
                setErrorMessage('Failed to upload Identity Document. Please try again.');
                return;
            } finally {
                setIsSubmitting(false);
                setIsFormDisabled(false); // Re-enable on error
            }
        }

        try {
            // Determine if this is an update or a new booking
            const isUpdate = id || preloadedBooking;

            console.log('Booking::Existing Booking to Update ? ', isUpdate);

            if (isUpdate) {
                // Invoke Update API
                setSuccessMessage('Booking Updated successfully!');
                console.log('Booking::Booking Update successfully');
            } else {
                // For new bookings, simply append
                // Invoke New Booking 
                setSuccessMessage('Booking saved successfully!');
                console.log('Booking::Booking created successfully');
            }

            // Add to local state as well
            if (currentIndex >= 0) {
                const updated = [...records];
                updated[currentIndex] = booking;
                setRecords(updated);
            } else {
                setRecords([...records, booking]);
            }

            // Reset form after 2 seconds if it's a new booking
            setTimeout(() => {
                if (!isUpdate) {
                    handleAddNew();
                }
                handleGenerateReceipt(booking);
                setSuccessMessage('');
            }, 2000);
        } catch (error) {
            console.error('Error saving booking:', error);
            setErrorMessage('Failed to save booking. Please try again.');
        } finally {
            setIsFormDisabled(false); // Re-enable after operation
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        // If we came from the search page, go back to search
        if (location.state?.from === 'search') {
            navigate('/search');
        } else {
            // Otherwise go to dashboard
            navigate('/');
        }
        // Clear file input on cancel
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
    };

    return (
        <div className="booking-form-container">
            <h2>Room Booking Form</h2>
            <div className='form-group'>
                <label>Identity Document:</label>
                <input className='form-input'
                    type="file"
                    onChange={(e) => setUploadedFile(e.target.files[0])}
                    accept=".pdf,.jpg,.jpeg,.png"
                />
            </div>

            {successMessage && (<div className="success-message">{successMessage}</div>)}
            {errorMessage && (<div className="error-message">{errorMessage}</div>)}

            <form onSubmit={e => e.preventDefault()}>
                <div className='form-group'>
                    <label>Booking ID:</label>
                    <input type="text" name="booking_id" value={booking.booking_id} readOnly />
                </div>
                <div className='form-group'>
                    <label>Room Name:</label>
                    <select name="room_id" value={booking.room_id} onChange={handleChange}>
                        <option value="">Select Room</option>
                        {rooms.map(r => <option key={r.room_id} value={r.room_id}>{r.room_name}</option>)}
                    </select>
                </div>

                <div className='form-group'>
                    <label htmlFor="customer_id">Customer Name</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <select style = {{width: '55%'}} id="customer_id" name="customer_id" value={booking.customer_id} onChange={handleChange}>
                            <option value="">Select Customer</option>
                            {customers.map(c => (
                                <option key={c.customer_id} value={c.customer_id}>{c.customer_name} - {c.phone}</option>
                            ))}
                        </select>

                        <button
                            type="button"
                            onClick={() => navigate('/customers/new', { state: { returnTo: '/booking', booking } })}
                            style={{ padding: '4px 8px' }}
                        >
                            + New
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/customers/new', { state: { returnTo: '/booking', customer_id: booking.customer_id } })}
                            style={{ padding: '4px 8px' }}
                        >
                            + Update
                        </button>
                    </div>

                </div>

                <div className='form-group'>
                    <label>Booking Date:</label>
                    <input type="date" name="booking_date" value={booking.booking_date} readOnly />
                </div>

                <div className='form-group'>
                    <label>Check In Date:</label>
                    <input type="date" name="check_in" value={booking.check_in} onChange={handleChange} />
                </div>

                <div className='form-group'>
                    <label>Check Out Date:</label>
                    <input type="date" name="check_out" value={booking.check_out} onChange={handleChange} />
                </div>

                <div className='form-group'>
                    <label>Number of People:</label>
                    <input type="number" name="number_of_people" value={booking.number_of_people} onChange={handleChange} />
                </div>

                <div className='form-group'>
                    <label>Number of Nights:</label>
                    <input type="number" name="number_of_nights" value={booking.number_of_nights} readOnly />
                </div>

                <div className='form-group'>
                    <label>Status:</label>
                    <select name="status" value={booking.status} onChange={handleChange}>
                        {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                <div className='form-group'>
                    <label>Room Amount:</label>
                    <input type="number" name="room_price" value={booking.room_price} onChange={handleChange} />
                </div>

                <div className='form-group'>
                    <label>Source of Booking:</label>
                    <select name="source_of_booking" value={booking.source_of_booking} onChange={handleChange}>
                        <option value="">Select</option>
                        {sourceOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                {/* Optional Fields */}
                <fieldset>
                    <legend>Optional</legend>
                    <div className='form-group'>
                        <label>Advance Paid:</label>
                        <input type="number" name="advance_paid" value={booking.advance_paid} onChange={handleChange} />
                    </div>

                    <div className='form-group'>
                        <label>Advance Paid To:</label>
                        <input type="text" name="advance_paid_to" value={booking.advance_paid_to} onChange={handleChange} />
                    </div>

                    <div className='form-group'>
                        <label>Food:</label>
                        <input type="number" name="food_price" value={booking.food_price} onChange={handleChange} />
                    </div>

                    <div className='form-group'>
                        <label>Camp Fire:</label>
                        <input type="number" name="service_price" value={booking.service_price} onChange={handleChange} />
                    </div>

                    <div className='form-group'>
                        <label>Commission {getCommissionPercent(booking.source_of_booking)}% :</label>
                        <input type="number" name="commission" value={booking.commission} readOnly />
                    </div>

                    <div className='form-group'>
                        <label>Balance To Pay:</label>
                        <input type="number" name="balance_to_pay" value={booking.balance_to_pay} readOnly />
                    </div>

                    <div className='form-group'>
                        <label>Balance Paid To:</label>
                        <input type="text" name="balance_paid_to" value={booking.balance_paid_to} onChange={handleChange} />
                    </div>

                    <div className='form-group'>
                        <label>Remarks:</label>
                        <textarea name="remarks" value={booking.remarks} onChange={handleChange} rows={3} />
                    </div>
                </fieldset>

                {/* Buttons */}
                <div className="form-buttons">
                    <button type="button" className="button-secondary"
                        //onClick={handleCancel} 
                        disabled={isFormDisabled}>Cancel</button>
                    <button type="button" className="button-secondary"
                        //onClick={handleAddNew} 
                        disabled={isFormDisabled}>Clear</button>
                    <button
                        type="button"
                        className="button-primary"
                        //onClick={handleUpdate}
                        disabled={isSubmitting || isFormDisabled}
                    >
                        {isSubmitting ? 'Saving...' : preloadedBooking ? 'Update' : 'Save'}
                    </button>
                    <button type="button" className="button-secondary"
                        //onClick={() => handleGenerateReceipt(booking)} 
                        disabled={isFormDisabled}>Generate Receipt</button>
                </div>
            </form>
        </div>
    );
};

export default Booking;