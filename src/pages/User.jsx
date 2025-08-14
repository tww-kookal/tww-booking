import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import { validateUser, addUser, updateUser, getUserById } from '../modules/users.module';

import '../css/user.large.css';
import '../css/user.handheld.css';

const User = () => {
    const { id } = useParams();
    const location = useLocation();
    const preloadedUser = location.state?.preloadedUser;
    const toUpdateUserId = location.state?.user_id;
    console.log("User::id", id)
    console.log("User::toUpdateUserId", toUpdateUserId)

    const navigate = useNavigate();
    const [toUpdateUser, setToUpdateUser] = useState(false);
    const [user, setUser] = useState({
        user_id: '',
        username: '',
        password: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        booking_commission: 0
    });

    useEffect(() => {
        if (toUpdateUserId) {
            getUserById(toUpdateUserId).then(user => {
                console.log("User:: user id ", toUpdateUserId)
                console.log("User::useEffect::", user)
                setToUpdateUser(true)
                setUser(user || null);
                setErrorMessage('');
            }).catch(err => {
                console.error('User::Error fetching user:', err);
                setErrorMessage('Failed to fetch user details');
            }).finally(() => {

            })
        }
    }, [toUpdateUserId]);

    useEffect(() => {
        if (preloadedUser) {
            setUser({
                ...preloadedUser
            });
        } else if (id) {
            getUserById(id).then(user => {
                setUser(user || null);
                setErrorMessage('');
            }).catch(err => {
                console.error('User::Error fetching user:', err);
                setErrorMessage('Failed to fetch user details');
            }).finally(() => {

            })
        }
    }, [preloadedUser, id]);

    // useEffect(() => {
    //     setUser(prev => ({
    //         ...prev,
    //         numberOfNights,
    //         commission,
    //         balanceToPay,
    //         twwRevenue
    //     }));
    // }, [booking.check_in, booking.check_out, booking.room_price, booking.food_price, booking.service_price, booking.advance_paid || 0]);

    // const handleChange = (e) => {
    //     const { name, value } = e.target;
    //     setUser(prev => ({ ...prev, [name]: name === 'numberOfPeople' || name.includes('Amount') || name === 'food' || name === 'campFire' || name === 'advancePaid' ? +value : value }));
    // };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setUser(prev => {
            const updated = {
                ...prev,
                [name]: value,
            };
            return updated;
        });
    };

    const handleAddNew = () => {
        // Add New User
        setUser({
            user_id: '',
            username: '',
            password: '',
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            booking_commission: 0
        });
        setIsFormDisabled(false); // Disable the form
        setIsSubmitting(false);
        setErrorMessage('')
    };

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isFormDisabled, setIsFormDisabled] = useState(false);

    const handleUpdate = async () => {
        setIsFormDisabled(true); // Disable the form
        setIsSubmitting(true);
        // Validate required fields
        let errors = validateUser(user);
        if (errors && errors.length > 0) {
            setErrorMessage(errors.join(', '));
            setIsFormDisabled(false); // Re-enable on error
            setIsSubmitting(false);
            return;
        }

        try {
            // Update or Add User
            console.log("User::With User ID ", user.user_id)
            let createdUser = null;
            if (user.user_id) {
                createdUser = await updateUser(user);
            } else {
                createdUser = await addUser(user);
            }

            navigate(location.state?.returnTo || '/booking/', {
                state: {
                    ...location.state,
                    createdUser: createdUser,
                    toUpdateUser: toUpdateUser
                }
            });
            setSuccessMessage('');
        } catch (error) {
            console.error('Error updating user:', error);
            setErrorMessage('Failed to update user. Please try again.');
        } finally {
            setIsFormDisabled(false); // Re-enable after operation
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        console.log("User::handleCancel::", location.state)
        navigate(location.state?.returnTo || '/booking/', {
            state: {
                ...location.state,
                toUpdateUser: toUpdateUser

            }
        });
    };

    return (
        <div className="user-form-container">
            <h2>{toUpdateUser ? "Update" : "Create"} User {toUpdateUserId && <>({toUpdateUserId})</>}</h2>

            {successMessage && (<div className="success-message">{successMessage}</div>)}
            {errorMessage && (<div className="error-message">{errorMessage}</div>)}

            <form onSubmit={e => e.preventDefault()}>
                <div className='form-group'>
                    <label>Username:</label>
                    <input type="text" name="username" value={user.username} onChange={handleChange} />
                </div>
                <div className='form-group'>
                    <label>First Name:</label>
                    <input type="text" name="first_name" value={user.first_name} onChange={handleChange} />
                </div>
                <div className='form-group'>
                    <label>Last Name:</label>
                    <input type="text" name="last_name" value={user.last_name} onChange={handleChange} />
                </div>
                <div className='form-group'>
                    <label>Booking Commission %:</label>
                    <input type="number" name="booking_commission" value={user.booking_commission} onChange={handleChange} />
                </div>

                <div className='form-group'>
                    <label>Phone:</label>
                    <input type="tel" name="phone" value={user.phone} onChange={handleChange} />
                </div>

                <div className='form-group'>
                    <label>Email:</label>
                    <input type="email" name="email" value={user.email} onChange={handleChange} />
                </div>

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
                        {isSubmitting ? 'Processing ...' : toUpdateUser ? 'Update' : 'Save'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default User;
