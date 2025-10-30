// server.js (แก้ไขเพื่อใช้ Router และ API ก่อน Static Files)

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { Pool } from "pg";
import cors from "cors";

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

// ===== Database Connection =====
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
    if (err) console.error("❌ Error executing initial query:", err.stack);
    else console.log("✅ PostgreSQL connected:", res.rows[0].now);
  });
});

// ===== Middleware =====
app.use(express.json());
app.use(cors());

// ===== API Routes (must come before static files) =====
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/admin", adminRoutes);

// ===== Static File Serving =====
app.use(express.static(path.join(__dirname, "public")));

// ===== Fallback =====
// Use a middleware handler instead of a route pattern string to avoid
// path-to-regexp parsing errors (some versions of express + path-to-regexp
// will throw on patterns like "*"). Only respond to GET requests here.
app.use((req, res, next) => {
  // If this looks like an API request, return a 404 JSON response
  if (req.path.startsWith("/api")) {
    console.warn("❌ API route not found:", req.path);
    return res.status(404).json({ error: "API route not found" });
  }

  // Short-circuit missing favicon requests so they don't fall back to index.html
  if (req.path === '/favicon.ico') {
    // If you prefer serving a real favicon, place one at public/favicon.ico.
    return res.status(204).end();
  }

  // Short-circuit common well-known probes (e.g. Chrome DevTools local probe)
  // These are not app routes; return 204 No Content so they don't fall back
  // to index.html and clutter logs. If you need any specific .well-known files
  // (e.g. for verification), place them under public/.well-known/ so
  // express.static will serve them.
  if (req.path.startsWith('/.well-known')) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('⚠️ Ignoring .well-known probe:', req.url);
    }
    return res.status(204).end();
  }

  // Only serve index.html for GET requests (leave other methods to next handlers)
  if (req.method !== 'GET') return next();

  if (process.env.NODE_ENV !== 'production') {
    console.log("⚠️ Fallback to index.html for path:", req.url);
  }

  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ----------------------------------------------------
// 5. Start Server
// ----------------------------------------------------
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
// timeout settings to prevent 503 bad gateway error
server.keepAliveTimeout = 61000;
server.headersTimeout = 62000;
