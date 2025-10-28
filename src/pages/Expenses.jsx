import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import { getAllAccountingCategories, validateTransaction, createTransaction, updateTransaction } from '../modules/accounting.module';
import { getAllNonCustomers, getAllEmployees,  } from '../modules/users.module';
import { isUserInRoles, getUserContext } from '../contexts/constants';

import '../css/expense.large.css';
import '../css/expense.handheld.css';
import ScrollToTop from '../site/ScrollToTop';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectFade, Autoplay } from 'swiper';
import '../styles.css'
import 'swiper/css/effect-fade';
import 'swiper/css';

import { PAYMENT_TYPE } from '../modules/constants';

const Expenses = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFormDisabled, setIsFormDisabled] = useState(false);
    const [accCategoryOptions, setAccCategoryOptions] = useState([]);
    const [employeeOptions, setEmployeeOptions] = useState([])
    const [vendorOptions, setVendorOptions] = useState([])
    const [allVendors, setAllVendors] = useState([]);
    const [selectedAccCategory, setSelectedAccCategory] = useState();
    const [selectedPaidBy, setSelectedPaidBy] = useState();
    const [selectedTxnBy, setSelectedTxnBy] = useState();
    const [selectedReceivedBy, setSelectedReceivedBy] = useState();
    const [isUpdatingExpense, setIsUpdatingExpense] = useState(false);
    const [allEmployees, setAllEmployees] = useState([]);
    const [expense, setExpense] = useState({
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
        getAllAccountingCategories(navigate).then(accCategories => {
            // do not include anything with the name "Commission Payout on it"
            accCategories = accCategories.filter(u => u.acc_category_type === 'debit' && !u.acc_category_name.includes("Commission Payout"));
            setAccCategoryOptions(accCategories.map(u => ({
                value: u.acc_category_id,
                label: `[${(u.acc_category_type || '#').charAt(0)}] ${u.acc_category_name}`
            })));
        }).catch(error => {
            console.error('Accounting::Error fetching acc categories:', error);
        });
    }, []);

    useEffect(() => {
        getAllEmployees(navigate).then(employees => {
            setAllEmployees(employees);
            setEmployeeOptions(employees.map(user => ({
                value: user.user_id,
                label: user?.first_name + " " + user?.last_name + " - " + user?.phone,
            })));
        }).catch(error => {
            console.error('Accounting::Error fetching Employees:', error);
        });
    }, []);

    useEffect(() => {
        getAllNonCustomers(navigate).then(vendors => {
            setAllVendors(vendors);
            setVendorOptions(vendors.map(user => ({
                value: user.user_id,
                label: user?.first_name + " " + user?.last_name + " - " + user?.phone,
            })));
        }).catch(error => {
            console.error('Accounting::Error fetching Vendors:', error);
        });
    }, []);

    useEffect(() => {
        if (location.state && location.state.preloadedExpense) {
            const preloadedExpense = location.state.preloadedExpense
            setIsUpdatingExpense(true);
            setExpense(preloadedExpense || {});
            setSelectedAccCategory({
                value: preloadedExpense.acc_category_id,
                label: `[${(preloadedExpense.acc_category_type || '#').charAt(0)}] ${preloadedExpense.acc_category_name}`
            });
            setSelectedPaidBy({
                value: preloadedExpense.paid_by,
                label: `${preloadedExpense.paid_by_customer_name} - ${preloadedExpense.paid_by_customer_phone}`
            });
            setSelectedTxnBy({
                value: preloadedExpense.txn_by,
                label: `${preloadedExpense.txn_by_customer_name} - ${preloadedExpense.txn_by_customer_phone}`
            });
            setSelectedReceivedBy({
                value: preloadedExpense.received_by,
                label: `${preloadedExpense.received_by_customer_name} - ${preloadedExpense.received_by_customer_phone}`
            });
        } else {
            //find employee based on user_id from usercontext
            let employee = allEmployees.find(u => u.email === getUserContext().logged_in_user?.email);
            if (employee) {
                setSelectedPaidBy({
                    value: employee.user_id,
                    label: `${employee.first_name} ${employee.last_name} - ${employee.phone}`
                });
                setExpense(prev => ({ ...prev, txn_by: employee.user_id }));
                employee = allEmployees.find(u => u.email === 'thewestwood.kookal@gmail.com');
                setSelectedTxnBy({
                    value: employee.user_id,
                    label: `${employee.first_name} ${employee.last_name} - ${employee.phone}`
                });
                setExpense(prev => ({ ...prev, paid_by: employee.user_id }));
            }
        }
    }, [location.state])

    const handleCancel = () => {
        if (location.state?.from === 'searchExpense') {
            navigate('/transactions/search');
        } else {
            // Otherwise go to dashboard
            navigate('/dashboard');
        }
    }

    const handleUpdate = async () => {
        const validated = validateTransaction(expense)
        if (validated !== 'ALL_GOOD') {
            toast.error(validated);
            return
        }
        setExpense(prev => ({ ...prev, acc_entry_amount: Number(expense.acc_entry_amount) }));
        try {
            if (isUpdatingExpense) {
                await updateTransaction(expense);
                toast.success('Expense updated successfully');
            } else {
                await createTransaction(expense);
                toast.success('Expense created successfully');
            }
            navigate('/dashboard');
        } catch (error) {
            console.error('Accounting::Error adding/editing expense:', error);
            toast.error('Unable to add/edit expense');
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target;

        setExpense(prev => {
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
                <h2>{isUpdatingExpense ? 'Update Expense' : 'Add Expense'}</h2>
                <form onSubmit={e => e.preventDefault()}>
                    <div className='form-group'>
                        <label htmlFor="acc_category_id">Category</label>
                        <Select name="acc_category_id"
                            value={selectedAccCategory}
                            onChange={e => {
                                setExpense(prev => ({ ...prev, acc_category_id: e.value }));
                                setSelectedAccCategory({
                                    value: e.value,
                                    label: e.label,
                                });
                            }}
                            options={accCategoryOptions}
                            placeholder="Select a acc category..."
                            isSearchable={true}
                            classNamePrefix="react-select"
                            className="react-select-style"
                        />
                    </div>
                    <div className='form-group'>
                        <label>Amount</label>
                        <input type="number" name="acc_entry_amount" value={expense.acc_entry_amount} onChange={handleChange} />
                    </div>

                    <div className='form-group'>
                        <label>Txn Date</label>
                        <input type="date" name="acc_entry_date" value={expense.acc_entry_date} onChange={handleChange} />
                    </div>

                    <div className='form-group'>
                        <label htmlFor="txn_by">Txn By</label>
                        <Select name="txn_by"
                            value={selectedTxnBy}
                            onChange={e => {
                                setExpense(prev => ({ ...prev, txn_by: e.value }));
                                setSelectedTxnBy({
                                    value: e.value,
                                    label: e.label,
                                });
                            }}
                            options={employeeOptions}
                            placeholder="Expense made by ..."
                            isSearchable={true}
                            classNamePrefix="react-select"
                            className="react-select-style"
                        />
                    </div>

                    <div className='form-group'>
                        <label htmlFor="paid_by">Paid By</label>
                        <Select name="paid_by"
                            value={selectedPaidBy}
                            onChange={e => {
                                setExpense(prev => ({ ...prev, paid_by: e.value }));
                                setSelectedPaidBy({
                                    value: e.value,
                                    label: e.label,
                                });
                            }}
                            options={employeeOptions}
                            placeholder="Select Payer..."
                            isSearchable={true}
                            classNamePrefix="react-select"
                            className="react-select-style"
                        />
                    </div>

                    <div className='form-group'>
                        <label htmlFor="received_by">Receiver</label>
                        <Select name="received_by"
                            value={selectedReceivedBy}
                            onChange={e => {
                                setExpense(prev => ({ ...prev, received_by: e.value }));
                                setSelectedReceivedBy({
                                    value: e.value,
                                    label: e.label,
                                });
                            }}
                            options={vendorOptions}
                            placeholder="Select Receiver..."
                            isSearchable={true}
                            classNamePrefix="react-select"
                            className="react-select-style"
                        />
                    </div>
                    {isUserInRoles(['manager', 'owner']) ?
                        <div className='form-group-button' style={{ alignItems: "center" }}>
                            <label></label>
                            <button
                                type="button"
                                onClick={() => navigate('/user/new', { state: { returnTo: '/expenses', expenseDraft: expense } })}
                                style={{ padding: '4px 8px' }}
                            >
                                + New
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/user/new', { state: { returnTo: '/expenses', expenseDraft: expense, user_id: expense.received_by } })}
                                style={{ padding: '4px 8px' }}
                            >
                                + Update
                            </button>
                        </div>
                        : ''}

                    <div className='form-group'>
                        <label htmlFor="payment_type">Mode</label>
                        <select name="payment_type" value={expense.payment_type} onChange={handleChange}>
                            <option value="">Select Mode</option>
                            {PAYMENT_TYPE.map(r => <option key={r.id} value={r.id}>{r.value}</option>)}
                        </select>
                    </div>

                    <div className='form-group'>
                        <label>Description</label>
                        <textarea name="acc_entry_description" value={expense.acc_entry_description} onChange={handleChange} />
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
                                {isSubmitting ? 'Processing ...' : isUpdatingExpense ? 'Update' : 'Save'}
                            </button>
                            : ''
                        }
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Expenses;
