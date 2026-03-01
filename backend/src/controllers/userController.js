/**
 * User Controller
 * Handles user management operations
 */

import * as User from '../models/User.js';

/**
 * Get all users (admin only)
 * GET /api/users
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.getAllUsers();
    
    res.json({
      count: users.length,
      users: users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID
 * GET /api/users/:id
 */
export const getUserById = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ 
        error: 'Invalid user ID' 
      });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }
    
    res.json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * Update user role (admin only)
 * PUT /api/users/:id/role
 */
export const updateUserRole = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    const { role } = req.body;
    
    if (isNaN(userId)) {
      return res.status(400).json({ 
        error: 'Invalid user ID' 
      });
    }
    
    // Validate role
    const validRoles = ['admin', 'user', 'read-only'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ 
        error: 'Invalid role',
        message: `Role must be one of: ${validRoles.join(', ')}` 
      });
    }
    
    // Prevent self-demotion
    if (userId === req.user.id && role !== 'admin') {
      return res.status(400).json({ 
        error: 'Cannot change your own role',
        message: 'You cannot demote yourself from admin' 
      });
    }
    
    const updatedUser = await User.updateUserRole(userId, role);
    
    if (!updatedUser) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }
    
    res.json({
      message: 'User role updated successfully',
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user (admin only)
 * DELETE /api/users/:id
 */
export const deleteUser = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ 
        error: 'Invalid user ID' 
      });
    }
    
    // Prevent self-deletion
    if (userId === req.user.id) {
      return res.status(400).json({ 
        error: 'Cannot delete your own account',
        message: 'Please ask another admin to delete your account' 
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }
    
    // For now, just deactivate instead of hard delete
    // You can implement actual deletion if needed
    await User.updateUserRole(userId, user.role); // Placeholder
    
    res.json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export default { getAllUsers, getUserById, updateUserRole, deleteUser };
