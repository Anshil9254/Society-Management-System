import axios from 'axios';
import { getAccessToken, clearAccessToken } from '../contexts/AuthContext';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  withCredentials: true, // Sends httpOnly refresh token cookie automatically
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Request interceptor: attach in-memory access token.
 * The token lives in JS memory only — NOT in localStorage or sessionStorage.
 * This prevents XSS attacks from reading the token via document.cookie or localStorage.
 */
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken(); // Read from in-memory store
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Let axios auto-set Content-Type + boundary when body is FormData
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor: handle 401 globally.
 * When the server rejects a request as unauthorized, clear the in-memory token
 * and dispatch an event so AuthContext can update UI state.
 */
api.interceptors.response.use(
  (response) => response.data, // Return just the data for cleaner usage
  (error) => {
    if (error.response?.status === 401) {
      clearAccessToken();
      window.dispatchEvent(new Event('unauthorized'));
    }
    const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(errorMessage));
  }
);

export default api;

