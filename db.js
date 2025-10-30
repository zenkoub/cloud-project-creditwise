// db.js
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Create ONE pool with the SSL fix
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: { // <-- THE MISSING FIX
    rejectUnauthorized: false 
  }
});

// Export the pool itself for server.js to use
export default pool;

// Export the query function for your routes
export const query = (text, params) => pool.query(text, params);