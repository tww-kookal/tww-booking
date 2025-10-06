import dayjs from 'dayjs';
import api from './apiClient';

export const validateTransaction = (transactionToValidate) => {
    //consolidate all the errors as a list and return the list
    let errors = [];
    let errorMessage = '';
    if (!transactionToValidate.acc_category_id) {
        errors.push("Category");
    }
    if (!transactionToValidate.paid_by) {
        errors.push("Paid By");
    }
    if (!transactionToValidate.acc_entry_amount) {
        errors.push("Amount");
    } 

    if (Number(transactionToValidate.acc_entry_amount) <= 0) {
        errorMessage = "Amount must be above 0";
    }

    if (!transactionToValidate.acc_entry_description) {
        errors.push("Description");
    }
    if (!transactionToValidate.acc_entry_date) {
        errors.push("Date");
    }
    if (!transactionToValidate.txn_by) {
        errors.push("Txn By");
    }
    if (!transactionToValidate.received_by) {
        errors.push("Received By");
    }

    if (errors.length > 0 && errorMessage != '') {
        return "Mandatory fields [" + errors.join(", ") + "], " + errorMessage;
    } else if (errors.length == 0 && errorMessage != ''){
        return errorMessage;
    } else if (errors.length == 0 && errorMessage == '') {
        return 'ALL_GOOD';
    } else if (errors.length > 0 && errorMessage == '') {
        return "Mandatory fields [" + errors.join(", ") + "]";
    }

    return 'ALL_GOOD';
}

/**
 * Loads all accounting categories from the server.
 *
 * @async
 * @returns {Promise<Array<AccountingCategory>>} A promise that resolves to an array of accounting category objects.
 */
export const getAllAccountingCategories = async (navigate) => {
    console.debug("Accounting.Module::getAllAccountingCategories::Fetching all acc categories");
    try {
        const response = await api.get("/accounting/categories");
        console.debug("Booking.Module::getAllAccountingCategories::Fetched all acc categories", (response?.data?.categories || []).length);
        return response?.data?.categories || []
    } catch (error) {
        console.error("Accounting.Module::getAllAccountingCategories::Error fetching all acc categories", error);
        if (error?.code == 'ERR_NETWORK') {
            navigate('/login')
        }
        return []
    }
}

export const createTransaction = async (transaction) => {
    console.debug("Accounting.Module::createTransaction::Creating transaction", transaction);
    try {
        const response = await api.post("/accounting/transaction/add", transaction);
        console.debug("Transaction.Module::createTransaction::Created transaction", response?.data);
        return response?.data;
    } catch (error) {
        console.error("Accounting.Module::createTransaction::Error creating transaction", error);
        throw error;
    }
}

export const updateTransaction = async (transaction) => {
    console.debug("Accounting.Module::updateTransaction::Updating transaction", transaction);
    try {
        const response = await api.post("/accounting/transaction/update", transaction);
        console.debug("Transaction.Module::updateTransaction::Updated transaction", response?.data);
        return response?.data;
    } catch (error) {
        console.error("Accounting.Module::updateTransaction::Error updating transaction", error);
        throw error;
    }
}

/**
 * Loads all accounting categories from the server.
 *
 * @async
 * @returns {Promise<Array<AccountingCategory>>} A promise that resolves to an array of accounting category objects.
 */
export const getTransactionsSince = async (navigate, startingDate = dayjs().format("YYYY-MM-DD")) => {
    console.debug("Accounting.Module::getTransactionsSince::Fetching all transactions");
    try {
        const response = await api.get("/accounting/transactions/" + startingDate);
        console.debug("Accounting.Module::getTransactionsSince::Fetched all transactions", (response?.data?.transactions || []).length);
        return response?.data?.transactions || []
    } catch (error) {
        console.error("Accounting.Module::getTransactionsSince::Error fetching all transactions", error);
        if (error?.code == 'ERR_NETWORK') {
            navigate('/login')
        }
        return []
    }
}

export const getTransactions = async (navigate, searchCriteria) => {
    console.debug("Accounting.Module::getTransactions::Fetching all transactions", searchCriteria);
    try {
        const response = await api.post("/accounting/transactions/search", searchCriteria);
        console.debug("Accounting.Module::getTransactions::Fetched all transactions", (response?.data?.transactions || []).length);
        return response?.data?.transactions || []
    } catch (error) {
        console.error("Accounting.Module::getTransactions::Error fetching all transactions", error);
        if (error?.code == 'ERR_NETWORK') {
            navigate('/login')
        }
        return []
    }
}
