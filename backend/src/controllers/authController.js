/**
 * Authentication Controller
 * Handles user registration, login, and token refresh
 */

import * as User from '../models/User.js';
import { generateTokens, verifyRefreshToken, blacklistToken } from '../utils/tokenUtils.js';

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    
    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: 'Validation error',
        message: 'Username, email, and password are required' 
      });
    }
    
    if (password.length < 8) {
      return res.status(400).json({ 
        error: 'Validation error',
        message: 'Password must be at least 8 characters long' 
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(409).json({ 
        error: 'Conflict',
        message: 'Username already exists' 
      });
    }
    
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.status(409).json({ 
        error: 'Conflict',
        message: 'Email already exists' 
      });
    }
    
    // Create user (default role: 'user')
    const newUser = await User.createUser({ username, email, password });
    
    // Generate tokens
    const tokens = generateTokens(newUser);
    
    // Update last login
    await User.updateLastLogin(newUser.id);
    
    res.status(201).json({
      message: 'User registered successfully',
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      token_type: 'bearer',
      expires_in: tokens.expiresIn,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        is_active: newUser.is_active,
        created_at: newUser.created_at
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * User login
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Validation error',
        message: 'Username and password are required' 
      });
    }
    
    // Find user (username or email)
    let user = await User.findByUsername(username);
    if (!user) {
      user = await User.findByEmail(username);
    }
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'User not found. Please sign up to create an account.' 
      });
    }
    
    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({ 
        error: 'Account disabled',
        message: 'Your account has been disabled. Please contact support.' 
      });
    }
    
    // Verify password
    const isValidPassword = await User.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Authentication failed',
        message: 'Invalid username or password' 
      });
    }
    
    // Generate tokens
    const tokens = generateTokens(user);
    
    // Update last login
    await User.updateLastLogin(user.id);
    
    res.json({
      message: 'Login successful',
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      token_type: 'bearer',
      expires_in: tokens.expiresIn,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
        last_login: user.last_login
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export const refresh = async (req, res, next) => {
  try {
    const { refresh_token } = req.body;
    
    if (!refresh_token) {
      return res.status(400).json({ 
        error: 'Validation error',
        message: 'Refresh token is required' 
      });
    }
    
    // Verify refresh token (also checks blacklist)
    const decoded = verifyRefreshToken(refresh_token);
    
    // Get user from database
    const user = await User.findById(decoded.user_id);
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'User not found' 
      });
    }
    
    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({ 
        error: 'Account disabled',
        message: 'Your account has been disabled' 
      });
    }
    
    // Blacklist old refresh token (one-time use)
    blacklistToken(refresh_token);
    
    // Generate new tokens
    const tokens = generateTokens(user);
    
    res.json({
      message: 'Token refreshed successfully',
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      token_type: 'bearer',
      expires_in: tokens.expiresIn
    });
  } catch (error) {
    return res.status(401).json({ 
      error: 'Invalid refresh token',
      message: error.message 
    });
  }
};

/**
 * Logout (blacklist refresh token)
 * POST /api/auth/logout
 */
export const logout = async (req, res, next) => {
  try {
    const { refresh_token } = req.body;
    
    if (refresh_token) {
      blacklistToken(refresh_token);
    }
    
    res.json({ 
      message: 'Logout successful' 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user info (requires authentication)
 * GET /api/auth/me
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'User not found' 
      });
    }
    
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
      is_verified: user.is_verified,
      created_at: user.created_at,
      last_login: user.last_login
    });
  } catch (error) {
    next(error);
  }
};

export default { register, login, refresh, logout, getCurrentUser };
