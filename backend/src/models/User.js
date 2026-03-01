/**
 * User Model
 * Database operations for users table
 */

import { query } from '../config/database.js';
import bcrypt from 'bcrypt';

// User roles enum
export const UserRole = {
  ADMIN: 'admin',
  USER: 'user',
  READ_ONLY: 'read-only'
};

/**
 * Create a new user
 * @param {Object} userData - User data (username, email, password)
 * @returns {Promise<Object>} Created user (without password)
 */
export const createUser = async ({ username, email, password, role = UserRole.USER }) => {
  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);
  
  const sql = `
    INSERT INTO users (username, email, password_hash, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, username, email, role, is_active, is_verified, created_at
  `;
  
  const result = await query(sql, [username, email, passwordHash, role]);
  return result.rows[0];
};

/**
 * Find user by username
 * @param {string} username - Username
 * @returns {Promise<Object|null>} User object or null
 */
export const findByUsername = async (username) => {
  const sql = `
    SELECT id, username, email, password_hash, role, is_active, is_verified, created_at, last_login
    FROM users
    WHERE username = $1
  `;
  
  const result = await query(sql, [username]);
  return result.rows[0] || null;
};

/**
 * Find user by email
 * @param {string} email - Email address
 * @returns {Promise<Object|null>} User object or null
 */
export const findByEmail = async (email) => {
  const sql = `
    SELECT id, username, email, password_hash, role, is_active, is_verified, created_at, last_login
    FROM users
    WHERE email = $1
  `;
  
  const result = await query(sql, [email]);
  return result.rows[0] || null;
};

/**
 * Find user by ID
 * @param {number} id - User ID
 * @returns {Promise<Object|null>} User object or null
 */
export const findById = async (id) => {
  const sql = `
    SELECT id, username, email, role, is_active, is_verified, created_at, last_login
    FROM users
    WHERE id = $1
  `;
  
  const result = await query(sql, [id]);
  return result.rows[0] || null;
};

/**
 * Verify user password
 * @param {string} plainPassword - Plain text password
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} True if password matches
 */
export const verifyPassword = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

/**
 * Update user's last login timestamp
 * @param {number} userId - User ID
 * @returns {Promise<void>}
 */
export const updateLastLogin = async (userId) => {
  const sql = `
    UPDATE users
    SET last_login = NOW()
    WHERE id = $1
  `;
  
  await query(sql, [userId]);
};

/**
 * Get all users (admin only)
 * @returns {Promise<Array>} Array of users (without passwords)
 */
export const getAllUsers = async () => {
  const sql = `
    SELECT id, username, email, role, is_active, is_verified, created_at, last_login
    FROM users
    ORDER BY created_at DESC
  `;
  
  const result = await query(sql);
  return result.rows;
};

/**
 * Update user role (admin only)
 * @param {number} userId - User ID
 * @param {string} role - New role
 * @returns {Promise<Object>} Updated user
 */
export const updateUserRole = async (userId, role) => {
  const sql = `
    UPDATE users
    SET role = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING id, username, email, role, is_active, is_verified, created_at
  `;
  
  const result = await query(sql, [role, userId]);
  return result.rows[0];
};

export default {
  UserRole,
  createUser,
  findByUsername,
  findByEmail,
  findById,
  verifyPassword,
  updateLastLogin,
  getAllUsers,
  updateUserRole
};
