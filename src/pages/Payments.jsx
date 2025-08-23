import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import { validatePayment, updatePayment, addPayment, PAYMENT_TYPE, PAYMENT_FOR } from '../modules/payment.module';

import '../css/payment.large.css';
import '../css/payment.handheld.css';

const Payments = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [payments, setPayments] = useState([]);
    const [users, setUsers] = useState([]);
    const [booking, setBooking] = useState(null);

    useEffect(() => {
        if (location.state.users && location.state.users.length > 0) {
            setUsers(location.state.users);
        }

        if (location.state.booking) {
            setPayments(location.state.booking.payments || []);
            setBooking(location.state.booking);
        }

    }, [location.state]);

    const handleChange = (index, e) => {
        const updatedPayments = payments.map((payment, i) => {
            if (index === i) {
                return { ...payment, [e.target.name]: e.target.value };
            }
            return payment;
        });
        setPayments(updatedPayments);
    };

    const handleAdd = () => {
        setPayments([
            ...payments,
            {
                booking_payments_id: `new-${payments.length + 1}`,
                booking_id: booking?.booking_id || 0,
                payment_type: '',
                payment_amount: 0,
                payment_date: dayjs().format('YYYY-MM-DD'),
                payment_to: 0,
                payment_for: '',
                remarks: ''
            }
        ]);
    };

    const handleDelete = (paymentId) => {
        const filteredPayments = payments.filter(p => p.booking_payments_id !== paymentId);
        setPayments(filteredPayments);
        toast.success("Payment deleted successfully");
    };

    const handleCancel = () => {
        navigate(location.state?.returnTo || '/booking/', {
            state: {
                ...location.state,
            }
        });
    };

    return (
        <div className="payment-form-container">
            <ToastContainer />
            <h2>Payments for Booking #{booking?.booking_id}</h2>
            <div className="payments-list">
                {payments.map((payment, index) => (
                    <fieldset>
                        <legend>&nbsp;ID: {payment.booking_payments_id}&nbsp;</legend>
                        <div key={payment.booking_payments_id} className="payment-item">
                            <div className="form-group">
                                <label>Date</label>
                                <input
                                    type="date"
                                    name="payment_date"
                                    value={dayjs(payment.payment_date).format('YYYY-MM-DD')}
                                    onChange={(e) => handleChange(index, e)}
                                />
                            </div>
                            <div className="form-group">
                                <label>For</label>
                                <select name="payment_for" value={payment.payment_for} onChange={(e) => handleChange(index, e)}>
                                    <option value="">Select Type</option>
                                    {PAYMENT_FOR && PAYMENT_FOR.map(type => (
                                        <option key={type.id} value={type.id}>{type.value}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Amount</label>
                                <input
                                    type="number"
                                    name="payment_amount"
                                    placeholder="Amount"
                                    value={payment.payment_amount}
                                    onChange={(e) => handleChange(index, e)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Type</label>
                                <select name="payment_type" value={payment.payment_type} onChange={(e) => handleChange(index, e)}>
                                    <option value="">Select Type</option>
                                    {PAYMENT_TYPE && PAYMENT_TYPE.map(type => (
                                        <option key={type.id} value={type.id}>{type.value}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Pay To</label>
                                <select name="payment_to" value={payment.payment_to} onChange={(e) => handleChange(index, e)}>
                                    <option value={0}>Pay To</option>
                                    {users && users.map(user => (
                                        <option key={user.user_id} value={user.user_id}>{user.first_name} {user.last_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Remarks</label>
                                <input
                                    type="text"
                                    name="remarks"
                                    placeholder="Remarks"
                                    value={payment.remarks}
                                    onChange={(e) => handleChange(index, e)}
                                />
                            </div>
                            <div className="form-buttons">
                                <button onClick={() => handleDelete(payment.booking_payments_id)} className="btn-delete">Delete</button>
                                <button onClick={() => handleUpdate(payment.booking_payments_id)} className="btn-update">Update</button>
                            </div>
                        </div>
                    </fieldset>
                ))}
            </div>
            <div className="form-buttons">
                <button onClick={handleAdd} className="btn-add">Add Payment</button>
                <button onClick={handleCancel} className="btn-cancel">Cancel</button>
            </div>
        </div>
    );
};

export default Payments;