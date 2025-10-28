import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import { validateUser, addUser, updateUser, getUserById } from '../modules/users.module';
import { isUserInRoles } from '../contexts/constants';


import '../styles.css'
import '../css/user.large.css';
import '../css/user.handheld.css';
import ScrollToTop from '../site/ScrollToTop';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectFade, Autoplay } from 'swiper';
import 'swiper/css/effect-fade';
import 'swiper/css';
import { USER_TYPES } from '../modules/constants';

const User = () => {
    const { id } = useParams();
    const location = useLocation();
    const preloadedUser = location.state?.preloadedUser;
    const toUpdateUserId = location.state?.user_id;  

    const navigate = useNavigate();
    const [toUpdateUser, setToUpdateUser] = useState(false);
    const [user, setUser] = useState({
        user_id: '',
        username: '',
        user_type: '',
        password: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        booking_commission: 0
    });

    useEffect(() => {
        if (toUpdateUserId) {
            getUserById(navigate, toUpdateUserId).then(user => {
                setToUpdateUser(true)
                setUser(user || null);
            }).catch(err => {
                console.error('User::Error fetching user:', err);
                toast.error('Failed to fetch user details');
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
            getUserById(navigate, id).then(user => {
                setUser(user || null);
            }).catch(err => {
                console.error('User::Error fetching user:', err);
                toast.error('Failed to fetch user details');
            }).finally(() => {

            })
        }
    }, [preloadedUser, id]);

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
            user_type: '',
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            booking_commission: 0
        });
        setIsFormDisabled(false); // Disable the form
        setIsSubmitting(false);
    };

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFormDisabled, setIsFormDisabled] = useState(false);

    const handleUpdate = async () => {
        setIsFormDisabled(true); // Disable the form
        setIsSubmitting(true);
        // Validate required fields
        let errors = validateUser(user);
        if (errors && errors.length > 0) {
            toast.error(errors.join(', '));
            setIsFormDisabled(false); // Re-enable on error
            setIsSubmitting(false);
            return;
        }

        try {
            // Update or Add User
            let createdUser = null;
            if (user.user_id) {
                createdUser = await updateUser(navigate, { ...user});
            } else {
                createdUser = await addUser(navigate, { ...user});
            }

            navigate(location.state?.returnTo || '/booking/', {
                state: {
                    ...location.state,
                    createdUser: createdUser,
                    toUpdateUser: toUpdateUser
                }
            });
        } catch (error) {
            console.error('Error updating user:', error);
            toast.error('Failed to update user. Please try again.');
        } finally {
            setIsFormDisabled(false); // Re-enable after operation
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        console.debug("User::handleCancel::")
        navigate(location.state?.returnTo || '/booking/', {
            state: {
                ...location.state,
                toUpdateUser: toUpdateUser

            }
        });
    };

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
            <div className="user-form-container">
                <h2>{toUpdateUser ? "Update" : "Create"} User {toUpdateUserId && <>({toUpdateUserId})</>}</h2>

                <form onSubmit={e => e.preventDefault()}>
{/*                     <div className='form-group'>
                        <label>Username:</label>
                        <input type="text" name="username" value={user.username} onChange={handleChange} />
                    </div>
 */}                    <div className='form-group'>
                        <label>First Name:</label>
                        <input type="text" name="first_name" value={user.first_name} onChange={handleChange} />
                    </div>
                    <div className='form-group'>
                        <label>Last Name:</label>
                        <input type="text" name="last_name" value={user.last_name} onChange={handleChange} />
                    </div>

                    <div className='form-group'>
                        <label>User Type:</label>
                        <select name="user_type" value={user.user_type} onChange={handleChange}>
                            <option key="" value="Please Select">Please Select</option>
                            {USER_TYPES.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
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
                        {isUserInRoles(['manager', 'owner']) ?
                            <button
                                type="button"
                                className="button-primary"
                                onClick={handleUpdate}
                                disabled={isSubmitting || isFormDisabled}
                            >
                                {isSubmitting ? 'Processing ...' : toUpdateUser ? 'Update' : 'Save'}
                            </button>
                            : ''
                        }
                    </div>
                </form>
            </div>
        </div>
    );
};

export default User;
