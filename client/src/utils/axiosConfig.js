import axios from 'axios';

// Get the base URL from Vite's define or use the API config
const getBaseURL = () => {
  // Check if we have the Vite-defined API base URL
  if (typeof __API_BASE_URL__ !== 'undefined') {
    return __API_BASE_URL__;
  }
  
  // Fallback to API config
  const isDevelopment = import.meta.env.DEV;
  return isDevelopment 
    ? '' // Empty for relative URLs in development (uses Vite proxy)
    : 'https://juegoaspirantesback.onrender.com'; // Render backend in production
};

// Configure axios with the base URL
const configureAxios = () => {
  const baseURL = getBaseURL();
  
  if (baseURL) {
    axios.defaults.baseURL = baseURL;
  }
  
  // Set default timeout
  axios.defaults.timeout = 15000; // 15 seconds
  
  // Add request interceptor for logging
  axios.interceptors.request.use(
    (config) => {
      return config;
    },
    (error) => {
      console.error('❌ Request Error:', error);
      return Promise.reject(error);
    }
  );
  
  // Add response interceptor for logging
  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`, error.response?.data);
      return Promise.reject(error);
    }
  );
};

// Initialize axios configuration
configureAxios();

export default axios;
