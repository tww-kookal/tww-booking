
import dayjs from 'dayjs';
import api from './apiClient';

/**
 * Loads all customers from the server.
 *
 * @async
 * @returns {Promise<Array<User>>} A promise that resolves to an array of user objects.
 */
export const getAllUsers = async () => {
    console.log("Customer.Module::getAllUsers::Fetching all users");
    try {
        const response = await api.get("/users/");
        return response.data?.users || []
    } catch (error) {
        console.log("Customer.Module::getAllUsers::Error fetching all users", error);
        return []
    }
}

