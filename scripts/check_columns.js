import { config } from 'dotenv';
import pg from 'pg';
const { Pool } = pg;

config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function checkColumns() {
  console.log('Checking columns in businesses and conversations...');
  try {
    const bRes = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'businesses'");
    console.log('Businesses columns:', bRes.rows.map(r => r.column_name).join(', '));
    
    const cRes = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'conversations'");
    console.log('Conversations columns:', cRes.rows.map(r => r.column_name).join(', '));
  } catch (err) {
    console.error('Error checking columns:', err);
  } finally {
    pool.end();
  }
}

checkColumns();
