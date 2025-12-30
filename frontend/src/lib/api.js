import axios from 'axios';
import { API_BASE_URL } from '@/configs/env';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies with requests (for JWT in httpOnly cookies)
});

// Request interceptor - runs before every request
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage if it exists
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }

    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor - runs after every response
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }

    return response;
  },
  (error) => {
    // Handle errors globally
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          console.error('[API Error] Unauthorized - clearing token');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Only redirect if not already on auth pages
          if (!window.location.pathname.includes('/login') && 
              !window.location.pathname.includes('/signup')) {
            window.location.href = '/login';
          }
          break;

        case 403:
          // Forbidden - user doesn't have permission
          console.error('[API Error] Forbidden:', data.message || data.error);
          break;

        case 404:
          // Not found
          console.error('[API Error] Not Found:', data.message || data.error);
          break;

        case 500:
          // Server error
          console.error('[API Error] Server Error:', data.message || data.error);
          break;

        default:
          console.error('[API Error]', status, data);
      }

      // Return a normalized error object
      return Promise.reject({
        status,
        message: data.message || data.error || 'An error occurred',
        data: data,
      });
    } else if (error.request) {
      // Request was made but no response received (network error)
      console.error('[API Error] Network Error - No response received');
      return Promise.reject({
        status: 0,
        message: 'Network error - please check your connection',
        data: null,
      });
    } else {
      // Something else happened
      console.error('[API Error] Unexpected Error:', error.message);
      return Promise.reject({
        status: 0,
        message: error.message || 'An unexpected error occurred',
        data: null,
      });
    }
  }
);

export default api;
