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

const result = await db.query(`
  SELECT 
    id, 
    type, 
    amount, 
    transaction_date, 
    EXTRACT(YEAR FROM transaction_date) as year,
    EXTRACT(MONTH FROM transaction_date) as month
  FROM transactions 
  ORDER BY transaction_date DESC
`);

console.log('All Transactions:');
result.rows.forEach(t => {
  console.log(`  ID: ${t.id}, Type: ${t.type}, Amount: ${t.amount}, Date: ${t.transaction_date}, Year: ${t.year}, Month: ${t.month}`);
});

console.log('\nTransactions by year:');
const byYear = {};
result.rows.forEach(t => {
  if (!byYear[t.year]) byYear[t.year] = [];
  byYear[t.year].push(t);
});

Object.keys(byYear).sort().reverse().forEach(year => {
  console.log(`  ${year}: ${byYear[year].length} transactions`);
});

db.end();
