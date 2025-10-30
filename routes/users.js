import express from 'express';
import { authMiddleware } from '../authMiddleware.js';
import { query } from '../db.js';

const router = express.Router();

// =========================================================
// GET /api/users/me (ดึงข้อมูลผู้ใช้ เกรด และประวัติทั้งหมด)
// =========================================================
// ใช้ authMiddleware เพื่อตรวจสอบ Token ก่อนเข้าถึงข้อมูลส่วนตัว
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // ดึง userId จาก token ที่ถูกถอดรหัสแล้ว
    const userId = req.user.id; 

    // 1. ดึงข้อมูล User Info
    const userResult = await query(
      'SELECT id, username, name, role, track_id, study_plan, current_year, current_semester FROM users WHERE id = $1',
      [userId]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found in database.' });
    }
    const info = userResult.rows[0];

    // 2. ดึงข้อมูล Grades (JOIN กับ courses เพื่อดึงหน่วยกิต)
    const gradesResult = await query(
      `SELECT ug.course_code, ug.grade, ug.status, c.credit
       FROM user_grades ug
       LEFT JOIN courses c ON ug.course_code = c.code
       WHERE ug.user_id = $1`,
      [userId]
    );
    
    // จัดรูปแบบข้อมูลเกรดให้อยู่ในรูปแบบที่ Frontend คาดหวัง
    const grades = {};
    for (const row of gradesResult.rows) {
      grades[row.course_code] = {
        grade: row.grade,
        status: row.status,
        credit: parseInt(row.credit)
      };
    }

    // 3. ดึงข้อมูล Academic History
    const historyResult = await query(
      'SELECT term, term_gpa, gpax FROM academic_history WHERE user_id = $1 ORDER BY id ASC',
      [userId]
    );
    const academic_history = historyResult.rows.map(row => ({
        term: row.term,
        term_gpa: parseFloat(row.term_gpa),
        gpax: parseFloat(row.gpax)
    }));
    
    // 4. ส่งข้อมูลทั้งหมดกลับไป
    res.json({
      info: {
        ...info,
        track: info.track_id, 
      },
      grades,
      academic_history,
      user_electives: {},
      free_electives: []
    });

  } catch (err) {
    console.error('Fetch /api/users/me Error:', err);
    // ส่ง Error เป็น JSON
    res.status(500).json({ error: 'Server error fetching user data.' });
  }
});


// =========================================================
// PUT /api/users/me/grades (บันทึก/อัปเดตเกรด)
// =========================================================
router.put('/me/grades', authMiddleware, async (req, res) => {
  const userId = req.user.id; 
  
  // ✅ FIX: ดึงค่า course_code, grade, status จาก req.body
  const { course_code, grade, status } = req.body; 

  if (!course_code || !grade || !status) {
    return res.status(400).json({ error: 'Missing course code, grade, or status in request.' });
  }

  try {
    // ใช้คำสั่ง UPSERT (INSERT OR UPDATE) ใน PostgreSQL
    const result = await query(
      `INSERT INTO user_grades (user_id, course_code, grade, status)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, course_code) DO UPDATE
       SET grade = EXCLUDED.grade, status = EXCLUDED.status
       RETURNING *`,
      [userId, course_code, grade, status]
    );

    // ส่ง JSON กลับไปเพื่อบอกว่าสำเร็จ
    res.json({ message: 'Grade saved successfully', gradeEntry: result.rows[0] });
    
  } catch (err) {
    console.error(`Error saving grade for ${course_code}:`, err);
    // ตรวจจับ Foreign Key Violation โดยเฉพาะ
    if (err.code === '23503') { 
        return res.status(400).json({ error: `Course code ${course_code} not found in master curriculum (courses table).` });
    }
    // ส่ง Error เป็น JSON
    res.status(500).json({ error: `Database error while saving grade for ${course_code}.` });
  }
});


export default router;