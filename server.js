// server.js (แก้ไขเพื่อใช้ Router และ API ก่อน Static Files)

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { Pool } from "pg";
import cors from "cors";
import usersRoutes from './routes/users.js';
import adminRoutes from './routes/admin.js';
// Note: bcryptjs and jwt are now handled inside the router files

// Import API Routers
// *** สำคัญ: ต้องสร้างไฟล์เหล่านี้ก่อนในโฟลเดอร์ ./routes/ ***
import authRoutes from './routes/auth.js';
// import usersRoutes from './routes/users.js';
// import adminRoutes from './routes/admin.js'; 

// โหลดตัวแปรสภาพแวดล้อมจาก .env
dotenv.config();

// Handle __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ----------------------------------------------------
// 1. Database Connection Setup (Pool)
// ----------------------------------------------------
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE, 
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.connect((err, client, release) => {
    if (err) {
        return console.error("❌ Error connecting to PostgreSQL:", err.stack);
    }
    client.query("SELECT NOW()", (err, res) => {
        release();
        if (err) {
            console.error("❌ Error executing initial query:", err.stack);
        } else {
            console.log("✅ Successfully connected to PostgreSQL at:", res.rows[0].now);
        }
    });
});


// ----------------------------------------------------
// 2. Middleware
// ----------------------------------------------------
app.use(express.json()); // อนุญาตให้ Server รับ JSON Body (สำคัญสำหรับ Login)
app.use(cors()); 


// ----------------------------------------------------
// 3. API Routes (*** ต้องอยู่ก่อน Static Files ***)
// ----------------------------------------------------

// Route สำหรับ Login, Register
app.use('/api/auth', authRoutes); 

// Route สำหรับ Users (เช่น /api/users/me)
app.use('/api/users', usersRoutes);

// Route สำหรับ Admin (เช่น /api/admin/courses)
app.use('/api/admin', adminRoutes); 


// ----------------------------------------------------
// 4. Static File Serving (ย้ายมาอยู่ส่วนท้ายสุด)
// ----------------------------------------------------

// Serve all static files in /public
app.use(express.static(path.join(__dirname, "public")));

// Serve index.html for all routes (SPA fallback)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});


// ----------------------------------------------------
// 5. Start Server
// ----------------------------------------------------
app.listen(PORT, () =>
  console.log(`✅ Server running at http://localhost:${PORT}`)
);