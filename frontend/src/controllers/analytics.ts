import { AxiosInstance } from "../axios/axiosInstance";

export const getEditorStats = async (range: number = 7) => {
    try {
        const response = await AxiosInstance.get(`/analytics/get-editor-analytics?range=${range}`);
        if (response) {
            return response.data.data;
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}