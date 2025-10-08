import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import { updatePayment, addPayment, deletePaymentById } from '../modules/payment.module';
import { PAYMENT_TYPE } from '../modules/constants';
import { getAllAccountingCategories } from '../modules/accounting.module';
import { getAllBookingSources } from '../modules/users.module'
import { getUserContext } from '../contexts/constants';

import '../css/payment.large.css';
import '../css/payment.handheld.css';
import ScrollToTop from '../site/ScrollToTop';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectFade, Autoplay } from 'swiper';
import '../styles.css'
import 'swiper/css/effect-fade';
import 'swiper/css';

const Payments = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [payments, setPayments] = useState([]);
    const [booking, setBooking] = useState(null);
    const [accCategoryOptions, setAccCategoryOptions] = useState([]);
    const [selectedAccCategory, setSelectedAccCategory] = useState();
    const [selectedPaymentTo, setSelectedPaymentTo] = useState();
    const [accPartiesOptions, setAccPartiesOptions] = useState([])

    useEffect(() => {
        getAllAccountingCategories(navigate).then(accCategories => {
            setAccCategoryOptions(
                accCategories
                    .filter(u => u.acc_category_type === 'credit' || u.acc_category_name.includes('Refund') || u.acc_category_name.includes('Commission'))
                    .map(u => ({
                        value: u.acc_category_id,
                        label: `[${(u.acc_category_type || '#').charAt(0)}] ${u.acc_category_name}`
                    })));
        }).catch(error => {
            console.error('Payments::Error fetching acc categories:', error);
        });
    }, []);

    useEffect(() => {
        getAllBookingSources(navigate).then(users => {
            setAccPartiesOptions(users.map(u => ({
                value: u.user_id,
                label: `${u.first_name} ${u.last_name} - ${u.phone}`
            })));

            let user = users.find(u => u.email === getUserContext().user.email);
            if (!user) {
                user = users.find(u => u.phone === getUserContext().user.phone);
            }
            if (user) {
                setSelectedPaymentTo({
                    value: user.user_id,
                    label: `${user.first_name} ${user.last_name} - ${user.phone}`
                });
                user = users.find(u => u.email === 'thewestwood.kookal@gmail.com');
            }
        }).catch(error => {
            console.error('Accounting::Error fetching acc parties:', error);
        });
    }, []);

    useEffect(() => {
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
            !payments.find(p => p.booking_payments_id === -999) && {
                booking_payments_id: -999,
                booking_id: booking?.booking_id || 0,
                payment_type: '',
                payment_amount: 0,
                payment_date: dayjs().format('YYYY-MM-DD'),
                payment_to: 0,
                payment_for: '',
                remarks: '',
                customer_id: booking?.customer_id || 0,
                user_id: booking?.user_id || 0,
            }
        ]);
    };

    const getSelectedAccCategory = (payment_for) => {
        return accCategoryOptions.find(u => u.value === payment_for);
    }

    const getSelectePaymentTo = (payment_to) => {
        return accPartiesOptions.find(u => u.value === payment_to);
    }

    const handleUpdate = async (payment) => {
        try {
            const updatedPayment = await updatePayment(navigate, payment);
            setPayments(payments.map(p => p.booking_payments_id === payment.booking_payments_id ? payment : p));
            setBooking({
                ...booking,
                payments: [booking.payments.map(p => p.booking_payments_id === payment.booking_payments_id ? payment : p)]
            })
            toast.success("Payment updated successfully");
        } catch (err) {
            toast.error("Error updating payment");
        }
    }

    const handleDelete = async (payment) => {
        try {
            console.debug("Delete Payment ", payment)
            await deletePaymentById(navigate, payment);
            setPayments(payments.filter(p => p.booking_payments_id !== payment.booking_payments_id));
            setBooking({
                ...booking,
                payments: [...booking.payments.filter(p => p.booking_payments_id !== payment.booking_payments_id)]
            })
            toast.success("Payment deleted successfully");
        } catch (err) {
            toast.error("Error deleting payment");
        }
    };

    const handleRemove = (payment) => {
        setPayments(payments.filter(p => p.booking_payments_id !== payment.booking_payments_id));
    }

    const handleAddNew = async (payment) => {
        try {
            const addedPayment = await addPayment(navigate, payment);
            toast.success("Payment added successfully");
            setPayments(payments.map(p => p.booking_payments_id === -999 ? addedPayment : p));
            setBooking({
                ...booking,
                payments: [...booking.payments, addedPayment]
            })
        } catch (err) {
            toast.error("Error adding payment");
        }
    }

    const handleCancel = () => {
        navigate(location.state?.returnTo || '/booking/', {
            state: {
                ...location.state,
                preloadedBooking: booking
            }
        });
    };

    return (
        <div style={{ backgroundColor: 'black', width: '100%' }}>
            <ScrollToTop />
            <Swiper
                modules={[EffectFade, Autoplay]}
                effect={'fade'}
                loop={true}
                autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                }}
                className='heroSlider h-[100px] lg:h-[27px]'
            ></Swiper>
            <ToastContainer />
            <div className="payment-form-container">
                <h2>Payments for Booking #{booking?.booking_id}</h2>
                {payments.map((payment, index) => (
                    <div key={payment.booking_payments_id} className="payment-card">
                        <label>&nbsp;ID: {payment.booking_payments_id === -999 ? 'NEW' : payment.booking_payments_id}&nbsp;</label>
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
                            <Select name="payment_for"
                                value={getSelectedAccCategory(payment.payment_for)}
                                onChange={e => {
                                    payment.payment_for = e.value;
                                    setSelectedAccCategory({
                                        value: e.value,
                                        label: e.label,
                                    });
                                }}
                                options={accCategoryOptions}
                                placeholder="Select a payment for..."
                                isSearchable={true}
                                classNamePrefix="react-select"
                                className="react-select-style"
                            />
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
                                {PAYMENT_TYPE && PAYMENT_TYPE.length > 0 && PAYMENT_TYPE.map(type => (
                                    <option key={type.id} value={type.id}>{type.value}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Pay To</label>
                            <Select name="payment_to"
                                value={getSelectePaymentTo(payment.payment_to)}
                                onChange={e => {
                                    payment.payment_to = e.value;
                                    setSelectedPaymentTo({
                                        value: e.value,
                                        label: e.label,
                                    });
                                }}
                                options={accPartiesOptions}
                                placeholder="Select Receiver..."
                                isSearchable={true}
                                classNamePrefix="react-select"
                                className="react-select-style"
                            />
                        </div>
                        <div className="form-group">
                            <label>Remarks</label>
                            <textarea
                                name="remarks"
                                placeholder="Remarks"
                                value={payment.remarks}
                                onChange={(e) => handleChange(index, e)}
                            />
                        </div>
                        {(payment.booking_payments_id === -999) ?
                            <div className="form-buttons">
                                <button className="button-secondary" onClick={() => handleRemove(payment)}>Remove</button>
                                <button className="button-search" onClick={() => handleAddNew(payment)}>Add New</button>
                            </div>
                            :
                            <div className="form-buttons">
                                <button onClick={() => handleDelete(payment)} className="button-delete" >Delete</button>
                                <button onClick={() => handleUpdate(payment)} className="button-update" >Update</button>
                            </div>
                        }
                    </div>
                ))}
                <div className="form-buttons">
                    <button onClick={handleAdd} className="button-primary">Add Payment</button>
                    <button onClick={handleCancel} className="button-secondary">Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default Payments;