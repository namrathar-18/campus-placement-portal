import axios from 'axios';

// Active backend. A decommissioned deployment host is normalized to the live
// one so the app keeps working even if an old build-time env var lingers.
const LIVE_API_URL = 'https://campus-placement-portal-dl0o.onrender.com/api';
const STALE_API_HOST = 'backend-campus-placement-portal.onrender.com';

const configuredApiUrl = import.meta.env.VITE_API_URL || LIVE_API_URL;
const API_URL = configuredApiUrl.includes(STALE_API_HOST) ? LIVE_API_URL : configuredApiUrl;

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Just remove the token - let the app handle navigation via isAuthenticated state
      localStorage.removeItem('token');
    }
    const errorData = error.response?.data || { message: error.message || 'Network error' };
    return Promise.reject(errorData);
  }
);

export default api;
