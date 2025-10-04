
import dayjs from 'dayjs';
import api from './apiClient';

/**
 * Loads all customers from the server.
 *
 * @async
 * @returns {Promise<Array<Customer>>} A promise that resolves to an array of customer objects.
 */
export const getAllCustomers = async (navigate) => {
    console.debug("Customer.Module::getAllCustomers::Fetching all customers");
    try {
        const response = await api.get("/customers/");
        return response.data?.customers || []
    } catch (error) {
        console.error("Customer.Module::getAllCustomers::Error fetching all customers", error);
        if (error?.code == 'ERR_NETWORK') {
            navigate('/login')
        }
        return []
    }
}

/**
 * Loads customer by ID from the server.
 *
 * @async
 * @returns {Promise<Customer>} A promise that resolves to a customer object.
 */
export const getCustomerById = async (navigate, customer_id) => {
    console.debug("Customer.Module::getCustomerById::Fetching customer by ID");
    try {
        const response = await api.get("/customers/byID/" + customer_id);
        return response.data?.customer || {}
    } catch (error) {
        console.error("Customer.Module::getCustomerById::Error fetching customer by ID", error);
        if (error?.code == 'ERR_NETWORK') {
            navigate('/login')
        }
        return {}
    }
}

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
export const validateCustomer = (customer) => {
    const errors = [];

    // Check required fields
    if (!customer.customer_name) {
        errors.push('Customer Name is required');
    }
    if (!customer.phone) {
        errors.push('Phone is required');
    }

    return errors;
};


export const addCustomer = async (navigate, customer) => {
    console.debug("Customer.Module::addCustomer::Adding customer");
    try {
        const response = await api.post("/customers/create", customer);
        return response.data?.customer || {}
    } catch (error) {
        console.debug("Customer.Module::addCustomer::Error adding customer", error);
        if (error?.code == 'ERR_NETWORK') {
            navigate('/login')
        }
        throw error
    }
}

export const updateCustomer = async (navigate, customer) => {
    console.debug("Customer.Module::updateCustomer::Updating customer");
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
        throw error
    }
}

