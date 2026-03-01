/**
 * Transaction Model
 * Handles database operations for transactions
 */

import db from '../config/database.js';

/**
 * Create a new transaction
 */
export const createTransaction = async (userId, transactionData) => {
  const { type, category, amount, description, transaction_date } = transactionData;
  
  const query = `
    INSERT INTO transactions (user_id, type, category, amount, description, transaction_date)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  
  const values = [userId, type, category, amount, description, transaction_date];
  const result = await db.query(query, values);
  return result.rows[0];
};

/**
 * Get all transactions for a user with optional filters
 */
export const getUserTransactions = async (userId, filters = {}) => {
  let query = `
    SELECT * FROM transactions 
    WHERE user_id = $1
  `;
  
  const values = [userId];
  let paramIndex = 2;
  
  // Filter by type (income/expense)
  if (filters.type && filters.type !== 'all') {
    query += ` AND type = $${paramIndex}`;
    values.push(filters.type);
    paramIndex++;
  }
  
  // Filter by category
  if (filters.category) {
    query += ` AND category = $${paramIndex}`;
    values.push(filters.category);
    paramIndex++;
  }
  
  // Filter by date range
  if (filters.startDate) {
    query += ` AND transaction_date >= $${paramIndex}`;
    values.push(filters.startDate);
    paramIndex++;
  }
  
  if (filters.endDate) {
    query += ` AND transaction_date <= $${paramIndex}`;
    values.push(filters.endDate);
    paramIndex++;
  }
  
  // Search in description
  if (filters.search) {
    query += ` AND (description ILIKE $${paramIndex} OR category::text ILIKE $${paramIndex})`;
    values.push(`%${filters.search}%`);
    paramIndex++;
  }
  
  query += ` ORDER BY transaction_date DESC, created_at DESC`;
  
  // Pagination
  if (filters.limit) {
    query += ` LIMIT $${paramIndex}`;
    values.push(filters.limit);
    paramIndex++;
  }
  
  if (filters.offset) {
    query += ` OFFSET $${paramIndex}`;
    values.push(filters.offset);
  }
  
  const result = await db.query(query, values);
  return result.rows;
};

/**
 * Get a single transaction by ID
 */
export const getTransactionById = async (transactionId, userId) => {
  const query = `
    SELECT * FROM transactions 
    WHERE id = $1 AND user_id = $2
  `;
  
  const result = await db.query(query, [transactionId, userId]);
  return result.rows[0];
};

/**
 * Update a transaction
 */
export const updateTransaction = async (transactionId, userId, updateData) => {
  const { type, category, amount, description, transaction_date } = updateData;
  
  const query = `
    UPDATE transactions 
    SET type = $1, category = $2, amount = $3, description = $4, transaction_date = $5
    WHERE id = $6 AND user_id = $7
    RETURNING *
  `;
  
  const values = [type, category, amount, description, transaction_date, transactionId, userId];
  const result = await db.query(query, values);
  return result.rows[0];
};

/**
 * Delete a transaction
 */
export const deleteTransaction = async (transactionId, userId) => {
  const query = `
    DELETE FROM transactions 
    WHERE id = $1 AND user_id = $2
    RETURNING *
  `;
  
  const result = await db.query(query, [transactionId, userId]);
  return result.rows[0];
};

/**
 * Get transaction summary for a user
 */
export const getTransactionSummary = async (userId, startDate = null, endDate = null) => {
  let query = `
    SELECT 
      type,
      SUM(amount) as total
    FROM transactions 
    WHERE user_id = $1
  `;
  
  const values = [userId];
  let paramIndex = 2;
  
  if (startDate) {
    query += ` AND transaction_date >= $${paramIndex}`;
    values.push(startDate);
    paramIndex++;
  }
  
  if (endDate) {
    query += ` AND transaction_date <= $${paramIndex}`;
    values.push(endDate);
  }
  
  query += ` GROUP BY type`;
  
  const result = await db.query(query, values);
  
  const summary = {
    totalIncome: 0,
    totalExpense: 0,
    balance: 0
  };
  
  result.rows.forEach(row => {
    if (row.type === 'income') {
      summary.totalIncome = parseFloat(row.total);
    } else if (row.type === 'expense') {
      summary.totalExpense = parseFloat(row.total);
    }
  });
  
  summary.balance = summary.totalIncome - summary.totalExpense;
  
  return summary;
};

/**
 * Get category-wise breakdown for expenses
 */
export const getCategoryBreakdown = async (userId, startDate = null, endDate = null) => {
  let query = `
    SELECT 
      category,
      SUM(amount) as total,
      COUNT(*) as count
    FROM transactions 
    WHERE user_id = $1 AND type = 'expense'
  `;
  
  const values = [userId];
  let paramIndex = 2;
  
  if (startDate) {
    query += ` AND transaction_date >= $${paramIndex}`;
    values.push(startDate);
    paramIndex++;
  }
  
  if (endDate) {
    query += ` AND transaction_date <= $${paramIndex}`;
    values.push(endDate);
  }
  
  query += ` GROUP BY category ORDER BY total DESC`;
  
  const result = await db.query(query, values);
  return result.rows.map(row => ({
    category: row.category,
    total: parseFloat(row.total),
    count: parseInt(row.count)
  }));
};

/**
 * Get monthly trend data
 */
export const getMonthlyTrend = async (userId, year) => {
  const query = `
    SELECT 
      EXTRACT(MONTH FROM transaction_date) as month,
      type,
      SUM(amount) as total
    FROM transactions 
    WHERE user_id = $1 
    AND EXTRACT(YEAR FROM transaction_date) = $2
    GROUP BY month, type
    ORDER BY month
  `;
  
  const result = await db.query(query, [userId, year]);
  return result.rows.map(row => ({
    month: parseInt(row.month),
    type: row.type,
    total: parseFloat(row.total)
  }));
};
