import axios from 'axios';


export const extractErrorMessage = (error: any, defaultMessage: string = 'An unexpected error occurred'): string => {
  if (axios.isAxiosError(error)) {

    const responseData = error.response?.data;
    
    if (responseData) {
      if (typeof responseData === 'string') return responseData;
      if (responseData.message) return responseData.message;
      if (responseData.error) return responseData.error;
    }

    if (error.response?.status === 401) return 'Session expired. Please log in again.';
    if (error.response?.status === 403) return 'You don\'t have permission to perform this action.';
    if (error.response?.status === 429) return 'Too many requests. Please try again later.';
    if (error.response?.status === 500) return 'Internal Server Error. Our team is looking into it.';
    
    return error.message || defaultMessage;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return defaultMessage;
};
