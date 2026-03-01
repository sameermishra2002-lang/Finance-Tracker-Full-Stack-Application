/**
 * Authentication Context
 * Manages authentication state across the app with optimized hooks
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import * as api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ========================================================================
  // OPTIMIZED WITH useCallback - prevents recreation on every render
  // ========================================================================

  const clearAuth = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        clearAuth();
      }
    }
    setLoading(false);
  }, [clearAuth]);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const loginUser = useCallback(async (username, password) => {
    try {
      const response = await api.login(username, password);
      
      // Store tokens and user info
      localStorage.setItem('accessToken', response.access_token);
      localStorage.setItem('refreshToken', response.refresh_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setUser(response.user);
      setIsAuthenticated(true);
      
      return { success: true, user: response.user };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Login failed',
      };
    }
  }, []);

  const registerUser = useCallback(async (username, email, password) => {
    try {
      const response = await api.register(username, email, password);
      
      // Store tokens and user info
      localStorage.setItem('accessToken', response.access_token);
      localStorage.setItem('refreshToken', response.refresh_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setUser(response.user);
      setIsAuthenticated(true);
      
      return { success: true, user: response.user };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Registration failed',
      };
    }
  }, []);

  const logoutUser = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await api.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  // ========================================================================
  // REFRESH USER DATA - Check for role/profile updates from backend
  // ========================================================================
  const refreshUserData = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await api.getCurrentUser();
      const updatedUser = response.user || response;
      
      // Check if role or other critical data has changed
      if (user && updatedUser) {
        const hasChanges = 
          user.role !== updatedUser.role ||
          user.is_active !== updatedUser.is_active ||
          user.username !== updatedUser.username;

        if (hasChanges) {
          console.log('User data updated from backend:', updatedUser);
          
          // Update localStorage
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          // Update state
          setUser(updatedUser);

          // If user was deactivated, log them out
          if (!updatedUser.is_active) {
            console.warn('User account has been deactivated');
            clearAuth();
            alert('Your account has been deactivated. Please contact an administrator.');
          }
          // If role changed, notify user
          else if (user.role !== updatedUser.role) {
            console.log(`Role changed from ${user.role} to ${updatedUser.role}`);
            alert(`Your role has been updated to: ${updatedUser.role}. The page will reload.`);
            window.location.reload(); // Reload to reflect new permissions
          }
        }
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
      // If 401, token is invalid - logout
      if (error.response?.status === 401) {
        clearAuth();
      }
    }
  }, [isAuthenticated, user, clearAuth]);

  // ========================================================================
  // AUTO-REFRESH USER DATA - Poll backend periodically for updates
  // ========================================================================
  useEffect(() => {
    if (!isAuthenticated) return;

    // Refresh user data every 30 seconds
    const interval = setInterval(() => {
      refreshUserData();
    }, 30000); // 30 seconds

    // Initial refresh after 5 seconds
    const timeout = setTimeout(() => {
      refreshUserData();
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isAuthenticated, refreshUserData]);

  // ========================================================================
  // MEMOIZED CONTEXT VALUE - prevents unnecessary re-renders
  // ========================================================================
  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated,
    loginUser,
    registerUser,
    logoutUser,
    refreshUserData, // Expose refresh function for manual calls
  }), [user, loading, isAuthenticated, loginUser, registerUser, logoutUser, refreshUserData]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
