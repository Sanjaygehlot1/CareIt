import { AxiosInstance } from "../axios/axiosInstance";

export const getEditorStats = async () => {
    try {
        const response = await AxiosInstance.get('/analytics/get-editor-analytics');
        console.log(response.data)
        if (response) {
            return response.data.data;
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}