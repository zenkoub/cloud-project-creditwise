// server.js
import express from "express";
import path from "path";
// ... (other imports)
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cors from "cors";

// ===== Import DB Pool =====
import pool from './db.js'; // <-- IMPORT THE POOL

// ===== Import Routers =====
import authRoutes from "./routes/auth.js";
import usersRoutes from "./routes/users.js";
import adminRoutes from "./routes/admin.js";

// ===== Setup Environment =====
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

// ===== Database Connection (USE THE IMPORTED POOL) =====
// (The old "new Pool" code is removed)
pool.connect((err, client, release) => {
  if (err) {
    return console.error("❌ Error connecting to PostgreSQL:", err.stack);
  }
  client.query("SELECT NOW()", (err, res) => {
    release();
    if (err) console.error("❌ Error executing initial query:", err.stack);
    else console.log("✅ PostgreSQL connected:", res.rows[0].now);
  });
});

// ===== Middleware =====
// ... (rest of your server.js file is perfect)
app.use(express.json());
app.use(cors());

// ===== API Routes (must come before static files) =====
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/admin", adminRoutes);

// ... (rest of your static file and fallback code)
app.use(express.static(path.join(__dirname, "public")));
app.use((req, res, next) => {
  // ... (your existing fallback logic)
  if (req.path.startsWith("/api")) {
    console.warn("❌ API route not found:", req.path);
    return res.status(404).json({ error: "API route not found" });
  }
  if (req.method !== 'GET') return next();
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ===== Start Server =====
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
server.keepAliveTimeout = 61 * 1000;
server.headersTimeout = 62 * 1000;
