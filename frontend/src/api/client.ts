import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000, // 60s to handle Render free tier cold starts
});

// Request interceptor - attach JWT
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('taskflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 and timeouts
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('taskflow_token');
      localStorage.removeItem('taskflow_user');
      window.location.href = '/login';
    }
    // Provide helpful message for cold start timeouts
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      error.isTimeout = true;
      error.userMessage = 'Server is waking up, please try again in a moment...';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
