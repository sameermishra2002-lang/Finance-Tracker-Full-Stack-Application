import dotenv from 'dotenv';
import pkg from 'pg';

dotenv.config();

const { Pool } = pkg;
const db = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
});

// Test the function
import { getMonthlyTrend } from './src/models/Transaction.js';

const userId = 1; // sameer user (has transactions)
const year = 2026;

console.log('Testing getMonthlyTrend for User 1 (has transactions)...\n');

try {
  const trendResult = await getMonthlyTrend(userId, year);
  console.log('Result:', JSON.stringify(trendResult, null, 2));
  console.log('\nArray length:', trendResult.length);
  console.log('Has data:', trendResult.length > 0);
} catch (error) {
  console.error('Error:', error.message);
}

db.end();
