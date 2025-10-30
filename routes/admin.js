// routes/admin.js (ฉบับแก้ไข)

import express from 'express';
import { authMiddleware, adminMiddleware } from '../authMiddleware.js';
import { query } from '../db.js';

const router = express.Router();

// ใช้ middleware ตรวจสอบ token และสิทธิ์ admin ทุก route ในไฟล์นี้
router.use(authMiddleware);
router.use(adminMiddleware);

// GET /api/admin/students (ดึงข้อมูลนักศึกษาทั้งหมด)
router.get('/students', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, username, name, track_id, study_plan, current_year, current_semester
       FROM users WHERE role = 'student' ORDER BY username`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Admin students error:', err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// 🚀 API ใหม่: GET /api/admin/students/:username/history (แก้ไขปัญหา History)
router.get('/students/:username/history', async (req, res) => {
    const { username } = req.params;

    try {
        // 1. ค้นหา user_id จาก username
        const userResult = await query('SELECT id FROM users WHERE username = $1 AND role = $2', [username, 'student']);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'Student not found.' });
        }
        const userId = userResult.rows[0].id;

        // 2. ดึงประวัติการศึกษา
        const historyResult = await query(
            'SELECT term, term_gpa, gpax FROM academic_history WHERE user_id = $1 ORDER BY id ASC',
            [userId]
        );

        // จัดรูปแบบข้อมูล
        const academic_history = historyResult.rows.map(row => ({
            term: row.term,
            term_gpa: parseFloat(row.term_gpa),
            gpax: parseFloat(row.gpax)
        }));

        if (academic_history.length === 0) {
             // ส่ง 404 กลับไปตามที่ frontend คาดหวังถ้าไม่มี history
             return res.status(404).json({ error: 'No academic history available for this student.' });
        }

        res.json(academic_history);

    } catch (err) {
        console.error(`Error fetching history for ${username}:`, err);
        res.status(500).json({ error: 'Server error fetching academic history.' });
    }
});


// GET /api/admin/courses (ดึงข้อมูลหลักสูตรทั้งหมด)
router.get('/courses', async (req, res) => {
  try {
    const result = await query('SELECT * FROM courses ORDER BY track_id, year, semester, code');
    res.json(result.rows);
  } catch (err) {
    console.error('Admin courses error:', err);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// POST /api/admin/courses (เพิ่มวิชาใหม่)
router.post('/courses', async (req, res) => {
  const { code, name, credit, credit_format, type, track_id, year, semester } = req.body;
  try {
    const newCourse = await query(
      `INSERT INTO courses (code, name, credit, credit_format, type, track_id, year, semester)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [code, name, credit, credit_format, type, track_id, year, semester]
    );
    res.status(201).json(newCourse.rows[0]);
  } catch (err) {
    console.error('Admin add course error:', err);
    if (err.code === '23505') {
        return res.status(400).json({ error: 'Course code already exists' });
    }
    res.status(500).json({ error: 'Failed to add course' });
  }
});

export default router;