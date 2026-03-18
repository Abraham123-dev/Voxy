import { config } from 'dotenv';
import pg from 'pg';
const { Pool } = pg;

config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function migrate() {
  console.log('Migrating database...');
  try {
    // Add use_ai_reply to businesses
    await pool.query('ALTER TABLE businesses ADD COLUMN IF NOT EXISTS use_ai_reply BOOLEAN DEFAULT TRUE');
    
    // Add cleared_at to conversations (redundant but safe)
    await pool.query('ALTER TABLE conversations ADD COLUMN IF NOT EXISTS customer_cleared_at TIMESTAMP WITH TIME ZONE DEFAULT NULL');
    await pool.query('ALTER TABLE conversations ADD COLUMN IF NOT EXISTS business_cleared_at TIMESTAMP WITH TIME ZONE DEFAULT NULL');
    
    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    pool.end();
  }
}

migrate();
