require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkCols() {
  try {
    const res = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'conversations';
    `);
    console.log("Columns:", res.rows.map(r => r.column_name));
    
    // Also check users table structure
    const usersRes = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users';
    `);
    console.log("User Columns:", usersRes.rows.map(r => r.column_name));
  } catch (err) {
    console.error("Test Error:", err);
  } finally {
    pool.end();
  }
}

checkCols();
