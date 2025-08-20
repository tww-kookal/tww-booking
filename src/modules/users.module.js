
import dayjs from 'dayjs';
import api from './apiClient';

/**
 * Loads all customers from the server.
 *
 * @async
 * @returns {Promise<Array<User>>} A promise that resolves to an array of user objects.
 */
export const getAllUsers = async (navigate) => {
    console.log("Customer.Module::getAllUsers::Fetching all users");
    try {
        const response = await api.get("/users/");
        return response.data?.users || []
    } catch (error) {
        console.log("User.Module::getAllUsers::Error fetching all users", error);
        if (error?.code == 'ERR_NETWORK') {
            navigate('/login')
        }
        return []
    }
}

/**
 * Loads user by ID from the server.
 *
 * @async
 * @returns {Promise<User>} A promise that resolves to a user object.
 */
export const getUserById = async (navigate, user_id) => {
    console.log("User.Module::getUserById::Fetching user by ID");
    try {
        const response = await api.get("/users/getById/" + user_id);
        return response.data?.user
    } catch (error) {
        console.log("User.Module::getUserById::Error fetching user by ID", error);
        if (error?.code == 'ERR_NETWORK') {
            navigate('/login')
        }
        throw error;
    }
}

/**
 * Validates a booking object to ensure all required fields are present and that the check-out date is after the check-in date.
 *
 * @param {object} user - The user object to validate.
 * @param {string} user.username - The username.
 * @param {string} user.phone - The contact number of the user.
 * @param {string} user.email - The contact email of the user
 * @param {string} user.user_id - Id of the user
 * @returns {Array<string>} An array of error messages. If the array is empty, the user is valid.
 */
export const validateUser = (user) => {
    const errors = [];

    // Check required fields
    if (!user.username) {
        errors.push('Username');
    }
    if (!user.first_name) {
        errors.push('First Name');
    }
    if (!user.last_name) {
        errors.push('Last Name');
    }
    if (!user.email) {
        errors.push('EMail');
    }
    if (!user.phone) {
        errors.push('Phone');
    }

    //if errors are not empty then remove the last comma and append with 'are required'
    if (errors.length > 0) {
        errors[errors.length - 1] = errors[errors.length - 1] + ' are required.';
    }
    return errors;
};


export const addUser = async (navigate, user) => {
    console.log("User.Module::addUser::Adding user");
    try {
        const response = await api.post("/users/create", user);
        return response.data?.user
    } catch (error) {
        console.error("User.Module::addUser::Error adding user", error);
        if (error?.code == 'ERR_NETWORK') {
            navigate('/login')
        }
        throw error
    }
}

export const updateUser = async (navigate, user) => {
    let thisUser = {
        ...user, "user_id": user.user_id.toString(),
        "booking_commission": user.booking_commission.toString()
    }
    try {
        const response = await api.post("/users/update", user);
        return response.data?.user
    } catch (error) {
        console.error("User.Module::updateUser::Error updating user", error);
        if (error?.code == 'ERR_NETWORK') {
            navigate('/login')
        }
        throw error
    }
}

