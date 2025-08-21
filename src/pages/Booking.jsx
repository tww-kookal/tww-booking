import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import { DEFAULT_BOOKING } from "../modules/constants";
import { calculateCommission, getCommissionPercent, parseNumber } from "../modules/common.module";
import { getAllCustomers } from '../modules/customer.module';
import { validateBooking, handleGenerateReceipt, createNewBooking, updateBooking, getPaymentsForBooking, getAllRooms, fetchAttachments } from '../modules/booking.module';
import { getAllUsers } from '../modules/users.module';

import '../css/booking.large.css';
import '../css/booking.handheld.css';

const Booking = () => {
    const location = useLocation();
    const preloadedBooking = location.state?.preloadedBooking;
    const checkInDate = location.state?.checkInDate || dayjs().format("YYYY-MM-DD");  //If from Availability chart to book a room
    const selectedRoom = location.state?.selectedRoom || undefined;

    const navigate = useNavigate();
    const [booking, setBooking] = useState({
        ...DEFAULT_BOOKING,
        check_in: checkInDate,
        check_out: dayjs(checkInDate, 'YYYY-MM-DD').add(1, 'day').format("YYYY-MM-DD"),
        ...(selectedRoom && {
            room_id: selectedRoom.room_id,
            room_price: selectedRoom.room_price || 0,
        }),
    });

    const [rooms, setRooms] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        if (location.state?.bookingDraft) {
            setBooking(location.state?.bookingDraft);
            fetchAttachments(location.state?.bookingDraft.booking_id, true).then(files => {
                setBooking(prev => ({
                    ...prev,
                    attachments: files
                }));
                ;
            });
        }
        if (location.state?.createdCustomer) {
            let updateCustomer = location.state?.toUpdateCustomer || true
            if (!updateCustomer)
                setCustomers(prev => [...prev, location.state.createdCustomer]);
            setBooking(prev => ({
                ...prev,
                customer_id: location.state.createdCustomer.customer_id
            }));
        }
        if (location.state?.createdUser) {
            let updateUser = location.state?.toUpdateUser || true
            if (!updateUser)
                setUsers(prev => [...prev, location.state.createdUser]);
            setBooking(prev => ({
                ...prev,
                source_of_booking_id: location.state.createdUser.user_id
            }));
        }
    }, [location.state]);

    useEffect(() => {
        getAllUsers(navigate).then(users => {
            setUsers(users);
        }).catch(err => {
            console.error('Booking::Error fetching users:', err);
            toast.error('Failed to fetch users');
        }).finally(() => {
        })
    }, [])

    useEffect(() => {
        getAllCustomers(navigate).then(customers => {
            setCustomers(customers);
        }).catch(err => {
            console.error('Booking::Error fetching customers:', err);
            toast.error('Failed to fetch customers');
        }).finally(() => {
        })
    }, [])

    useEffect(() => {
        getAllRooms(navigate).then(rooms => {
            setRooms(rooms);
        }).catch(err => {
            console.error('Booking::Error fetching rooms:', err);
            toast.error('Failed to fetch rooms');
        }).finally(() => {
        })
    }, [])

    useEffect(() => {
        console.log("PreLoaded Booking ", preloadedBooking)
        if (preloadedBooking) {
            setBooking({
                ...preloadedBooking,
                remarks: preloadedBooking.remarks || '',
            });
            fetchAttachments(preloadedBooking?.booking_id, true).then(files => {
                setBooking(prev => ({
                    ...prev,
                    attachments: files,
                }));
                console.log("PreLoaded Booking ", booking)
            });
            getPaymentsForBooking(navigate, preloadedBooking?.booking_id).then(payments => {
                setBooking(prev => ({
                    ...prev,
                    payments: payments,
                    totalPaid: payments.reduce((acc, p) => acc + parseNumber(p.payment_amount), 0),
                    balanceToPay: calculateTotalAmount(booking) - parseNumber(payments.reduce((acc, p) => acc + parseNumber(p.payment_amount), 0)),
                }));
            });
        }
    }, [preloadedBooking]);

    const calculateTotalAmount = (booking) => {
        let total_price = (parseNumber(booking.room_price || 0) + parseNumber(booking.food_price || 0) +
            parseNumber(booking.service_price || 0) + parseNumber(booking.tax_price || 0))
            -
            (parseNumber(booking.discount_price) || 0);

        return total_price;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBooking(prev => {
            const updated = {
                ...prev,
                [name]: value,
            };
            const checkInDate = dayjs(updated.check_in, "YYYY-MM-DD");
            const checkOutDate = dayjs(updated.check_out, "YYYY-MM-DD");

            if (checkInDate.isValid() && checkOutDate.isValid() && checkOutDate.isAfter(checkInDate)) {
                updated.number_of_nights = checkOutDate.diff(checkInDate, 'day');
            } else {
                updated.number_of_nights = '';
            }

            // Calculate commission based on source of booking
            const source = updated.source_of_booking_id || 0;
            const roomAmount = parseNumber(updated.room_price || 0);
            const food = parseNumber(updated.food_price || 0);
            const campFire = parseNumber(updated.service_price || 0);
            updated.commission = calculateCommission(users, source, roomAmount);
            updated.commission_percent = getCommissionPercent(users, source);
            updated.is_commission_settled = false;

            updated.tax_percent = 0;
            updated.tax_price = (updated.total_price * updated.tax_percent) / 100;
            updated.discount_price = 0;

            updated.total_price = calculateTotalAmount(updated);
            return updated;
        });
    };

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isFormDisabled, setIsFormDisabled] = useState(false);

    const handleUpdate = async () => {
        setIsFormDisabled(true); // Disable the form
        setIsSubmitting(true);
        // Validate required fields
        let errors = validateBooking(booking);
        if (errors && errors.length > 0) {
            toast.error(errors.join(', '));
            setIsFormDisabled(false); // Re-enable on error
            setIsSubmitting(false);
            return;
        }

        // Upload file if one was selected
        if (uploadedFile) {
            try {
                //await uploadToDrive(uploadedFile, booking.bookingID);
                console.log('Identity Document uploaded successfully');
            } catch (error) {
                console.error('Booking:: Error uploading file:', error);
                toast.error('Failed to upload Identity Document. Please try again.');
                return;
            } finally {
                setIsSubmitting(false);
                setIsFormDisabled(false); // Re-enable on error
            }
        }

        try {
            // Determine if this is an update or a new booking
            const isUpdate = preloadedBooking;

            console.log('Booking::Existing Booking to Update ? ', isUpdate);
            console.log("Booking::Update Booking ", booking)

            if (isUpdate) {
                updateBooking(navigate, booking).then((updatedBooking) => {
                    toast.success('Booking updated successfully!');
                    handleGenerateReceipt(updatedBooking);
                    navigate("/dashboard")
                }).catch((err) => {
                    console.error('Booking::Error updating booking:', err.response?.data?.detail || err.message);
                    toast.error(`Failed to update booking. ${err.response?.data?.detail || err.message}`);
                })
            } else {
                // For new bookings, simply append
                // Invoke New Booking 
                createNewBooking(navigate, booking).then((createdBooking) => {
                    toast.success('Booking saved successfully!');
                    handleGenerateReceipt(createdBooking);
                    navigate("/dashboard")
                }).catch((err) => {
                    console.error('Booking::Error creating booking:', err.response?.data?.detail || err.message);
                    toast.error(`Failed to create booking. ${err.response?.data?.detail || err.message}`);
                })
            }


        } catch (error) {
            console.error('Error saving booking:', error);
            toast.error('Failed to save booking. Please try again.');
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
            <ToastContainer />
            <h2>
                Booking&nbsp;
                {preloadedBooking && (<>({preloadedBooking.booking_id})</>)}
                {!preloadedBooking && <>(New)</>}
                &nbsp;
                {preloadedBooking && booking && booking.attachments && (
                    <>
                        {booking.attachments.map(a => (<a href={a.file_url} target="_blank" rel="noopener noreferrer">📎</a>))}
                    </>
                )}
            </h2>
            {/* <div className='form-group'>
                <label>Identity Document</label>
                <input className='form-input'
                    type="file"
                    onChange={(e) => setUploadedFile(e.target.files[0])}
                    accept=".pdf,.jpg,.jpeg,.png"
                />
            </div> */}

            <form onSubmit={e => e.preventDefault()}>
                <div className='form-group'>
                    <label>Room</label>
                    <select name="room_id" value={booking.room_id} onChange={handleChange}>
                        <option value="">Select Room</option>
                        {rooms.map(r => <option key={r.room_id} value={r.room_id}>{r.room_name}</option>)}
                    </select>
                </div>

                <div className='form-group'>
                    <label htmlFor="customer_id">Guest</label>
                    <select id="customer_id" name="customer_id" value={booking.customer_id} onChange={handleChange}>
                        <option value="">Select Customer</option>
                        {customers.map(c => (
                            <option key={c.customer_id} value={c.customer_id}>{c.customer_name} - {c.phone}</option>
                        ))}
                    </select>
                </div>
                <div className='form-group' style={{ alignItems: "center" }}>
                    <label></label>
                    <button
                        type="button"
                        onClick={() => navigate('/customers/new', { state: { returnTo: '/booking', bookingDraft: booking } })}
                        style={{ padding: '4px 8px' }}
                    >
                        + New
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/customers/new', { state: { returnTo: '/booking', bookingDraft: booking, customer_id: booking.customer_id } })}
                        style={{ padding: '4px 8px' }}
                    >
                        + Update
                    </button>
                </div>

                <div className='form-group'>
                    <label>Check In</label>
                    <input type="date" name="check_in" value={booking.check_in} onChange={handleChange} />
                </div>

                <div className='form-group'>
                    <label>Check Out</label>
                    <input type="date" name="check_out" value={booking.check_out} onChange={handleChange} />
                </div>

                <div className='form-group'>
                    <label>People</label>
                    <input type="number" name="number_of_people" value={booking.number_of_people} onChange={handleChange} />
                </div>

                <div className='form-group'>
                    <label>Amount</label>
                    <input type="number" name="room_price" value={booking.room_price} onChange={handleChange} />
                </div>

                <div className='form-group'>
                    <label>Source</label>
                    <select name="source_of_booking_id" value={booking.source_of_booking_id} onChange={handleChange}>
                        <option value="">Select</option>
                        {users.map(s => <option key={s.user_id} value={s.user_id}>{s.first_name} {s.last_name} ({s.booking_commission || 0}%)</option>)}
                    </select>
                </div>
                <div className='form-group' style={{ alignItems: "center" }}>
                    <label></label>
                    <button
                        type="button"
                        onClick={() => navigate('/user/new', { state: { returnTo: '/booking', bookingDraft: booking } })}
                        style={{ padding: '4px 8px' }}
                    >
                        + New
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/user/new', { state: { returnTo: '/booking', bookingDraft: booking, user_id: booking.source_of_booking_id } })}
                        style={{ padding: '4px 8px' }}
                    >
                        + Update
                    </button>
                </div>
                <div className='form-group'>
                    <label style={{ fontSize: '1.2rem' }}>Commission</label>
                    <label>{booking.commission}</label>
                </div>

                {/* Optional Fields */}
                <fieldset>
                    <legend>Services</legend>
                    <div className='form-group'>
                        <label>Food</label>
                        <input type="number" name="food_price" value={booking.food_price} onChange={handleChange} />
                    </div>

                    <div className='form-group'>
                        <label>Camp Fire</label>
                        <input type="number" name="service_price" value={booking.service_price} onChange={handleChange} />
                    </div>
                </fieldset>
                <fieldset>
                    <legend>Payments</legend>
                    <div className='form-group'>
                        <label>Total</label>
                        <label>{booking.total_price}</label>
                    </div>
                    {booking.payments &&
                        (booking.payments || []).map(p => (
                            <div key={p.booking_payments_id} className='form-group'>
                                <label style={{ fontSize: "1rem" }}>{p.payment_date}</label>
                                <label style={{ fontSize: "1rem" }}>{p.payment_amount}</label>
                                <label style={{ fontSize: "1rem" }}>{p.payment_for}</label>
                            </div>
                        ))}
                    {/* when the booking.payments is availble then display hte totalPaid and balanceToPay */ }
                    {booking.payments && (
                        <div className='form-group'>
                            <label>Total Paid</label>
                            <label>{booking.totalPaid || 0}</label>
                        </div>
                    )}

                    {booking.payments && (
                        <div className='form-group'>
                            <label>Balance</label>
                            <label>{booking.total_price - booking.totalPaid}</label>
                        </div>
                    )}

                </fieldset>
                <fieldset>
                    <legend>Remarks</legend>
                    <div className='form-group' style={{ width: "100%" }}>
                        <textarea style={{ width: "100%" }} name="remarks" value={booking.remarks || ''} onChange={handleChange} rows={3} />
                    </div>
                </fieldset>

                {/* Buttons */}
                <div className="form-buttons">
                    <button type="button" className="button-secondary"
                        onClick={handleCancel}
                        disabled={isFormDisabled}>Cancel</button>
                    <button
                        type="button"
                        className="button-primary"
                        onClick={handleUpdate}
                        disabled={isSubmitting || isFormDisabled}
                    >
                        {isSubmitting ? 'Saving...' : preloadedBooking ? 'Update' : 'Save'}
                    </button>
                    <button type="button" className="button-secondary"
                        onClick={() => handleGenerateReceipt(booking)}
                        disabled={isFormDisabled}>Receipt</button>
                </div>
            </form>
        </div>
    );
};

export default Booking;