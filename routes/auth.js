// routes/auth.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body; // <--- password คือ plain-text ที่ผู้ใช้ป้อน

  try {
    const result = await query('SELECT id, username, password_hash, name, role FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = result.rows[0]; // <--- user.password_hash คือ hash ที่ดึงมาจาก DB

    // 1. เปรียบเทียบรหัสผ่านที่แฮชไว้
    // เปลี่ยน: inputPassword, password_hash
    // เป็น: password, user.password_hash
    const isMatch = await bcrypt.compare(password, user.password_hash); 
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // 2. สร้าง Token (JWT)
    const payload = { id: user.id, username: user.username, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    // 3. ส่ง Token และข้อมูล user กลับไป
    res.json({
      token,
      user: { id: user.id, username: user.username, name: user.name, role: user.role }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// POST /api/auth/register (สำหรับการสร้าง user ใหม่)
router.post('/register', async (req, res) => {
    const { username, password, name, role = 'student', track_id, study_plan } = req.body;
  
    try {
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);
  
      const newUser = await query(
        'INSERT INTO users (username, password_hash, name, role, track_id, study_plan) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, name, role',
        [username, password_hash, name, role, track_id, study_plan]
      );
  
      res.status(201).json(newUser.rows[0]);
    } catch (err) {
      console.error('Register error:', err);
      if (err.code === '23505') { // PostgreSQL error code for unique violation
        return res.status(400).json({ error: 'Username already exists' });
      }
      res.status(500).json({ error: 'Could not create user' });
    }
});


export default router;