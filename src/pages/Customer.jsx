import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import { validateCustomer, updateCustomer, addCustomer, getCustomerById } from '../modules/customer.module';

import '../css/customer.large.css';
import '../css/customer.handheld.css';

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
            getCustomerById(toUpdateCustomerId).then(customer => {
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
            getCustomerById(id).then(customer => {
                setCustomer(customer || null);
            }).catch(err => {
                console.error('Customer::Error fetching customer:', err);
                toast.error('Failed to fetch customer details');
            }).finally(() => {

            })
        }
    }, [preloadedCustomer, id]);

    // useEffect(() => {
    //     setCustomer(prev => ({
    //         ...prev,
    //         numberOfNights,
    //         commission,
    //         balanceToPay,
    //         twwRevenue
    //     }));
    // }, [booking.check_in, booking.check_out, booking.room_price, booking.food_price, booking.service_price, booking.advance_paid || 0]);

    // const handleChange = (e) => {
    //     const { name, value } = e.target;
    //     setCustomer(prev => ({ ...prev, [name]: name === 'numberOfPeople' || name.includes('Amount') || name === 'food' || name === 'campFire' || name === 'advancePaid' ? +value : value }));
    // };

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
            console.log("Customer::With Customer ID ", customer.customer_id)
            let createdCustomer = null;
            if (customer.customer_id) {
                createdCustomer = await updateCustomer(customer);
            } else {
                createdCustomer = await addCustomer(customer);
            }

            navigate(location.state?.returnTo || '/booking/', {
                state: {
                    ...location.state,
                    createdCustomer: createdCustomer,
                    toUpdateCustomer: toUpdateCustomer
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
        console.log("Customer::handleCancel::", location.state)
        navigate(location.state?.returnTo || '/booking/', {
            state: {
                ...location.state,
                toUpdateCustomer: toUpdateCustomer
            }
        });
    };

    return (
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
                    <button
                        type="button"
                        className="button-primary"
                        onClick={handleUpdate}
                        disabled={isSubmitting || isFormDisabled}
                    >
                        {isSubmitting ? 'Processing ...' : toUpdateCustomer ? 'Update' : 'Save'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Customer;
