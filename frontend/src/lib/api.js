import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor for unified error handling
api.interceptors.response.use(
  (response) => response.data, // Return just the data object for cleaner usage
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if unauthorized (could trigger a global event)
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('unauthorized'));
    }
    
    // Format error message from backend
    const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(errorMessage));
  }
);

export default api;
