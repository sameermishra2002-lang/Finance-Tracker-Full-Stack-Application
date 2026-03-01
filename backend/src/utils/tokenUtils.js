/**
 * Token Utilities
 * JWT token generation, verification, and blacklist management
 */

import jwt from 'jsonwebtoken';
import jwtConfig from '../config/jwt.js';

// ============================================================================
// TOKEN BLACKLIST (In-Memory)
// ============================================================================
// In production, replace with Redis for distributed systems
const tokenBlacklist = new Set();

/**
 * Add token to blacklist (for one-time use refresh tokens)
 * @param {string} token - JWT token string
 */
export const blacklistToken = (token) => {
  tokenBlacklist.add(token);
};

/**
 * Check if token is blacklisted
 * @param {string} token - JWT token string
 * @returns {boolean} True if blacklisted
 */
export const isTokenBlacklisted = (token) => {
  return tokenBlacklist.has(token);
};

/**
 * Clear token blacklist (use with caution)
 */
export const clearBlacklist = () => {
  tokenBlacklist.clear();
};

// ============================================================================
// TOKEN GENERATION
// ============================================================================

/**
 * Generate access token (short-lived)
 * @param {Object} payload - User data (userId, username, role)
 * @returns {string} JWT access token
 */
export const generateAccessToken = (payload) => {
  const { userId, username, role } = payload;
  
  return jwt.sign(
    {
      sub: username,
      user_id: userId,
      role: role,
      type: jwtConfig.tokenTypes.ACCESS
    },
    jwtConfig.accessSecret,
    { expiresIn: jwtConfig.accessExpiry }
  );
};

/**
 * Generate refresh token (long-lived)
 * @param {Object} payload - User data (userId, username)
 * @returns {string} JWT refresh token
 */
export const generateRefreshToken = (payload) => {
  const { userId, username } = payload;
  
  return jwt.sign(
    {
      sub: username,
      user_id: userId,
      type: jwtConfig.tokenTypes.REFRESH
    },
    jwtConfig.refreshSecret,
    { expiresIn: jwtConfig.refreshExpiry }
  );
};

/**
 * Generate both access and refresh tokens
 * @param {Object} user - User object from database
 * @returns {Object} { accessToken, refreshToken, expiresIn }
 */
export const generateTokens = (user) => {
  const payload = {
    userId: user.id,
    username: user.username,
    role: user.role
  };
  
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  
  return {
    accessToken,
    refreshToken,
    expiresIn: jwtConfig.getExpirySeconds(jwtConfig.accessExpiry)
  };
};

// ============================================================================
// TOKEN VERIFICATION
// ============================================================================

/**
 * Verify access token
 * @param {string} token - JWT token string
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
export const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, jwtConfig.accessSecret);
    
    // Check token type
    if (decoded.type !== jwtConfig.tokenTypes.ACCESS) {
      throw new Error('Invalid token type');
    }
    
    return decoded;
  } catch (error) {
    throw new Error(`Invalid access token: ${error.message}`);
  }
};

/**
 * Verify refresh token
 * @param {string} token - JWT token string
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid, expired, or blacklisted
 */
export const verifyRefreshToken = (token) => {
  try {
    // Check if token is blacklisted
    if (isTokenBlacklisted(token)) {
      throw new Error('Token has been revoked');
    }
    
    const decoded = jwt.verify(token, jwtConfig.refreshSecret);
    
    // Check token type
    if (decoded.type !== jwtConfig.tokenTypes.REFRESH) {
      throw new Error('Invalid token type');
    }
    
    return decoded;
  } catch (error) {
    throw new Error(`Invalid refresh token: ${error.message}`);
  }
};

/**
 * Decode token without verification (for debugging)
 * @param {string} token - JWT token string
 * @returns {Object} Decoded token payload
 */
export const decodeToken = (token) => {
  return jwt.decode(token);
};

export default {
  // Blacklist
  blacklistToken,
  isTokenBlacklisted,
  clearBlacklist,
  
  // Generation
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  
  // Verification
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken
};
