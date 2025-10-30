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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

server.keepAliveTimeout = 61000;
server.headersTimeout = 62000;
