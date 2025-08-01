import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';

import { roomOptions, statusOptions, sourceOptions, DEFAULT_BOOKING } from "../modules/constants";
import { getCommissionPercent, calculateCommission, parseNumber, loadFromSheetToBookings } from "../modules/common.module";
import { uploadToDrive } from '../modules/googleDriveService';
import { validateBooking, convertBookingToSheetsRecord, findSheetRowToUpdate } from '../modules/booking.module';
import { updateBookingRow, appendBookingRow, handleGenerateReceipt } from '../modules/googleSheetsService';

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
                    const allBookings = await loadFromSheetToBookings();
                    if (allBookings && allBookings.length > 0) {
                        // Convert to bookings and find the one with matching ID (customer name)

                        const decodedId = decodeURIComponent(id);
                        const foundBooking = allBookings.find(booking => booking.customerName === decodedId);

                        if (foundBooking) {
                            setBooking(foundBooking);
                        } else {
                            setErrorMessage(`Booking for ${decodedId} not found`);
                        }
                    } else {
                        setErrorMessage('No bookings found in the system');
                    }
                } catch (err) {
                    console.error('Error fetching booking:', err);
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
        const inDate = new Date(booking.checkInDate);
        const outDate = new Date(booking.checkOutDate);
        const numberOfNights = Math.max(0, (outDate - inDate) / (1000 * 60 * 60 * 24));

        const commission = calculateCommission(booking.sourceOfBooking, booking.roomAmount);
        const balanceToPay = (booking.roomAmount + booking.food + booking.campFire + booking.otherServices) - booking.advancePaid;
        const twwRevenue = (booking.roomAmount + booking.food + booking.campFire + booking.otherServices) - commission;

        setBooking(prev => ({
            ...prev,
            numberOfNights,
            commission,
            balanceToPay,
            twwRevenue
        }));
    }, [booking.checkInDate, booking.checkOutDate, booking.roomAmount, booking.food, booking.campFire, booking.advancePaid]);

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

            const checkInDate = dayjs(updated.checkInDate, "YYYY-MM-DD");
            const checkOutDate = dayjs(updated.checkOutDate, "YYYY-MM-DD");

            if (checkInDate.isValid() && checkOutDate.isValid() && checkOutDate.isAfter(checkInDate)) {
                updated.numberOfNights = checkOutDate.diff(checkInDate, 'day');
            } else {
                updated.numberOfNights = '';
            }

            // Calculate commission based on source of booking
            const source = updated.sourceOfBooking || '';
            const roomAmount = parseNumber(updated.roomAmount || 0);
            const food = parseNumber(updated.food || 0);
            const campFire = parseNumber(updated.campFire || 0);
            const advance = parseNumber(updated.advancePaid || 0);
            updated.commission = calculateCommission(source, roomAmount);

            // Balance To Pay = Room + Food + Camp - Advance
            updated.balanceToPay = roomAmount + food + campFire - advance;

            // TWW Revenue = Room + Food + Camp - Commission
            updated.twwRevenue = roomAmount + food + campFire - updated.commission;

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

        booking.bookingID = booking.roomName + '-' + booking.checkInDate + '-' + booking.checkOutDate;

        // Upload file if one was selected
        if (uploadedFile) {
            try {
                await uploadToDrive(uploadedFile, booking.bookingID);
                console.log('Identity Document uploaded successfully');
            } catch (error) {
                console.error('Error uploading file:', error);
                setErrorMessage('Failed to upload Identity Document. Please try again.');
                return;
            } finally {
                setIsSubmitting(false);
                setIsFormDisabled(false); // Re-enable on error
            }
        }

        try {
            // Convert booking object to array format for Google Sheets
            const bookingRow = convertBookingToSheetsRecord(booking);
            // Determine if this is an update or a new booking
            const isUpdate = id || preloadedBooking;

            console.log('Existing Booking to Update ? ', isUpdate);

            if (isUpdate) {
                // For updating, we need to find the row in the sheet that matches this booking
                // First, get all current values
                const allBookings = await loadFromSheetToBookings();
                if (allBookings && allBookings.length > 0) {
                    // Find the row index that matches our booking
                    let rowIndex = findSheetRowToUpdate(allBookings, booking);
                    if (rowIndex !== -1) {
                        // Update the specific row
                        await updateBookingRow(rowIndex, bookingRow);
                        setSuccessMessage('Booking updated successfully!');
                        console.log('Booking updated successfully');
                    } else {
                        // If we couldn't find the row, append as a new booking
                        await appendBookingRow(bookingRow);
                        setSuccessMessage('Booking saved as new entry!');
                        console.log('Booking not found, saved as new booking');
                    }
                }
            } else {
                // For new bookings, simply append
                await appendBookingRow(bookingRow);
                setSuccessMessage('Booking saved successfully!');
                console.log('Booking created successfully');
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
                <input
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
                    <input type="text" name="bookingID" value={booking.bookingID} readOnly />
                </div>
                <div className='form-group'>
                    <label>Room Name:</label>
                    <select name="roomName" value={booking.roomName} onChange={handleChange}>
                        {roomOptions.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>

                <div className='form-group'>
                    <label>Customer Name:</label>
                    <input type="text" name="customerName" value={booking.customerName} onChange={handleChange} />
                </div>

                <div className='form-group'>
                    <label>Booking Date:</label>
                    <input type="date" name="bookingDate" value={booking.bookingDate} readOnly />
                </div>

                <div className='form-group'>
                    <label>Check In Date:</label>
                    <input type="date" name="checkInDate" value={booking.checkInDate} onChange={handleChange} />
                </div>

                <div className='form-group'>
                    <label>Check Out Date:</label>
                    <input type="date" name="checkOutDate" value={booking.checkOutDate} onChange={handleChange} />
                </div>

                <div className='form-group'>
                    <label>Contact Number:</label>
                    <input type="tel" name="contactNumber" value={booking.contactNumber} onChange={handleChange} />
                </div>

                <div className='form-group'>
                    <label>Number of People:</label>
                    <input type="number" name="numberOfPeople" value={booking.numberOfPeople} onChange={handleChange} />
                </div>

                <div className='form-group'>
                    <label>Number of Nights:</label>
                    <input type="number" name="numberOfNights" value={booking.numberOfNights} readOnly />
                </div>

                <div className='form-group'>
                    <label>Status:</label>
                    <select name="status" value={booking.status} onChange={handleChange}>
                        {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                <div className='form-group'>
                    <label>Room Amount:</label>
                    <input type="number" name="roomAmount" value={booking.roomAmount} onChange={handleChange} />
                </div>

                <div className='form-group'>
                    <label>Source of Booking:</label>
                    <select name="sourceOfBooking" value={booking.sourceOfBooking} onChange={handleChange}>
                        <option value="">Select</option>
                        {sourceOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                {/* Optional Fields */}
                <fieldset>
                    <legend>Optional</legend>
                    <div className='form-group'>
                        <label>Advance Paid:</label>
                        <input type="number" name="advancePaid" value={booking.advancePaid} onChange={handleChange} />
                    </div>

                    <div className='form-group'>
                        <label>Advance Paid To:</label>
                        <input type="text" name="advancePaidTo" value={booking.advancePaidTo} onChange={handleChange} />
                    </div>

                    <div className='form-group'>
                        <label>Food:</label>
                        <input type="number" name="food" value={booking.food} onChange={handleChange} />
                    </div>

                    <div className='form-group'>
                        <label>Camp Fire:</label>
                        <input type="number" name="campFire" value={booking.campFire} onChange={handleChange} />
                    </div>

                    <div className='form-group'>
                        <label>Other Services:</label>
                        <input type="number" name="campFire" value={booking.otherServices} onChange={handleChange} />
                    </div>

                    <div className='form-group'>
                        <label>Commission {getCommissionPercent(booking.sourceOfBooking)}% :</label>
                        <input type="number" name="commission" value={booking.commission} readOnly />
                    </div>

                    <div className='form-group'>
                        <label>Balance To Pay:</label>
                        <input type="number" name="balanceToPay" value={booking.balanceToPay} readOnly />
                    </div>

                    <div className='form-group'>
                        <label>TWW Revenue:</label>
                        <input type="number" name="twwRevenue" value={booking.twwRevenue} readOnly />
                    </div>

                    <div className='form-group'>
                        <label>Balance Paid To:</label>
                        <input type="text" name="balancePaidTo" value={booking.balancePaidTo} onChange={handleChange} />
                    </div>

                    <div className='form-group'>
                        <label>Remarks:</label>
                        <textarea name="remarks" value={booking.remarks} onChange={handleChange} rows={3} />
                    </div>
                </fieldset>

                {/* Buttons */}
                <div className="form-buttons">
                    <button type="button" className="button-secondary" onClick={handleCancel} disabled={isFormDisabled}>Cancel</button>
                    <button type="button" className="button-secondary" onClick={handleAddNew} disabled={isFormDisabled}>Clear</button>
                    <button
                        type="button"
                        className="button-primary"
                        onClick={handleUpdate}
                        disabled={isSubmitting || isFormDisabled}
                    >
                        {isSubmitting ? 'Saving...' : preloadedBooking ? 'Update' : 'Save'}
                    </button>
                    <button type="button" className="button-secondary" onClick={() => handleGenerateReceipt(booking)} disabled={isFormDisabled}>Generate Receipt</button>
                </div>
            </form>
        </div>
    );
};

export default Booking;