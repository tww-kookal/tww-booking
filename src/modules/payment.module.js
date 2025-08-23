
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
        const response = await api.post("/payment/add", payment);
        return response.data?.addedPayment || {}
    } catch (error) {
        console.debug("Payment.Module::addPayment::Error adding payment", error);
        if (error?.code == 'ERR_NETWORK') {
            navigate('/login')
        }
        return {}
    }
}

export const updatePayment = async (navigate, payment) => {
    console.debug("Payment.Module::updatePayment::Updating payment");
    try {
        const response = await api.post("/payment/update", {
            ...payment,
            booking_payments_id: payment.booking_payments_id
        });
        return response.data?.payment || {}
    } catch (error) {
        console.debug("Payment.Module::updatePayment::Error updating payment", error);
        if (error?.code == 'ERR_NETWORK') {
            navigate('/login')
        }
        throw error;
    }
}

export const deletePaymentById = async (navigate, payment) => {
    try {
        await api.post("/payment/deleteById/" + payment.booking_payments_id.toString());
        return {}
    } catch (error) {
        console.debug("Payment.Module::deletePaymentById::Error deleting payment", error);
        if (error?.code == 'ERR_NETWORK') {
            navigate('/login')
        }
        throw error
    }
}

