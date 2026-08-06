const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres',
});

async function init() {
  console.log('Connecting to PostgreSQL database...');
  const client = await pool.connect();
  try {
    const sql = fs.readFileSync(path.join(__dirname, '../init.sql'), 'utf-8');
    await client.query(sql);
    console.log('✅ Database schema and seed data initialized successfully!');
  } catch (err) {
    console.error('❌ DB Init Error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

init();
