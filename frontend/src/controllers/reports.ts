import { AxiosInstance } from "../axios/axiosInstance"


export const getStreakInfo = async() =>{
    try {
        const response = await AxiosInstance.post('/reports/streak-info');
        console.log(response.data);
        return response.data
    } catch (error) {
        console.error(error)
    }
}