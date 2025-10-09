import api from './apiClient';

export const getDashboard = async (navigate) => {
    try {
        const response = await api.get("/gateway/dashboard/");
        console.debug("Booking.Module::getDashboard::Fetched dashboard");
        return response.data?.content || {};
    } catch (error) {
        console.error("Booking.Module::getDashboard::Error fetching dashboard", error);
        if (error?.code == 'ERR_NETWORK') {
            navigate('/login')
        }
        return {}
    }
}

export const getAvailability = async (navigate, startDate) => {
    try {
        const response = await api.get(`/gateway/availability/${startDate}/`);
        console.debug("Booking.Module::getAvailability::Fetched availability");
        return response.data?.content || [];
    } catch (error) {
        console.error("Booking.Module::getAvailability::Error fetching availability", error);
        if (error?.code == 'ERR_NETWORK') {
            navigate('/login')
        }
        throw error
    }
}