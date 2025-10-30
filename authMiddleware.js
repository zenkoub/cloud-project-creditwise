// middleware/authMiddleware.js
import jwt from "jsonwebtoken";

// ✅ ตรวจสอบ JWT token
export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = decoded; // ใส่ข้อมูล user (id, username, role)
    next();
  });
};

// ✅ ตรวจสอบว่าเป็น admin หรือไม่
export const adminMiddleware = (req, res, next) => {
  if (req.user?.role === "admin") next();
  else res.status(403).json({ error: "Admin access required" });
};
