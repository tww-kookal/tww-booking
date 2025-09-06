
import dayjs from 'dayjs';
import api from './apiClient';
import { getUserContext } from '../contexts/constants';
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

const transformPaymentV1toV2 = (payment) => {
    return {
        acc_category_id: payment.payment_for,
        acc_entry_amount: payment.payment_amount,
        acc_entry_description: payment.remarks,
        acc_entry_date: payment.payment_date,
        txn_by: getUserContext().user.user_id,
        created_by: getUserContext().user.user_id,
        paid_by: payment.customer_id,
        received_by: payment.payment_to,
        received_for_booking_id: payment.booking_id,
        payment_type: payment.payment_type,
    }
}

const transformExpenseV2toV1 = (payment) => {
    return {
        ...payment,
        booking_payments_id: payment.acc_entry_id,
        booking_id: payment.received_for_booking_id,
        payment_type: payment.payment_type,
        payment_amount: payment.acc_entry_amount,
        payment_date: payment.acc_entry_date,
        payment_to: payment.received_by,
        payment_for: payment.acc_category_id,
        payment_added_by: payment.created_by,
        remarks: payment.acc_entry_description,
    }
}

export const addPayment = async (navigate, payment) => {
    console.debug("Payment.Module::addPayment::Adding payment");
    try {
        const paymentV2 = transformPaymentV1toV2(payment);
        console.log("Payments::ModuleV2:: after ", paymentV2);
        const response = await api.post("/accounting/expense/add", paymentV2);
        const addedExpense = transformExpenseV2toV1(response.data?.createdExpense);
        return addedExpense || {}
    } catch (error) {
        console.error("Payment.Module::addPayment::Error adding payment", error);
        if (error?.code == 'ERR_NETWORK') {
            navigate('/login')
        }
        throw error;
    }
}

export const updatePayment = async (navigate, payment) => {
    console.debug("Payment.Module::updatePayment::Updating payment, ", payment);
    try {
        const paymentV2 = {
            ...transformPaymentV1toV2(payment),
            acc_entry_id: payment.booking_payments_id,
            paid_by: payment.paid_by
        }
        const response = await api.post("/accounting/expense/update", paymentV2);
        const updatedExpense = transformExpenseV2toV1(response.data?.updatedExpense);
        return updatedExpense || {}
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
        await api.post("/accounting/expense/deleteById/" + payment.acc_entry_id);
        return {}
    } catch (error) {
        console.debug("Payment.Module::deletePaymentById::Error deleting payment", error);
        if (error?.code == 'ERR_NETWORK') {
            navigate('/login')
        }
        throw error
    }
}

