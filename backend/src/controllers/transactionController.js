/**
 * Transaction Controller
 * Handles transaction CRUD operations and analytics
 */

import * as Transaction from '../models/Transaction.js';
import { getCache, setCache, clearCache } from '../utils/cache.js';

/**
 * Create a new transaction
 * POST /api/transactions
 */
export const createTransaction = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { type, category, amount, description, transaction_date } = req.body;
    
    // Validate input
    if (!type || !category || !amount || !description || !transaction_date) {
      return res.status(400).json({ 
        error: 'Validation error',
        message: 'All fields are required' 
      });
    }
    
    if (amount <= 0) {
      return res.status(400).json({ 
        error: 'Validation error',
        message: 'Amount must be greater than 0' 
      });
    }
    
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ 
        error: 'Validation error',
        message: 'Type must be either income or expense' 
      });
    }
    
    const newTransaction = await Transaction.createTransaction(userId, {
      type,
      category,
      amount,
      description,
      transaction_date
    });
    
      await clearCache(`summary:${userId}`);
      await clearCache(`category:${userId}`);
      await clearCache(`monthlyTrend:${userId}`);
      await clearCache(`yearlyOverview:${userId}`);

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction: newTransaction
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all transactions for logged-in user
 * GET /api/transactions
 */
export const getTransactions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const filters = {
      type: req.query.type,
      category: req.query.category,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      search: req.query.search,
      limit: req.query.limit ? parseInt(req.query.limit) : null,
      offset: req.query.offset ? parseInt(req.query.offset) : null
    };
    
    const transactions = await Transaction.getUserTransactions(userId, filters);
    
    res.json({
      transactions,
      count: transactions.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single transaction by ID
 * GET /api/transactions/:id
 */
export const getTransactionById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const transactionId = parseInt(req.params.id);
    
    const transaction = await Transaction.getTransactionById(transactionId, userId);
    
    if (!transaction) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Transaction not found' 
      });
    }
    
    res.json({ transaction });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a transaction
 * PUT /api/transactions/:id
 */
export const updateTransaction = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const transactionId = parseInt(req.params.id);
    const { type, category, amount, description, transaction_date } = req.body;
    
    // Validate input
    if (!type || !category || !amount || !description || !transaction_date) {
      return res.status(400).json({ 
        error: 'Validation error',
        message: 'All fields are required' 
      });
    }
    
    if (amount <= 0) {
      return res.status(400).json({ 
        error: 'Validation error',
        message: 'Amount must be greater than 0' 
      });
    }
    
    const updatedTransaction = await Transaction.updateTransaction(
      transactionId,
      userId,
      { type, category, amount, description, transaction_date }
    );

               await clearCache(`summary:${userId}`);
              await clearCache(`category:${userId}`);
              await clearCache(`monthlyTrend:${userId}`);
              await clearCache(`yearlyOverview:${userId}`);
    
    if (!updatedTransaction) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Transaction not found' 
      });
    }
    
    res.json({
      message: 'Transaction updated successfully',
      transaction: updatedTransaction
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a transaction
 * DELETE /api/transactions/:id
 */
export const deleteTransaction = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const transactionId = parseInt(req.params.id);
    
    const deletedTransaction = await Transaction.deleteTransaction(transactionId, userId);

     await clearCache(`summary:${userId}`);
     await clearCache(`category:${userId}`);
     await clearCache(`monthlyTrend:${userId}`);
     await clearCache(`yearlyOverview:${userId}`);
    
    if (!deletedTransaction) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Transaction not found' 
      });
    }
    
    res.json({
      message: 'Transaction deleted successfully',
      transaction: deletedTransaction
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get transaction summary (total income, expense, balance)
 * GET /api/transactions/summary
 */
export const getTransactionSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const startDate = req.query.startDate || null;
    const endDate = req.query.endDate || null;
    
     const cacheKey = `summary:${userId}`;
     const cached = await getCache(cacheKey);

    if (cached) {
      return res.json({ summary: cached });
    }

    const summary = await Transaction.getTransactionSummary(userId, startDate, endDate);
    await setCache(cacheKey, summary, 900); // 15 minutes

    
    res.json({ summary });
  } catch (error) {
    next(error);
  }
};

/**
 * Get category-wise expense breakdown
 * GET /api/transactions/analytics/category-breakdown
 */
export const getCategoryBreakdown = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const startDate = req.query.startDate || null;
    const endDate = req.query.endDate || null;

    const cacheKey = `category:${userId}:${startDate}:${endDate}`;
    const cached = await getCache(cacheKey);

    if (cached) {
      return res.json({ breakdown: cached });
    }

    const breakdown = await Transaction.getCategoryBreakdown(userId, startDate, endDate);
    await setCache(cacheKey, breakdown, 900); // 15 minutes
    
    res.json({ breakdown });
  } catch (error) {
    next(error);
  }
};

/**
 * Get monthly trend data
 * GET /api/transactions/analytics/monthly-trend
 */
export const getMonthlyTrend = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();
    
    const cacheKey = `monthlyTrend:${userId}:${year}`;
    const cached = await getCache(cacheKey);

  if (cached) {
  return res.json({ trend: cached });
  }

    const trend = await Transaction.getMonthlyTrend(userId, year);
    await setCache(cacheKey, trend, 900); // 15 minutes
    
    res.json({ trend });
  } catch (error) {
    next(error);
  }
};

/**
 * Get yearly spending overview
 * GET /api/transactions/analytics/yearly-overview
 */
export const getYearlyOverview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const cacheKey = `yearlyOverview:${userId}`;
    const cached = await getCache(cacheKey);

    if (cached) {
      return res.json({ overview: cached });
    }

    const overview = await Transaction.getYearlyOverview(userId);
    await setCache(cacheKey, overview, 900); // 15 minutes
    
    res.json({ overview });
  } catch (error) {
    next(error);
  }
};
