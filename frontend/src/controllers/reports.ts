import { AxiosInstance } from "../axios/axiosInstance"

export const getFocusPoints = async() =>{
    try {
        const response = await AxiosInstance.get('/reports/focus-points',{
            params: {
                day : '2025-10-24'
            }
        });
        console.log(response.data.data);
    } catch (error) {
        console.error(error)
    }
}