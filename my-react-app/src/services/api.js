/**
 * API Service
 * Handles all HTTP requests to the backend
 */

import axios from 'axios';

// Base API URL - Update this to match your backend
const API_BASE_URL = import.meta.env.VITE_API_URL;   //const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 error and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token } = response.data;
          
          // Store new tokens
          localStorage.setItem('accessToken', access_token);
          localStorage.setItem('refreshToken', refresh_token);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ============================================================================
// AUTH API
// ============================================================================

/**
 * Register a new user
 */
export const register = async (username, email, password) => {
  const response = await api.post('/auth/register', {
    username,
    email,
    password,
  });
  return response.data;
};

/**
 * Login user
 */
export const login = async (username, password) => {
  const response = await api.post('/auth/login', {
    username,
    password,
  });
  return response.data;
};

/**
 * Refresh access token
 */
export const refreshToken = async (refreshToken) => {
  const response = await api.post('/auth/refresh', {
    refresh_token: refreshToken,
  });
  return response.data;
};

/**
 * Logout user
 */
export const logout = async (refreshToken) => {
  const response = await api.post('/auth/logout', {
    refresh_token: refreshToken,
  });
  return response.data;
};

/**
 * Get current user info
 */
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// ============================================================================
// USER API
// ============================================================================

/**
 * Get all users (admin only)
 */
export const getAllUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

/**
 * Get user by ID
 */
export const getUserById = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

/**
 * Update user role (admin only)
 */
export const updateUserRole = async (userId, role) => {
  const response = await api.put(`/users/${userId}/role`, { role });
  return response.data;
};

// ============================================================================
// TRANSACTION API
// ============================================================================

/**
 * Get all transactions for current user
 */
export const getTransactions = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.type && filters.type !== 'all') params.append('type', filters.type);
  if (filters.category) params.append('category', filters.category);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.search) params.append('search', filters.search);
  if (filters.limit) params.append('limit', filters.limit);
  if (filters.offset) params.append('offset', filters.offset);
  
  const response = await api.get(`/transactions?${params.toString()}`);
  return response.data;
};

/**
 * Get a single transaction by ID
 */
export const getTransactionById = async (transactionId) => {
  const response = await api.get(`/transactions/${transactionId}`);
  return response.data;
};

/**
 * Create a new transaction
 */
export const createTransaction = async (transactionData) => {
  const response = await api.post('/transactions', transactionData);
  return response.data;
};

/**
 * Update a transaction
 */
export const updateTransaction = async (transactionId, transactionData) => {
  const response = await api.put(`/transactions/${transactionId}`, transactionData);
  return response.data;
};

/**
 * Delete a transaction
 */
export const deleteTransaction = async (transactionId) => {
  const response = await api.delete(`/transactions/${transactionId}`);
  return response.data;
};

/**
 * Get transaction summary (total income, expense, balance)
 */
export const getTransactionSummary = async (startDate = null, endDate = null) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const response = await api.get(`/transactions/summary?${params.toString()}`);
  return response.data.summary || {};
};

/**
 * Get category-wise expense breakdown
 */
export const getCategoryBreakdown = async (startDate = null, endDate = null) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const response = await api.get(`/transactions/analytics/category-breakdown?${params.toString()}`);
  return response.data.breakdown || [];
};

/**
 * Get monthly trend data
 */
export const getMonthlyTrend = async (year = null) => {
  const params = new URLSearchParams();
  if (year) params.append('year', year);
  
  const response = await api.get(`/transactions/analytics/monthly-trend?${params.toString()}`);
  return response.data.trend || [];
};

/**
 * Get yearly spending overview
 */
export const getYearlyOverview = async () => {
  const response = await api.get(`/transactions/analytics/yearly-overview`);
  return response.data.overview || [];
};

export default api;
