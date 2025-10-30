// db.js
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// ส่งออกฟังก์ชัน query เพื่อให้ไฟล์อื่นเรียกใช้
export const query = (text, params) => pool.query(text, params);