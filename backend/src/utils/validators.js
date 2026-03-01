/**
 * Input Validators
 * Reusable validation functions
 */

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate username (3-50 chars, alphanumeric + underscore)
 */
export const isValidUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,50}$/;
  return usernameRegex.test(username);
};

/**
 * Validate password strength
 */
export const isStrongPassword = (password) => {
  return password.length >= 8;
};

/**
 * Validate user role
 */
export const isValidRole = (role) => {
  const validRoles = ['admin', 'user', 'read-only'];
  return validRoles.includes(role);
};

/**
 * Sanitize string input
 */
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str.trim();
};

export default {
  isValidEmail,
  isValidUsername,
  isStrongPassword,
  isValidRole,
  sanitizeString
};
