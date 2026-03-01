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

// Import the Transaction model
import { getMonthlyTrend } from './src/models/Transaction.js';

const userId = 1; // admin user
const year = 2026;

console.log('Testing getMonthlyTrend function...\n');

try {
  const trend = await getMonthlyTrend(userId, year);
  console.log('Result from getMonthlyTrend:');
  console.log(JSON.stringify(trend, null, 2));
} catch (error) {
  console.error('Error:', error);
}

db.end();
