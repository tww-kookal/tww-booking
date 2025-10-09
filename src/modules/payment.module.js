
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
        txn_by: getUserContext().logged_in_user?.user_id,
        created_by: getUserContext().logged_in_user?.user_id,
        received_by: payment.payment_to,
        received_for_booking_id: payment.booking_id,
        payment_type: payment.payment_type,
    }
}

const transformTransactionV2toV1 = (transaction) => {
    return {
        ...transaction,
        booking_payments_id: transaction.acc_entry_id,
        booking_id: transaction.received_for_booking_id,
        payment_type: transaction.payment_type,
        payment_amount: transaction.acc_entry_amount,
        payment_date: transaction.acc_entry_date,
        payment_to: transaction.received_by,
        payment_for: transaction.acc_category_id,
        payment_added_by: transaction.created_by,
        remarks: transaction.acc_entry_description,
    }
}

export const addPayment = async (navigate, payment) => {
    console.debug("Payment.Module::addPayment::Adding payment ", payment);
    try {
        const paymentV2 = {
            ...transformPaymentV1toV2(payment),
            paid_by: payment.paid_by,
        }
        console.log("Payments::ModuleV2:: after ", paymentV2);
        console.log("Payments::UserContext ", getUserContext());
        const response = await api.post("/accounting/transaction/add", paymentV2);
        const addedTransaction = transformTransactionV2toV1(response.data?.createdTransaction);
        return addedTransaction || {}
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
        const response = await api.post("/accounting/transaction/update", paymentV2);
        const updatedTransaction = transformTransactionV2toV1(response.data?.updatedTransaction);
        return updatedTransaction || {}
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
        await api.post("/accounting/transaction/deleteById/" + payment.acc_entry_id);
        return {}
    } catch (error) {
        console.debug("Payment.Module::deletePaymentById::Error deleting payment", error);
        if (error?.code == 'ERR_NETWORK') {
            navigate('/login')
        }
        throw error
    }
}

