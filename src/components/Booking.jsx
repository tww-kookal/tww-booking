import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import './css/Booking.css';
import { arrayToBooking, RANGE, SHEET_ID, roomOptions, statusOptions, sourceOptions, getCommissionPercent, calculateCommission, parseNumber, DEFAULT_BOOKING, loadFromSheetToBookings } from "./constants";
import { uploadToDrive } from './googleDriveService';

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

            const checkIn = new Date(updated.checkInDate);
            const checkOut = new Date(updated.checkOutDate);

            // Calculate number of nights if dates are valid
            if (!isNaN(checkIn) && !isNaN(checkOut) && checkOut > checkIn) {
                const diffTime = checkOut - checkIn;
                updated.numberOfNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            } else {
                updated.numberOfNights = '';
            }

            // Calculate commission based on source of booking
            const source = updated.sourceOfBooking || '';
            const roomAmount = parseNumber(updated.roomAmount);
            const food = parseNumber(updated.food);
            const campFire = parseNumber(updated.campFire);
            const advance = parseNumber(updated.advancePaid);
            updated.commission = calculateCommission(source, roomAmount);

            // Balance To Pay = Room + Food + Camp - Advance
            updated.balanceToPay = roomAmount + food + campFire - advance;

            // TWW Revenue = Room + Food + Camp - Commission
            updated.twwRevenue = roomAmount + food + campFire - updated.commission;

            return updated;
        });
    };

    const handleNext = () => {
        if (currentIndex < records.length - 1) {
            setCurrentIndex(i => i + 1);
            setBooking({ ...records[currentIndex + 1] });
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(i => i - 1);
            setBooking({ ...records[currentIndex - 1] });
        }
    };

    const handleGenerateReceipt = () => {
        // Create a printable receipt
        const receiptWindow = window.open('', '_blank');

        receiptWindow.document.write(`
            <html>
                <head>
                    <title>Booking Receipt - ${booking.customerName}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                        .receipt { max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #ccc; }
                        .header { text-align: center; margin-bottom: 20px; }
                        .booking-details { margin-bottom: 20px; }
                        .booking-details table { width: 100%; border-collapse: collapse; }
                        .booking-details th, .booking-details td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
                        .financial-summary { margin-top: 30px; border-top: 2px solid #333; padding-top: 20px; }
                        .total { font-weight: bold; }
                        @media print { .no-print { display: none; } }
                    </style>
                </head>
                <body>
                    <div class="receipt">
                        <div class="header">
                            <h1>The Westwood</h1>
                            <h2>Booking Receipt</h2>
                        </div>
                        
                        <div class="booking-details">
                            <h3>Booking Information</h3>
                            <table>
                                <tr>
                                    <th>Booking ID:</th>
                                    <td>${booking.bookingID}</td>
                                </tr>
                                <tr>
                                    <th>Customer Name:</th>
                                    <td>${booking.customerName}</td>
                                </tr>
                                <tr>
                                    <th>Room:</th>
                                    <td>${booking.roomName}</td>
                                </tr>
                                <tr>
                                    <th>Check-in Date:</th>
                                    <td>${booking.checkInDate}</td>
                                </tr>
                                <tr>
                                    <th>Check-out Date:</th>
                                    <td>${booking.checkOutDate}</td>
                                </tr>
                                <tr>
                                    <th>Number of Nights:</th>
                                    <td>${booking.numberOfNights}</td>
                                </tr>
                                <tr>
                                    <th>Number of People:</th>
                                    <td>${booking.numberOfPeople}</td>
                                </tr>
                                <tr>
                                    <th>Contact Number:</th>
                                    <td>${booking.contactNumber}</td>
                                </tr>
                                <tr>
                                    <th>Status:</th>
                                    <td>${booking.status}</td>
                                </tr>
                            </table>
                        </div>
                        
                        <div class="financial-summary">
                            <h3>Financial Summary</h3>
                            <table>
                                <tr>
                                    <th>Room Amount:</th>
                                    <td>₹${booking.roomAmount}</td>
                                </tr>
                                ${booking.food > 0 ? `<tr>
                                    <th>Food:</th>
                                    <td>₹${booking.food}</td>
                                </tr>` : ''}
                                ${booking.campFire > 0 ? `<tr>
                                    <th>Camp Fire:</th>
                                    <td>₹${booking.campFire}</td>
                                </tr>` : ''}
                                ${booking.otherServices > 0 ? `<tr>
                                    <th>Other Services:</th>
                                    <td>₹${booking.otherServices}</td>
                                </tr>` : ''}
                                <tr>
                                    <th>Advance Paid:</th>
                                    <td>₹${booking.advancePaid}</td>
                                </tr>
                                <tr class="total">
                                    <th>Balance to Pay:</th>
                                    <td>₹${booking.balanceToPay}</td>
                                </tr>
                            </table>
                        </div>
                        
                        <div class="footer" style="margin-top: 40px; text-align: center;">
                            <p>Thank you for choosing The Westwood!</p>
                            <p>For any inquiries, please contact us.</p>
                        </div>
                        
                        <div class="no-print" style="margin-top: 30px; text-align: center;">
                            <button onclick="window.print()">Print Receipt</button>
                        </div>
                    </div>
                </body>
            </html>
        `);

        receiptWindow.document.close();
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

    const handleUpdate = async () => {
        // Validate required fields
        if (!booking.customerName || !booking.checkInDate || !booking.checkOutDate || !booking.contactNumber) {
            setErrorMessage('Please fill in all required fields: Customer Name, Check-in Date, Check-out Date, and Contact Number');
            return;
        }

        booking.bookingID = booking.roomName + '-' + booking.checkInDate + '-' + booking.checkOutDate;

        // Upload file if one was selected
        if (uploadedFile) {
            try {
                await uploadToDrive(uploadedFile, booking.bookingID);
                setSuccessMessage('File uploaded successfully!');
            } catch (error) {
                console.error('Error uploading file:', error);
                setErrorMessage('Failed to upload file. Please try again.');
                return;
            }
        }

        setIsSubmitting(true);
        setErrorMessage('');
        setSuccessMessage('');
        try {
            // Convert booking object to array format for Google Sheets
            const bookingRow = [
                booking.roomName,
                booking.customerName,
                booking.contactNumber,
                booking.numberOfPeople,
                booking.checkInDate,
                booking.checkOutDate,
                booking.numberOfNights,
                booking.status,
                booking.bookingDate,
                booking.sourceOfBooking,
                booking.roomAmount,
                booking.advancePaid,
                booking.advancePaidTo,
                0, // Placeholder for room balance
                booking.food,
                booking.campFire,
                0, // Placeholder for heater
                0, // Placeholder for safari
                booking.otherServices,
                booking.balanceToPay,
                booking.totalAmount,
                booking.commission,
                booking.twwRevenue,
                booking.balancePaidTo,
                booking.bookingID,
                booking.remarks
            ];

            // Determine if this is an update or a new booking
            const isUpdate = id || preloadedBooking;

            if (isUpdate) {
                // For updating, we need to find the row in the sheet that matches this booking
                // First, get all current values
                const allBookings = await loadFromSheetToBookings();

                if (allBookings && allBookings.length > 0) {
                    // Find the row index that matches our booking
                    const customerName = preloadedBooking?.customerName || decodeURIComponent(id);
                    let rowIndex = -1;

                    //Find the booking row by booking ID and room name and checkin date
                    allBookings.forEach((iBooking, index) => {
                        if (iBooking.bookingID == booking.bookingID && 
                            iBooking.roomName === booking.roomName && 
                            iBooking.checkInDate === booking.checkInDate && 
                            iBooking.checkOutDate === booking.checkOutDate) { // Customer name is in column B (index 1)
                            rowIndex = index;
                            console.log(`Found booking at row index: ${rowIndex + 1}`); // +1 because sheets are 1-indexed
                        }

                    });

                    if (rowIndex !== -1) {
                        // Update the specific row
                        await window.gapi.client.sheets.spreadsheets.values.update({
                            spreadsheetId: SHEET_ID,
                            range: `${RANGE.split('!')[0]}!A${rowIndex + 1}`, // +1 because sheets are 1-indexed
                            valueInputOption: 'USER_ENTERED',
                            resource: {
                                values: [bookingRow]
                            }
                        });

                        setSuccessMessage('Booking updated successfully!');
                    } else {
                        // If we couldn't find the row, append as a new booking
                        await window.gapi.client.sheets.spreadsheets.values.append({
                            spreadsheetId: SHEET_ID,
                            range: RANGE,
                            valueInputOption: 'USER_ENTERED',
                            resource: {
                                values: [bookingRow]
                            }
                        });

                        setSuccessMessage('Booking saved as new entry!');
                    }
                }
            } else {
                // For new bookings, simply append
                await window.gapi.client.sheets.spreadsheets.values.append({
                    spreadsheetId: SHEET_ID,
                    range: RANGE,
                    valueInputOption: 'USER_ENTERED',
                    resource: {
                        values: [bookingRow]
                    }
                });

                setSuccessMessage('Booking saved successfully!');
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
                setSuccessMessage('');
            }, 2000);
        } catch (error) {
            console.error('Error saving booking:', error);
            setErrorMessage('Failed to save booking. Please try again.');
        } finally {
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
                <label>Upload Document:</label>
                <input
                    type="file"
                    onChange={(e) => setUploadedFile(e.target.files[0])}
                    accept=".pdf,.jpg,.jpeg,.png"
                />
            </div>

            {successMessage && (
                <div className="success-message">
                    {successMessage}
                </div>
            )}

            {errorMessage && (
                <div className="error-message">
                    {errorMessage}
                </div>
            )}

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
                    <button type="button" className="button-secondary" onClick={handleCancel}>Cancel</button>
                    <button type="button" className="button-secondary" onClick={handleAddNew}>Clear Form</button>
                    <button
                        type="button"
                        className="button-primary"
                        onClick={handleUpdate}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Saving...' : preloadedBooking ? 'Update Booking' : 'Save Booking'}
                    </button>
                    <button type="button" className="button-secondary" onClick={handleGenerateReceipt}>Generate Receipt</button>
                </div>
            </form>
        </div>
    );
};

export default Booking;