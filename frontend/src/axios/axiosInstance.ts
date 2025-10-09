import axios from "axios";
import { BACKEND_BASE_URL } from "../utils/secrets";

export const AxiosInstance = axios.create({
    baseURL: BACKEND_BASE_URL,
    withCredentials : true
})