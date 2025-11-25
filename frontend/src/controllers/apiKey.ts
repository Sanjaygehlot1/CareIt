import { AxiosInstance } from "../axios/axiosInstance"

export const generateApiKey = async () => {
    try {
        const res = await AxiosInstance.get('/auth/generate-api-key')
        return res.data;
    } catch (error) {
        console.log(error)
        throw error;
    }
} 
export const getApiKey = async () => {
    try {
        const res = await AxiosInstance.get('/auth/get-api-key')
        return res.data;
    } catch (error) {
        console.log(error)
        throw error;
    }
} 