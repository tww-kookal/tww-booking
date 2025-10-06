import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import { getAllAccountingCategories, validateTransaction, createTransaction, updateTransaction } from '../modules/accounting.module';
import { getAllBookings } from '../modules/booking.module';
import { getAllCustomers } from '../modules/customer.module';
import { isUserInRoles, getUserContext } from '../contexts/constants';

import '../css/transaction.large.css';
import '../css/transaction.handheld.css';
import ScrollToTop from '../site/ScrollToTop';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectFade, Autoplay } from 'swiper';
import '../styles.css'
import 'swiper/css/effect-fade';
import 'swiper/css';

import { PAYMENT_TYPE } from '../modules/constants';

const customStyles = {
    container: (provided) => ({
        ...provided,
        width: '75%',
    }),
};

const Transaction = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFormDisabled, setIsFormDisabled] = useState(false);
    const [accCategoryOptions, setAccCategoryOptions] = useState([]);
    const [accPartiesOptions, setAccPartiesOptions] = useState([])
    const [bookingOptions, setBookingOptions] = useState([]);
    const [selectedAccCategory, setSelectedAccCategory] = useState();
    const [selectedPaidBy, setSelectedPaidBy] = useState();
    const [selectedTxnBy, setSelectedTxnBy] = useState();
    const [selectedReceivedBy, setSelectedReceivedBy] = useState();
    const [selectedReceivedForBooking, setSelectedReceivedForBooking] = useState();
    const [isUpdatingTransaction, setIsUpdatingTransaction] = useState(false);
    const [allCustomers, setAllCustomers] = useState([]);
    const [transaction, setTransaction] = useState({
        acc_entry_id: '',
        acc_category_id: '',
        acc_entry_amount: 0,
        acc_entry_description: '',
        acc_entry_date: dayjs().format('YYYY-MM-DD'),
        created_by: getUserContext().user.user_id,
        txn_by: undefined,
        paid_by: undefined,
        received_by: undefined,
        received_for_booking_id: 0,
    });

    useEffect(() => {
        getAllBookings(navigate, '2021-01-01').then(bookings => {
            //sort booking by booking id
            bookings = bookings.sort((a, b) => b.booking_id - a.booking_id);
            bookings = [{
                booking_id: 0,
                room_name: 'NO BOOKING',
                customer_name: '',
            }, ...bookings]
            setBookingOptions(bookings.map(u => ({
                value: u.booking_id,
                label: `${u.room_name} - ${u.customer_name} - [${u.booking_id}] `
            })));
        }).catch(error => {
            console.error('Accounting::Error fetching bookings:', error);
        });
    }, []);

    useEffect(() => {
        getAllAccountingCategories(navigate).then(accCategories => {
            setAccCategoryOptions(accCategories.map(u => ({
                value: u.acc_category_id,
                label: `[${(u.acc_category_type || '#').charAt(0)}] ${u.acc_category_name}`
            })));
        }).catch(error => {
            console.error('Accounting::Error fetching acc categories:', error);
        });
    }, []);

    useEffect(() => {
        getAllCustomers(navigate).then(customers => {
            setAllCustomers(customers);
            setAccPartiesOptions(customers.map(u => ({
                value: u.customer_id,
                label: `${u.customer_name} - ${u.phone}`
            })));
        }).catch(error => {
            console.error('Accounting::Error fetching acc parties:', error);
        });
    }, []);

    useEffect(() => {
        if (location.state && location.state.preloadedTransaction) {
            const preloadedTransaction = location.state.preloadedTransaction
            setIsUpdatingTransaction(true);
            setTransaction(preloadedTransaction || {});
            setSelectedAccCategory({
                value: preloadedTransaction.acc_category_id,
                label: `[${(preloadedTransaction.acc_category_type || '#').charAt(0)}] ${preloadedTransaction.acc_category_name}`
            });
            setSelectedPaidBy({
                value: preloadedTransaction.paid_by,
                label: `${preloadedTransaction.paid_by_customer_name} - ${preloadedTransaction.paid_by_customer_phone}`
            });
            setSelectedTxnBy({
                value: preloadedTransaction.txn_by,
                label: `${preloadedTransaction.txn_by_customer_name} - ${preloadedTransaction.txn_by_customer_phone}`
            });
            setSelectedReceivedBy({
                value: preloadedTransaction.received_by,
                label: `${preloadedTransaction.received_by_customer_name} - ${preloadedTransaction.received_by_customer_phone}`
            });
            setSelectedReceivedForBooking({
                value: preloadedTransaction.received_for_booking_id,
                label: `${preloadedTransaction.room_name} - ${preloadedTransaction.booking_customer_name} - [${preloadedTransaction.received_for_booking_id}] `
            });
        } else {
            //find customer based on user_id from usercontext
            let customer = allCustomers.find(u => u.email === getUserContext().user.email);
            if (!customer) {
                customer = allCustomers.find(u => u.phone === getUserContext().user.phone);
            }
            if (customer) {
                setSelectedPaidBy({
                    value: customer.customer_id,
                    label: `${customer.customer_name} - ${customer.phone}`
                });
                setTransaction(prev => ({ ...prev, txn_by: customer.customer_id }));
                customer = allCustomers.find(u => u.email === 'thewestwood.kookal@gmail.com');
                setSelectedTxnBy({
                    value: customer.customer_id,
                    label: `${customer.customer_name} - ${customer.phone}`
                });
                setTransaction(prev => ({ ...prev, paid_by: customer.customer_id }));
            }
        }
    }, [location.state])

    const handleCancel = () => {
        if (location.state?.from === 'searchTransaction') {
            navigate('/transactions/search');
        } else {
            // Otherwise go to dashboard
            navigate('/dashboard');
        }
    }

    const handleUpdate = async () => {
        const validated = validateTransaction(transaction)
        if (validated !== 'ALL_GOOD') {
            toast.error(validated);
            return
        }
        setTransaction(prev => ({ ...prev, acc_entry_amount: Number(transaction.acc_entry_amount) }));
        try {
            if (isUpdatingTransaction) {
                await updateTransaction(transaction);
                toast.success('Transaction updated successfully');
            } else {
                await createTransaction(transaction);
                toast.success('Transaction created successfully');
            }
            navigate('/dashboard');
        } catch (error) {
            console.error('Accounting::Error adding/editing transaction:', error);
            toast.error('Unable to add/edit transaction');
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target;

        setTransaction(prev => {
            const updated = {
                ...prev,
                [name]: value,
            };
            return updated;
        });
    }

    return (
        <div style={{ backgroundColor: 'black' }}>
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
            <div className="accounting-form-container">
                <h2>{isUpdatingTransaction ? 'Update Transaction' : 'Add Transaction'}</h2>
                <form onSubmit={e => e.preventDefault()}>
                    <div className='form-group'>
                        <label htmlFor="acc_category_id">Category</label>
                        <Select name="acc_category_id"
                            styles={customStyles}
                            value={selectedAccCategory}
                            onChange={e => {
                                setTransaction(prev => ({ ...prev, acc_category_id: e.value }));
                                setSelectedAccCategory({
                                    value: e.value,
                                    label: e.label,
                                });
                            }}
                            options={accCategoryOptions}
                            placeholder="Select a acc category..."
                            isSearchable={true}
                            classNamePrefix="react-select"
                        />
                    </div>
                    <div className='form-group'>
                        <label>Amount</label>
                        <input type="number" name="acc_entry_amount" value={transaction.acc_entry_amount} onChange={handleChange} />
                    </div>

                    <div className='form-group'>
                        <label>Description</label>
                        <input type="text" name="acc_entry_description" value={transaction.acc_entry_description} onChange={handleChange} />
                    </div>

                    <div className='form-group'>
                        <label>Txn Date</label>
                        <input type="date" name="acc_entry_date" value={transaction.acc_entry_date} onChange={handleChange} />
                    </div>

                    <div className='form-group'>
                        <label htmlFor="txn_by">Txn By</label>
                        <Select name="txn_by"
                            styles={customStyles}
                            value={selectedTxnBy}
                            onChange={e => {
                                setTransaction(prev => ({ ...prev, txn_by: e.value }));
                                setSelectedTxnBy({
                                    value: e.value,
                                    label: e.label,
                                });
                            }}
                            options={accPartiesOptions}
                            placeholder="Transaction made by ..."
                            isSearchable={true}
                            classNamePrefix="react-select"
                        />
                    </div>

                    <div className='form-group'>
                        <label htmlFor="paid_by">Paid By</label>
                        <Select name="paid_by"
                            styles={customStyles}
                            value={selectedPaidBy}
                            onChange={e => {
                                setTransaction(prev => ({ ...prev, paid_by: e.value }));
                                setSelectedPaidBy({
                                    value: e.value,
                                    label: e.label,
                                });
                            }}
                            options={accPartiesOptions}
                            placeholder="Select Payer..."
                            isSearchable={true}
                            classNamePrefix="react-select"
                        />
                    </div>

                    <div className='form-group'>
                        <label htmlFor="received_by">Receiver</label>
                        <Select name="received_by"
                            styles={customStyles}
                            value={selectedReceivedBy}
                            onChange={e => {
                                setTransaction(prev => ({ ...prev, received_by: e.value }));
                                setSelectedReceivedBy({
                                    value: e.value,
                                    label: e.label,
                                });
                            }}
                            options={accPartiesOptions}
                            placeholder="Select Receiver..."
                            isSearchable={true}
                            classNamePrefix="react-select"
                        />
                    </div>

                    <div className='form-group'>
                        <label htmlFor="payment_type">Mode</label>
                        <select name="payment_type" value={transaction.payment_type} onChange={handleChange}>
                            <option value="">Select Mode</option>
                            {PAYMENT_TYPE.map(r => <option key={r.id} value={r.id}>{r.value}</option>)}
                        </select>
                    </div>

                    <div className='form-group'>
                        <label htmlFor="received_for_booking_id">For Booking</label>
                        <Select name="received_for_booking_id"
                            styles={customStyles}
                            value={selectedReceivedForBooking}
                            onChange={e => {
                                setTransaction(prev => ({ ...prev, received_for_booking_id: e.value }));
                                setSelectedReceivedForBooking({
                                    value: e.value,
                                    label: e.label,
                                });
                            }}
                            options={bookingOptions}
                            placeholder="Select booking ..."
                            isSearchable={true}
                            classNamePrefix="react-select"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="form-buttons">
                        <button type="button" className="button-secondary"
                            onClick={handleCancel}
                            disabled={isFormDisabled}>Cancel</button>
                        {isUserInRoles(['manager', 'owner', "employee"]) ?
                            <button
                                type="button"
                                className="button-primary"
                                onClick={handleUpdate}
                                disabled={isSubmitting || isFormDisabled}
                            >
                                {isSubmitting ? 'Processing ...' : isUpdatingTransaction ? 'Update' : 'Save'}
                            </button>
                            : ''
                        }
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Transaction;
