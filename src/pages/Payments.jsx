import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import { updatePayment, addPayment, deletePaymentById } from '../modules/payment.module';
import { PAYMENT_TYPE, REFUND_TO_GUEST, COMMISSION_PAYOUT } from '../modules/constants';
import { getAllAccountingCategories } from '../modules/accounting.module';
import { getAllEmployees } from '../modules/users.module'
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
    const [selectedPaidBy, setSelectedPaidBy] = useState();
    const [accPartiesOptions, setAccPartiesOptions] = useState([])
    const [editingPaymentId, setEditingPaymentId] = useState(null);

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
        getAllEmployees(navigate).then(users => {
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

                setSelectedPaidBy({
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
            console.log('Payments::booking:', location.state.booking);
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
        if (payments.some(p => p.booking_payments_id === -999)) {
            toast.warn("A new payment is already being added.");
            return;
        }

        setPayments([
            ...payments,
            {
                booking_payments_id: -999,
                booking_id: booking?.booking_id || 0,
                payment_type: '',
                payment_amount: 0,
                payment_date: dayjs().format('YYYY-MM-DD'),
                payment_to: 0,
                paid_by: booking?.customer_id || 0,
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

    const getSelectedPaidBy = (paid_by) => {
        return accPartiesOptions.find(u => u.value === paid_by);
    }

    const getSelectePaymentTo = (payment_to) => {
        return accPartiesOptions.find(u => u.value === payment_to);
    }

    const getDisplayPaymentToBasedOnPaymentFor = (payment) => {
        if (isPaymentForRefundToGuest(payment.payment_for)) {
            return `${booking?.customer_name} [Guest]`
        } else if (isPaymentForCommissionPayout(payment.payment_for)) {
            return `${booking?.source_of_booking}`
        } else {
            return 'ERR!!!';
        }
    }

    const getDisplayPaidByBasedOnPaymentFor = (payment) => {
        if (isPaymentForRefundToGuest(payment.payment_for) || isPaymentForCommissionPayout(payment.payment_for)) {
            return 'ERR!!!';
        } else {
            return `${booking?.customer_name} [Guest]`
        }
    }

    const getPaymentToBasedOnPaymentFor = (payment) => {
        if (isPaymentForRefundToGuest(payment.payment_for)) {
            if (!booking || !booking.customer_id) {
                throw new Error('Refund to Guest must be to the customer');
            }
            return booking?.customer_id;
        } else if (isPaymentForCommissionPayout(payment.payment_for)) {
            if (!booking || !booking.source_of_booking_id) {
                throw new Error('Commission Payout must be to the source of booking');
            }
            return booking?.source_of_booking_id;
        } else {
            return payment.payment_to;
        }
    }

    const getPaidByBasedOnPaymentFor = (payment) => {
        if (isPaymentForRefundToGuest(payment.payment_for)) {
            return payment.paid_by
        } else if (isPaymentForCommissionPayout(payment.payment_for)) {
            return payment.paid_by
        } else {
            if (!booking || !booking.customer_id) {
                throw new Error('Must be done by the customer for the selected Payment');
            }
            return booking?.customer_id;
        }
    }

    const isPaidByVisibleBasedOnPaymentFor = (paymentFor) => {
        return isPaymentForRefundToGuest(paymentFor) || isPaymentForCommissionPayout(paymentFor);
    }

    const isPayToVisibleBasedOnPaymentFor = (paymentFor) => {
        return isPaymentForRefundToGuest(paymentFor) || isPaymentForCommissionPayout(paymentFor);
    }

    const isPaymentForRefundToGuest = (paymentFor) => {
        const paymentForLabel = (accCategoryOptions.find(u => u.value === paymentFor)?.label || '');
        return paymentForLabel.includes(REFUND_TO_GUEST);
    }

    const isPaymentForCommissionPayout = (paymentFor) => {
        const paymentForLabel = (accCategoryOptions.find(u => u.value === paymentFor)?.label || '');
        return paymentForLabel.includes(COMMISSION_PAYOUT);
    }

    const getTotalCommissionPaid = (paymentsToConsider) => {
        return (paymentsToConsider || []).reduce((total, payment) => {
            if (isPaymentForCommissionPayout(payment.payment_for)) {
                return total + parseFloat(payment.payment_amount || 0);
            }
            return total;
        }, 0);
    };

    const validatePayment = (payment) => {
        const errors = [];
        const mandatoryFields = [];

        if (parseFloat(payment.payment_amount || 0) <= 0) {
            errors.push("Payment amount must be greater than zero.");
        }

        if (!payment.payment_for) {
            mandatoryFields.push("Payment for");
        }

        if (isPaymentForCommissionPayout(payment.payment_for)) {
            const totalCommissionPaid = getTotalCommissionPaid(payments);
            if (totalCommissionPaid > (booking?.commission || 0)) {
                errors.push("Total paid commission cannot exceed booking commission.");
            }
        }

        if (!payment.payment_type) {
            mandatoryFields.push("Mode");
        }

        if (!payment.payment_date) {
            mandatoryFields.push("Transaction date");
        }

        if (payment.remarks && payment.remarks.length > 250) {
            errors.push("Remarks should not exceed 250 characters.");
        }

        if (!payment.paid_by || payment.paid_by === 0) {
            mandatoryFields.push("Paid By");
        }

        if (!payment.payment_to || payment.payment_to === 0) {
            mandatoryFields.push("Pay To");

        }

        let allErrors = "";
        if (mandatoryFields.length > 0) {
            allErrors += (mandatoryFields.length > 0 ? 'Following are mandatory fields, ' : '') +  mandatoryFields.join(", ");
        }

        if (errors.length > 0) {
            allErrors += (errors.length > 0 ? '\n and \n' + errors.join('\n') : '') ;
        }

        if (allErrors.length > 0) {
            toast.error(allErrors);
            return false;
        }

        return true;
    };

    const handleUpdate = async (payment) => {
        try {
            const paymentToUpdate = { ...payment };
            if (isPaymentForCommissionPayout(paymentToUpdate.payment_for)) {
                paymentToUpdate.payment_to = getPaymentToBasedOnPaymentFor(paymentToUpdate);
                paymentToUpdate.paid_by = getPaidByBasedOnPaymentFor(paymentToUpdate);
            }

            if (!validatePayment(paymentToUpdate)) {
                return;
            }
            const updatedPayment = await updatePayment(navigate, paymentToUpdate);
            if (updatedPayment) {
                setPayments(payments.map(p => p.booking_payments_id === updatedPayment.booking_payments_id ? updatedPayment : p));
                toast.success("Payment updated successfully");
            }
        } catch (error) {
            console.error("Failed to update payment:", error);
            toast.error("Failed to update payment.");
        }
    }

    const handleAddNew = async (payment) => {
        try {
            const paymentToAdd = { ...payment };
            if (isPaymentForCommissionPayout(paymentToAdd.payment_for)) {
                paymentToAdd.payment_to = getPaymentToBasedOnPaymentFor(paymentToAdd);
                paymentToAdd.paid_by = getPaidByBasedOnPaymentFor(paymentToAdd);
            }

            if (!validatePayment(paymentToAdd)) {
                return;
            }
            const addedPayment = await addPayment(navigate, paymentToAdd);
            if (addedPayment) {
                setPayments(payments.map(p => p.booking_payments_id === -999 ? addedPayment : p));
                toast.success("Payment added successfully");
            }
        } catch (error) {
            console.error("Failed to add payment:", error);
            toast.error("Failed to add payment.");
        }
    }

    const handleDelete = async (payment) => {
        try {
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

    const handleCancelEdit = () => {
        const originalPayment = location.state.booking.payments.find(p => p.booking_payments_id === editingPaymentId);
        setPayments(payments.map(p => p.booking_payments_id === editingPaymentId ? originalPayment : p));
        setEditingPaymentId(null);
    };

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
                                disabled={payment.booking_payments_id !== -999 && editingPaymentId !== payment.booking_payments_id}
                            />
                        </div>
                        <div className="form-group">
                            <label>For</label>
                            <Select name="payment_for"
                                value={getSelectedAccCategory(payment.payment_for)}
                                onChange={e => {
                                    const newPaymentFor = e.value;
                                    let newPaymentAmount = payment.payment_amount;

                                    if (isPaymentForCommissionPayout(newPaymentFor)) {
                                        const otherPayments = payments.filter(p => p.booking_payments_id !== payment.booking_payments_id);
                                        const commissionPaidOnOtherPayments = getTotalCommissionPaid(otherPayments);
                                        newPaymentAmount = (booking?.commission || 0) - commissionPaidOnOtherPayments;
                                    } else if (payment.payment_for !== newPaymentFor) {
                                        newPaymentAmount = 0;
                                    }

                                    const updatedPayments = payments.map((p, i) => {
                                        if (index === i) {
                                            return {
                                                ...p,
                                                payment_for: newPaymentFor,
                                                payment_amount: newPaymentAmount
                                            };
                                        }
                                        return p;
                                    });
                                    setPayments(updatedPayments);

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
                                isDisabled={payment.booking_payments_id !== -999 && editingPaymentId !== payment.booking_payments_id}
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
                                disabled={payment.booking_payments_id !== -999 && editingPaymentId !== payment.booking_payments_id}
                            />
                        </div>
                        <div className="form-group">
                            <label>Mode</label>
                            <select name="payment_type" value={payment.payment_type} onChange={(e) => handleChange(index, e)} disabled={payment.booking_payments_id !== -999 && editingPaymentId !== payment.booking_payments_id}>
                                <option value="">Select Type</option>
                                {PAYMENT_TYPE && PAYMENT_TYPE.length > 0 && PAYMENT_TYPE.map(type => (
                                    <option key={type.id} value={type.id}>{type.value}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Paid By</label>
                            <Select name="paid_by"
                                isDisabled={!isPaidByVisibleBasedOnPaymentFor(payment.payment_for) || (payment.booking_payments_id !== -999 && editingPaymentId !== payment.booking_payments_id)}
                                styles={{
                                    container: (base) => ({
                                        ...base,
                                        display: isPaidByVisibleBasedOnPaymentFor(payment.payment_for) ? 'block' : 'none'
                                    })
                                }}
                                value={getSelectedPaidBy(payment.paid_by)}
                                onChange={e => {
                                    payment.paid_by = e.value;
                                    setSelectedPaidBy({
                                        value: e.value,
                                        label: e.label,
                                    });
                                }}
                                options={accPartiesOptions}
                                placeholder="Select Payer..."
                                isSearchable={true}
                                classNamePrefix="react-select"
                                className="react-select-style"
                            />
                            <label style={{ display: !isPaidByVisibleBasedOnPaymentFor(payment.payment_for) ? 'block' : 'none', width: '100%', maxWidth: '75%', color: 'blue' }}>
                                <small>{getDisplayPaidByBasedOnPaymentFor(payment)}</small>
                            </label>
                        </div>

                        <div className="form-group">
                            <label>Pay To</label>
                            <Select name="payment_to"
                                isDisabled={isPayToVisibleBasedOnPaymentFor(payment.payment_for) || (payment.booking_payments_id !== -999 && editingPaymentId !== payment.booking_payments_id)}
                                styles={{
                                    container: (base) => ({
                                        ...base,
                                        display: !isPayToVisibleBasedOnPaymentFor(payment.payment_for) ? 'block' : 'none'
                                    })
                                }}
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
                            <label style={{ display: isPayToVisibleBasedOnPaymentFor(payment.payment_for) ? 'block' : 'none', width: '100%', maxWidth: '75%', color: 'blue' }}>
                                <small>{getDisplayPaymentToBasedOnPaymentFor(payment)}</small>
                            </label>
                        </div>
                        <div className="form-group">
                            <label>Remarks</label>
                            <textarea
                                name="remarks"
                                placeholder="Remarks"
                                value={payment.remarks}
                                onChange={(e) => handleChange(index, e)}
                                disabled={payment.booking_payments_id !== -999 && editingPaymentId !== payment.booking_payments_id}
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
                                {editingPaymentId === payment.booking_payments_id ? (
                                    <>
                                        <button onClick={handleCancelEdit} className="button-secondary">Cancel</button>
                                        <button onClick={() => handleUpdate(payment)} className="button-update">Update</button>
                                    </>
                                ) : (
                                    <button onClick={() => setEditingPaymentId(payment.booking_payments_id)} className="button-primary">Edit</button>
                                )}
                            </div>
                        }
                    </div>
                ))}
                <div className="form-buttons">
                    <button onClick={handleAdd} className="button-primary" disabled={payments.some(p => p.booking_payments_id === -999)}>Add Payment</button>
                    <button onClick={handleCancel} className="button-secondary">Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default Payments;