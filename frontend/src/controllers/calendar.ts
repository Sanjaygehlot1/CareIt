import { AxiosInstance } from "../axios/axiosInstance";
import type { Events } from "../types/calendar";

export const getEvents = async () => {
    try {
        const response = await AxiosInstance.get('/calendar/get-events');
        if (response) {
            return response.data.data;
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}