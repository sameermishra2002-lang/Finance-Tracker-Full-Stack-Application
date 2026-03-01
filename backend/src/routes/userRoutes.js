/**
 * User Routes
 * Protected routes for user management
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get all users
 *     description: Get a list of all users (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user by ID
 *     description: Get a specific user's profile (Admin or the user themselves)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: User not found
 *   put:
 *     tags:
 *       - Users
 *     summary: Update user role
 *     description: Update a user's role (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, user, read-only]
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 *   delete:
 *     tags:
 *       - Users
 *     summary: Delete user
 *     description: Delete a user account (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 */

import express from 'express';
import * as userController from '../controllers/userController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole, requireOwnerOrAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get(
  '/',
  authenticate,
  requireRole(['admin']),
  userController.getAllUsers
);

router.get(
  '/:id',
  authenticate,
  requireOwnerOrAdmin(),
  userController.getUserById
);

router.put(
  '/:id/role',
  authenticate,
  requireRole(['admin']),
  userController.updateUserRole
);

router.delete(
  '/:id',
  authenticate,
  requireRole(['admin']),
  userController.deleteUser
);

export default router;
