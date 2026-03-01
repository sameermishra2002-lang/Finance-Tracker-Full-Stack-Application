/**
 * Transaction Routes
 * Defines API endpoints for transaction operations
 */

/**
 * @swagger
 * /api/transactions/summary:
 *   get:
 *     tags:
 *       - Transactions
 *     summary: Get transaction summary
 *     description: Get total income, expenses, and balance for the user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: startDate
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - name: endDate
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Transaction summary
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/transactions/analytics/category-breakdown:
 *   get:
 *     tags:
 *       - Transactions
 *     summary: Get category-wise expense breakdown
 *     description: Get expenses grouped by category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: startDate
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *       - name: endDate
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Category breakdown data
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/transactions/analytics/monthly-trend:
 *   get:
 *     tags:
 *       - Transactions
 *     summary: Get monthly income vs expense trend
 *     description: Get monthly income and expense data for charting
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: year
 *         in: query
 *         schema:
 *           type: integer
 *         description: Year for which to fetch data
 *     responses:
 *       200:
 *         description: Monthly trend data
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     tags:
 *       - Transactions
 *     summary: Get all transactions
 *     description: Get all transactions for the authenticated user with filtering and pagination
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: type
 *         in: query
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *       - name: category
 *         in: query
 *         schema:
 *           type: string
 *       - name: startDate
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *       - name: endDate
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 20
 *       - name: offset
 *         in: query
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: List of transactions
 *       401:
 *         description: Unauthorized
 *   post:
 *     tags:
 *       - Transactions
 *     summary: Create a new transaction
 *     description: Create a new income or expense transaction (Admin and User only, not read-only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - category
 *               - amount
 *               - description
 *               - transaction_date
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *               category:
 *                 type: string
 *                 enum: [Salary, Freelance, Investment, Gift, Other, Food, Transport, Entertainment, Shopping, Bills, Healthcare, Education]
 *               amount:
 *                 type: number
 *                 format: decimal
 *                 minimum: 0.01
 *               description:
 *                 type: string
 *               transaction_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Read-only users cannot create transactions
 */

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     tags:
 *       - Transactions
 *     summary: Get a single transaction
 *     description: Get details of a specific transaction (user can only access their own)
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
 *         description: Transaction details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Transaction not found
 *   put:
 *     tags:
 *       - Transactions
 *     summary: Update a transaction
 *     description: Update an existing transaction (Admin and User only, not read-only)
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
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *               category:
 *                 type: string
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *               transaction_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Transaction updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied or read-only user
 *       404:
 *         description: Transaction not found
 *   delete:
 *     tags:
 *       - Transactions
 *     summary: Delete a transaction
 *     description: Delete a transaction (Admin and User only, not read-only)
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
 *         description: Transaction deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied or read-only user
 *       404:
 *         description: Transaction not found
 */

import express from 'express';
import * as transactionController from '../controllers/transactionController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { blockReadOnly } from '../middleware/roleMiddleware.js';
import { transactionLimiter, analyticsLimiter } from '../config/rateLimit.js';

const router = express.Router();

// All transaction routes require authentication
router.use(authenticate);
// Apply transaction rate limiter to all transaction routes
router.use(transactionLimiter);

// ============================================================================
// Analytics Routes (must come before /:id to avoid conflicts)
// ============================================================================

router.get('/summary', analyticsLimiter, transactionController.getTransactionSummary);

router.get('/analytics/category-breakdown', analyticsLimiter, transactionController.getCategoryBreakdown);

router.get('/analytics/monthly-trend', analyticsLimiter, transactionController.getMonthlyTrend);

router.get('/analytics/yearly-overview', analyticsLimiter, transactionController.getYearlyOverview);

// ============================================================================
// CRUD Routes
// ============================================================================

router.get('/', transactionController.getTransactions);

router.post('/', blockReadOnly, transactionController.createTransaction);

router.get('/:id', transactionController.getTransactionById);

router.put('/:id', blockReadOnly, transactionController.updateTransaction);

router.delete('/:id', blockReadOnly, transactionController.deleteTransaction);

export default router;


