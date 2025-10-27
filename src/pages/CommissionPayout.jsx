import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getAllBookingSources, getAllEmployees } from '../modules/users.module';
import { getAllAccountingCategories, addCommissionPayouts } from '../modules/accounting.module';
import { searchBookings } from '../modules/booking.module';
import { LOADING_DOTS } from './Common';
import '../css/commissionPayout.large.css';
import '../css/commissionPayout.handheld.css';
import ScrollToTop from '../site/ScrollToTop';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectFade, Autoplay } from 'swiper';
import '../styles.css'
import 'swiper/css/effect-fade';
import 'swiper/css';
import { getUserContext } from '../contexts/constants';

const CommissionPayout = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [userOptions, setUserOptions] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isUsersLoading, setIsUsersLoading] = useState(true);
    const [accountingCategories, setAccountingCategories] = useState([]);
    const [isAccountingCategoriesLoading, setIsAccountingCategoriesLoading] = useState(true);
    const [employees, setEmployees] = useState([]);
    const [employeeOptions, setEmployeeOptions] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isPaidByLoading, setIsPaidByLoading] = useState(true);
    const [commission, setCommission] = useState({
        acc_category_id: undefined,
        acc_category_name: undefined,
        acc_entry_amount: "",
        acc_entry_date: new Date().toISOString().substring(0, 10),
        acc_entry_description: "",
        received_for_booking_id: undefined,
        payment_type: "gpay",
        paid_by: 0,
        received_by: 0,
        created_by: getUserContext().logged_in_user?.user_id,
        txn_by: getUserContext().logged_in_user?.user_id,
        selected_bookings: [],
    });
    const [bookings, setBookings] = useState([]);
    const [selectedBookings, setSelectedBookings] = useState([]);
    const [isBookingsLoading, setIsBookingsLoading] = useState(false);

    useEffect(() => {
        setIsUsersLoading(true);
        getAllBookingSources(navigate).then(users => {
            setUsers(users);
            setUserOptions(users.map(u => ({
                value: u.user_id,
                label: u.first_name + " " + u.last_name + " (" + u.booking_commission + "%)",
            })));
        }).catch(err => {
            console.error('CommissionPayout::Error fetching users:', err);
            toast.error('Failed to fetch users');
        }).finally(() => {
            setIsUsersLoading(false);
        });

        setIsPaidByLoading(true);
        getAllEmployees(navigate).then(employees => {
            setEmployees(employees);
            setEmployeeOptions(employees.map(e => ({
                value: e.user_id,
                label: e.first_name + " " + e.last_name,
            })));
        }).catch(err => {
            console.error('CommissionPayout::Error fetching employees:', err);
            toast.error('Failed to fetch employees');
        }).finally(() => {
            setIsPaidByLoading(false);
        });

        setIsAccountingCategoriesLoading(true);
        getAllAccountingCategories(navigate).then(categories => {
            setAccountingCategories(categories);
            setCommission({
                ...commission,
                acc_category_id: categories.find(c => c.acc_category_name === "Commission Payout").acc_category_id,
                acc_category_name: "Commission Payout",
            });
        }).catch(err => {
            console.error('CommissionPayout::Error fetching accounting categories:', err);
            toast.error('Failed to fetch accounting categories');
        }).finally(() => {
            setIsAccountingCategoriesLoading(false);
        });
    }, []);

    const handleUserChange = (e) => {
        setSelectedUser(e);
        setCommission({
            ...commission,
            received_by: e.value,
        });
    };

    const handleEmployeeChange = (e) => {
        setSelectedEmployee(e);
        setCommission({
            ...commission,
            paid_by: e.value,
        });
    };

    const handleLoad = () => {
        if (!selectedUser) {
            toast.error('Please select an agent to load.');
            return;
        }
        setIsBookingsLoading(true);
        searchBookings(navigate, {
            source_of_booking_id: selectedUser.value,
            is_commission_settled: false
        }).then(bookings => {
            setBookings(bookings);
        }).catch(err => {
            console.error('CommissionPayout::Error fetching bookings:', err);
            toast.error('Failed to fetch bookings');
        }).finally(() => {
            setIsBookingsLoading(false);
        });
    };

    const handleBookingSelection = (bookingId) => {
        setSelectedBookings(prev => {

            const updated = prev.includes(bookingId)
                ? prev.filter(id => id !== bookingId)
                : [...prev, bookingId];

            const unique = [...new Set(updated)];
            return unique;
        });
    };;

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

    const handleReset = () => {
        setSelectedBookings([]);
        setBookings([]);
        setSelectedEmployee(undefined);
        setCommission({
            ...commission,
            acc_entry_amount: "",
            acc_entry_date: new Date().toISOString().substring(0, 10),
            acc_entry_description: "",
            received_for_booking_id: undefined,
            payment_type: "gpay",
            paid_by: 0,
            created_by: getUserContext().logged_in_user?.user_id,
            txn_by: getUserContext().logged_in_user?.user_id,
        });
    }

    const handlePay = () => {
        if (selectedBookings.length === 0) {
            toast.error('Please select the bookings for which the commission has to be paid.');
            return;
        }

        // Build the payload first
        const updatedCommission = {
            ...commission,
            acc_entry_amount: totalCommission(),
            acc_entry_description: finalRemark(),
            received_for_booking_id: undefined,
            selected_bookings: selectedBookings,
        };

        // Update state (if you need the UI to reflect it)
        setCommission(updatedCommission);

        addCommissionPayouts(updatedCommission).then(response => {
            console.log("Commission Payout Added");
            toast.success('Commission Payout Added Successfully');
            handleReset();
        }).catch(err => {
            console.error('CommissionPayout::Error adding commission payouts:', err);
            toast.error('Failed to add commission payouts');
            handleReset();
        });
    };

    const totalCommission = () => selectedBookings.reduce((total, bookingId) => {
        const booking = bookings.find(b => b.booking_id === bookingId);
        return total + (booking ? booking.commission : 0);
    }, 0);

    const finalRemark = () => selectedBookings.reduce((remark, bookingId) => {
        const booking = bookings.find(b => b.booking_id === bookingId);
        return remark += `[${booking.booking_id}] ${booking.customer_name} (${booking.check_in}) - ${booking.room_name}\n`;
    }, '');

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
            <div className="commission-payout-container">
                <h1>Commission Payout</h1>
                <div className='form-group'>
                    <label htmlFor="acc_category_name">Paid For</label>
                    <input type="text" name="acc_category_name" value={commission.acc_category_name} readOnly />
                </div>
                <div className="form-group">
                    <label htmlFor="user_id">
                        {isUsersLoading ? 'Loading Agents' : 'Agent'}
                        {isUsersLoading && <LOADING_DOTS />}
                    </label>
                    <Select
                        name="user_id"
                        isDisabled={isUsersLoading}
                        value={selectedUser}
                        onChange={handleUserChange}
                        options={userOptions}
                        placeholder="Select a user..."
                        isSearchable={true}
                        classNamePrefix="react-select"
                        className="react-select-style"
                    />
                </div>
                <div className="form-buttons">
                    <button
                        type="button"
                        className="button-primary"
                        onClick={handleLoad}
                        disabled={isUsersLoading || isBookingsLoading}
                    >
                        {isBookingsLoading ? 'Loading...' : 'Load'}
                    </button>
                </div>
                {isBookingsLoading && <LOADING_DOTS />}
                {bookings.length > 0 && (
                    <div className="bookings-list">
                        <div style={{ maxWidth: '97%', width: '100%', maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', marginTop: '20px' }}>
                            <table className="bookings-table">
                                <thead>
                                    <tr>
                                        <th width="5%"></th>
                                        <th width="10%">Room</th>
                                        <th width="15%">Checkin</th>
                                        <th width="30%">Guest</th>
                                        <th width="20%">Comm</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map((booking, index) => (
                                        <tr key={booking.booking_id} onClick={() => handleBookingSelection(booking.booking_id)} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white', cursor: 'pointer' }}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedBookings.includes(booking.booking_id)}
                                                    onChange={() => handleBookingSelection(booking.booking_id)}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </td>
                                            <td>{booking.room_name}</td>
                                            <td>{booking.check_in}</td>
                                            <td>{booking.customer_name}</td>
                                            <td style={{ textAlign: 'right' }}>{booking.commission.toFixed(0)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {isBookingsLoading && <LOADING_DOTS />}
                {bookings.length > 0 && (
                    <>&nbsp;
                        <div className="form-group">
                            <label htmlFor="paid_by">
                                {isPaidByLoading ? 'Loading Employees' : 'Paid From'}
                                {isPaidByLoading && <LOADING_DOTS />}
                            </label>
                            <Select
                                name="paid_by"
                                isDisabled={isPaidByLoading}
                                value={selectedEmployee}
                                onChange={handleEmployeeChange}
                                options={employeeOptions}
                                placeholder="Select an employee..."
                                isSearchable={true}
                                classNamePrefix="react-select"
                                className="react-select-style"
                            />
                        </div>
                        <div className='form-group'>
                            <label htmlFor="acc_entry_date">Txn Date</label>
                            <input type="date" name="acc_entry_date" value={commission.acc_entry_date} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="acc_entry_description">Description</label>
                            <textarea
                                name="acc_entry_description"
                                value={commission.acc_entry_description}
                                onChange={handleChange}
                                placeholder="Enter any description..."
                                className="description-textarea"
                            />
                        </div>
                        <div className="form-buttons">
                            <button
                                type="button"
                                className="button-secondary"
                                onClick={handleReset}
                            >
                                &nbsp;Reset&nbsp;
                            </button>
                            <button
                                type="button"
                                className="button-primary"
                                onClick={handlePay}
                            >
                                &nbsp;Pay ₹{totalCommission().toFixed(2)}&nbsp;
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CommissionPayout;