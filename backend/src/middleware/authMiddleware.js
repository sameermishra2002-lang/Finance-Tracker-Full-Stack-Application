/**
 * Authentication Middleware
 * Verifies JWT tokens and attaches user info to request
 */

import { verifyAccessToken } from '../utils/tokenUtils.js';

/**
 * Verify JWT token and attach user to request
 * Usage: router.get('/protected', authenticate, controller)
 */
export const authenticate = (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        error: 'No token provided',
        message: 'Authorization header is missing' 
      });
    }
    
    // Check Bearer format
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ 
        error: 'Invalid token format',
        message: 'Expected format: Bearer <token>' 
      });
    }
    
    const token = parts[1];
    
    // Verify token
    const decoded = verifyAccessToken(token);
    
    // Attach user info to request
    req.user = {
      id: decoded.user_id,
      username: decoded.sub,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ 
      error: 'Invalid token',
      message: error.message 
    });
  }
};

/**
 * Optional authentication - attach user if token exists
 * Usage: router.get('/public', optionalAuth, controller)
 */
export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      req.user = null;
      return next();
    }
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      req.user = null;
      return next();
    }
    
    const token = parts[1];
    const decoded = verifyAccessToken(token);
    
    req.user = {
      id: decoded.user_id,
      username: decoded.sub,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

export default { authenticate, optionalAuth };
