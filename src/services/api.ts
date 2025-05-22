
import axios from 'axios';
import { ApiUrl } from '@/Constants';

const api = axios.create({
  baseURL: ApiUrl
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const originalRequest = error.config;
    
    // Handle authentication errors
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // Redirect to login or handle token refresh logic here
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_email');
      localStorage.removeItem('user_role');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;
