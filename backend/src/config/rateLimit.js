/**
 * Rate Limiting Configuration
 * Defines rate limiting rules for different API endpoints
 */

import rateLimit from 'express-rate-limit';

/**
 * Auth Rate Limiter
 * Limited to 5 requests per 15 minutes for brute force protection
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 *1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts',
    message: 'Please try again after 15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipFailedRequests: false, // Count failed requests
  skip: (req) => {
    // Skip rate limiting for GET /api/auth/me (no limit for authenticated users)
    return req.method === 'GET' && req.path === '/me';
  }
});

/**
 * Transaction Rate Limiter
 * Limited to 100 requests per hour for general transaction operations
 */
export const transactionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // Limit each IP to 100 requests per hour
  message: {
    error: 'Too many requests',
    message: 'You have exceeded the rate limit. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: false
});

/**
 * Analytics Rate Limiter
 * Limited to 50 requests per hour for analytics endpoints
 * (These are more resource-intensive)
 */
export const analyticsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Limit each IP to 50 requests per hour
  message: {
    error: 'Too many requests',
    message: 'Analytics endpoints have a lower rate limit. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: false
});

/**
 * Strict Rate Limiter for User Management
 * Limited to 10 requests per hour for admin operations
 */
export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 requests per hour
  message: {
    error: 'Too many requests',
    message: 'Admin operations are rate limited. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: true // Only count successful requests for admin ops
});

/**
 * Global Rate Limiter
 * Applied to all routes as a fallback (100 requests per 15 minutes)
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Don't rate limit API docs
    return req.path.includes('/api/docs');
  }
});
