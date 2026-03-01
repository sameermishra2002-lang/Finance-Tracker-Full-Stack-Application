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

const result = await db.query('SELECT id, user_id, type, amount FROM transactions ORDER BY id');
console.log('All transactions:');
result.rows.forEach(t => console.log(`  ID:${t.id} UserID:${t.user_id} Type:${t.type} Amount:${t.amount}`));

const users = await db.query('SELECT id, email, username FROM users');
console.log('\nAll users:');
users.rows.forEach(u => console.log(`  ID:${u.id} Email: ${u.email} Username: ${u.username}`));

db.end();
