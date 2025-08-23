
import dayjs from 'dayjs';
import api from './apiClient';
/**
 * Validates a booking object to ensure all required fields are present and that the check-out date is after the check-in date.
 *
 * @param {object} customer - The customer object to validate.
 * @param {string} customer.customer_name - The name of the customer.
 * @param {string} customer.phone - The contact number of the customer.
 * @param {string} customer.email - The contact email of the customer
 * @param {string} customer.customer_id - Id of the customer
 * @returns {Array<string>} An array of error messages. If the array is empty, the customer is valid.
 */
export const validatePayment = (payment) => {
    const errors = [];

    // Check required fields
    if (!payment.payment_type) {
        errors.push('Payment Type is required');
    }
    if (!payment.payment_amount) {
        errors.push('Payment Amount is required');
    }

    return errors;
};

export const PAYMENT_FOR = [{id: 'advance', value: 'Advance'}, {id: 'part-pay',value: 'Part Pay'}, {id: 'balance',value: 'Balance'}, {id: 'refund',value: 'Refund'}]
export const PAYMENT_TYPE = [{id: 'cash', value: 'Cash'}, {id: 'cc',value: 'Credit Card'}, {id: 'dc',value: 'Debit Card'}, {id: 'gpay',value: 'Google Pay'}, {id: 'upi',value: 'UPI'}, {id: 'bank',value: 'Bank'}]


export const addPayment = async (navigate, payment) => {
    console.debug("Payment.Module::addPayment::Adding payment");
    try {
        const response = await api.post("/customers/create", customer);
        return response.data?.customer || {}
    } catch (error) {
        console.debug("Customer.Module::addCustomer::Error adding customer", error);
        if (error?.code == 'ERR_NETWORK') {
            navigate('/login')
        }
        return {}
    }
}

export const updatePayment = async (navigate, payment) => {
    console.debug("Payment.Module::updatePayment::Updating payment");
    try {
        const response = await api.post("/customers/update", {
            ...customer,
            customer_id: customer.customer_id.toString()
        });

        return response.data?.customer || {}
    } catch (error) {
        console.debug("Customer.Module::updateCustomer::Error updating customer", error);
        if (error?.code == 'ERR_NETWORK') {
            navigate('/login')
        }
        return {}
    }
}

