import axios from 'axios';

const getApiUrl = () => {
  const isProd = import.meta.env.PROD;
  
  console.log('🔍 ENV DEBUG =====================');
  console.log('Is Production:', isProd);
  console.log('MODE:', import.meta.env.MODE);
  console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
  
  const url = isProd 
    ? 'https://goldfish-app-9bzzn.ondigitalocean.app/api'
    : '/api';
  
  console.log('✅ Final API URL:', url);
  console.log('==================================');
  
  return url;
};

const axiosInstance = axios.create({
  baseURL: getApiUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 12000,
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`🚀 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ API Error:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;