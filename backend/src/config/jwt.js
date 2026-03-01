/**
 * JWT Configuration
 * Token settings and constants
 */

import dotenv from 'dotenv';

dotenv.config();

export const jwtConfig = {
  // Secrets
  accessSecret: process.env.JWT_SECRET,
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  
  // Expiration times
  accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',  // 15 minutes
  refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d', // 7 days
  
  // Token types
  tokenTypes: {
    ACCESS: 'access',
    REFRESH: 'refresh'
  },
  
  // Convert expiry to seconds (for response)
  getExpirySeconds: (expiry) => {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 900; // default 15 minutes
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    const multipliers = {
      's': 1,
      'm': 60,
      'h': 3600,
      'd': 86400
    };
    
    return value * multipliers[unit];
  }
};

// Validate JWT secrets exist
if (!jwtConfig.accessSecret || !jwtConfig.refreshSecret) {
  throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be set in environment variables');
}

export default jwtConfig;
