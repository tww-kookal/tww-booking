import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import { validateCustomer, updateCustomer, addCustomer, getCustomerById } from '../modules/customer.module';
import { isUserInRoles } from '../contexts/constants';

import '../css/customer.large.css';
import '../css/customer.handheld.css';
import ScrollToTop from '../site/ScrollToTop';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectFade, Autoplay } from 'swiper';
import '../styles.css'
import 'swiper/css/effect-fade';
import 'swiper/css';

const Customer = () => {
    const { id } = useParams();
    const location = useLocation();
    const preloadedCustomer = location.state?.preloadedCustomer;
    const toUpdateCustomerId = location.state?.customer_id;
    const navigate = useNavigate();
    const [toUpdateCustomer, setToUpdateCustomer] = useState(false);
    const [customer, setCustomer] = useState({
        customer_id: '',
        customer_name: '',
        phone: '',
        email: '',
        area: '',
        city: '',
        state: '',
        country: '',
        zip_code: '',
    });

    useEffect(() => {
        if (toUpdateCustomerId) {
            getCustomerById(navigate, toUpdateCustomerId).then(customer => {
                setToUpdateCustomer(true)
                setCustomer(customer || null);
            }).catch(err => {
                console.error('Customer::Error fetching customer:', err);
                toast.error('Failed to fetch customer details');
            }).finally(() => {

            })
        }
    }, [toUpdateCustomerId]);

    useEffect(() => {
        if (preloadedCustomer) {
            setCustomer({
                ...preloadedCustomer
            });
        } else if (id) {
            getCustomerById(navigate, id).then(customer => {
                setCustomer(customer || null);
            }).catch(err => {
                console.error('Customer::Error fetching customer:', err);
                toast.error('Failed to fetch customer details');
            }).finally(() => {

            })
        }
    }, [preloadedCustomer, id]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setCustomer(prev => {
            const updated = {
                ...prev,
                [name]: value,
            };
            return updated;
        });
    };

    const handleAddNew = () => {
        // Add New Customer
        setCustomer({
            customer_id: '',
            customer_name: '',
            user_type: 'CUSTOMER',
            phone: '',
            email: '',
            area: '',
            city: '',
            state: '',
            country: '',
            zip_code: '',
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
        let errors = validateCustomer(customer);
        if (errors && errors.length > 0) {
            toast.error(errors.join(', '));
            setIsFormDisabled(false); // Re-enable on error
            return;
        }

        try {
            // Update or Add Customer
            let createdCustomer = null;
            if (customer.customer_id) {
                createdCustomer = await updateCustomer(navigate, customer);
            } else {
                createdCustomer = await addCustomer(navigate, customer);
            }
            navigate(location.state?.returnTo || '/booking/', {
                state: {
                    ...location.state,
                    createdCustomer: createdCustomer,
                    toUpdateCustomer: true
                }
            });
        } catch (error) {
            console.error('Error updating customer:', error);
            toast.error('Failed to update customer. Please try again.');
        } finally {
            setIsFormDisabled(false); // Re-enable after operation
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        console.debug("Customer::handleCancel::")
        navigate(location.state?.returnTo || '/booking/', {
            state: {
                ...location.state,
                toUpdateCustomer: toUpdateCustomer
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
            <div className="customer-form-container">
                <ToastContainer />
                <h2>{toUpdateCustomer ? "Update" : "Create"} Customer
                    {toUpdateCustomer ?
                        <i> ({customer.customer_id})</i>
                        : ""}
                </h2>
                <form onSubmit={e => e.preventDefault()}>
                    <div className='form-group'>
                        <label>Name</label>
                        <input type="text" name="customer_name" value={customer.customer_name} onChange={handleChange} />
                    </div>

                    <div className='form-group'>
                        <label>Phone</label>
                        <input type="tel" name="phone" value={customer.phone} onChange={handleChange} />
                    </div>

                    <div className='form-group'>
                        <label>EMail</label>
                        <input type="email" name="email" value={customer.email} onChange={handleChange} />
                    </div>
                    <div className='form-group'>
                        <label>Area</label>
                        <input type="text" name="area" value={customer.area} onChange={handleChange} />
                    </div>
                    <div className='form-group'>
                        <label>City</label>
                        <input type="text" name="city" value={customer.city} onChange={handleChange} />
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
                                {isSubmitting ? 'Processing ...' : toUpdateCustomer ? 'Update' : 'Save'}
                            </button>
                            : ''
                        }
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Customer;
