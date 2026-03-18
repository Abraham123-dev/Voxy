import { config } from 'dotenv';
import pg from 'pg';
const { Pool } = pg;

config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function addColumns() {
  console.log('Adding cleared_at columns...');
  try {
    await pool.query('ALTER TABLE conversations ADD COLUMN IF NOT EXISTS customer_cleared_at TIMESTAMP WITH TIME ZONE DEFAULT NULL');
    await pool.query('ALTER TABLE conversations ADD COLUMN IF NOT EXISTS business_cleared_at TIMESTAMP WITH TIME ZONE DEFAULT NULL');
    console.log('Columns added successfully.');
  } catch (err) {
    console.error('Error adding columns:', err);
  } finally {
    pool.end();
  }
}

addColumns();
