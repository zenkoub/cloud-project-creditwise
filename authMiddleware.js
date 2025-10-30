// authMiddleware.js
import jwt from 'jsonwebtoken';

// ตรวจสอบ Token และเก็บ user info ไว้ใน req.user
export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }

    req.user = user; // { id, username, role }
    next();
  });
};

// ตรวจสอบสิทธิ์ Admin
export const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Admin access required.' });
  }
};