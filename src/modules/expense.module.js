import dayjs from 'dayjs';
import api from './apiClient';
import { FOLDER_ID } from './config';
import { getUserContext } from '../contexts/constants';

export const validateExpense = (expenseToValidate) => {
    //consolidate all the errors as a list and return the list
    let errors = [];
    let errorMessage = '';
    if (!expenseToValidate.acc_category_id) {
        errors.push("Category");
    }
    if (!expenseToValidate.paid_by) {
        errors.push("Paid By");
    }
    if (!expenseToValidate.acc_entry_amount) {
        errors.push("Amount");
    } 

    if (Number(expenseToValidate.acc_entry_amount) <= 0) {
        errorMessage = "Amount must be above 0";
    }

    if (!expenseToValidate.acc_entry_description) {
        errors.push("Description");
    }
    if (!expenseToValidate.acc_entry_date) {
        errors.push("Date");
    }
    if (!expenseToValidate.txn_by) {
        errors.push("Txn By");
    }
    if (!expenseToValidate.received_by) {
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

export const createExpense = async (expense) => {
    console.debug("Expense.Module::createExpense::Creating expense", expense);
    try {
        const response = await api.post("/accounting/expense/add", expense);
        console.debug("Expense.Module::createExpense::Created expense", response?.data);
        return response?.data;
    } catch (error) {
        console.error("Expense.Module::createExpense::Error creating expense", error);
        throw error;
    }
}

export const updateExpense = async (expense) => {
    console.debug("Expense.Module::updateExpense::Updating expense", expense);
    try {
        const response = await api.post("/accounting/expense/update", expense);
        console.debug("Expense.Module::updateExpense::Updated expense", response?.data);
        return response?.data;
    } catch (error) {
        console.error("Expense.Module::updateExpense::Error updating expense", error);
        throw error;
    }
}


/**
 * Loads all accounting categories from the server.
 *
 * @async
 * @returns {Promise<Array<AccountingCategory>>} A promise that resolves to an array of accounting category objects.
 */
export const getExpensesSince = async (navigate, startingDate = dayjs().format("YYYY-MM-DD")) => {
    console.debug("Accounting.Module::getExpensesSince::Fetching all expenses");
    try {
        const response = await api.get("/accounting/expenses/" + startingDate);
        console.debug("Booking.Module::getExpensesSince::Fetched all expenses", (response?.data?.expenses || []).length);
        return response?.data?.expenses || []
    } catch (error) {
        console.error("Accounting.Module::getExpensesSince::Error fetching all expenses", error);
        if (error?.code == 'ERR_NETWORK') {
            navigate('/login')
        }
        return []
    }
}

