import axios from 'axios';

// Detect environment
const isProduction = import.meta.env.PROD;
const API_URL = 'https://goldfish-app-9bzzn.ondigitalocean.app'

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Response error:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    if (error.response?.status === 404) {
      console.error('API endpoint not found. Check your backend URL.');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;