// routes/admin.js (ฉบับแก้ไข)

import express from 'express';
import { authMiddleware, adminMiddleware } from '../authMiddleware.js';
import { query } from '../db.js';

const router = express.Router();

// ใช้ middleware ตรวจสอบ token และสิทธิ์ admin ทุก route ในไฟล์นี้
router.use(authMiddleware);
router.use(adminMiddleware);

// GET /api/admin/students (ดึงข้อมูลนักศึกษาทั้งหมด) with aggregate credits and latest GPAX
router.get('/students', async (req, res) => {
  try {
    const result = await query(
      `SELECT u.id, u.username, u.name, u.track_id, u.study_plan, u.current_year, u.current_semester,
              COALESCE(tc.total_credits, 0) AS total_credits,
              COALESCE(ah.latest_gpax, 0) AS gpax,
              COALESCE(ah.latest_term_gpa, 0) AS latest_term_gpa
       FROM users u
       LEFT JOIN (
         SELECT user_id, SUM(COALESCE(ug.credit, c.credit, 0)) AS total_credits
         FROM user_grades ug
         LEFT JOIN courses c ON ug.course_code = c.code
         GROUP BY user_id
       ) tc ON tc.user_id = u.id
       LEFT JOIN (
         SELECT ah1.user_id, ah1.gpax AS latest_gpax, ah1.term_gpa AS latest_term_gpa
         FROM academic_history ah1
         WHERE ah1.id IN (
           SELECT MAX(id) FROM academic_history ah2 WHERE ah2.user_id = ah1.user_id GROUP BY user_id
         )
       ) ah ON ah.user_id = u.id
       WHERE u.role = 'student' ORDER BY u.username`
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

// PUT /api/admin/courses/:id (อัปเดตวิชา)
router.put('/courses/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { code, name, credit, credit_format, type, track_id, year, semester } = req.body;
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid course id' });
  try {
    const result = await query(
      `UPDATE courses SET code = $1, name = $2, credit = $3, credit_format = $4, type = $5, track_id = $6, year = $7, semester = $8
       WHERE id = $9 RETURNING *`,
      [code, name, credit, credit_format, type, track_id, year, semester, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Course not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Admin update course error:', err);
    res.status(500).json({ error: 'Failed to update course' });
  }
});

// DELETE /api/admin/courses/:id (ลบวิชา)
router.delete('/courses/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid course id' });
  try {
    const del = await query('DELETE FROM courses WHERE id = $1 RETURNING *', [id]);
    if (del.rows.length === 0) return res.status(404).json({ error: 'Course not found' });
    res.json({ message: 'Course deleted', course: del.rows[0] });
  } catch (err) {
    console.error('Admin delete course error:', err);
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

export default router;