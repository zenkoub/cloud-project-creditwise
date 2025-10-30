import express from 'express';
import { authMiddleware } from '../authMiddleware.js';
import { query } from '../db.js';

const router = express.Router();

// Small mapping of track IDs to human-friendly full names.
// Keep this in sync with the client-side TRACKS_INFO if you change it.
const TRACKS_FULL = {
  CORE: 'Core Curriculum',
  ALL: 'Core Curriculum',
  SD: 'Software Development',
  ITI: 'Information Technology Infrastructure',
  MM: 'Multimedia for Interactive Media, Web and Game Development'
};

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
        track_full_name: TRACKS_FULL[info.track_id] || null
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
// GET /api/users/me/curriculum
// ส่งรายการวิชาจากตาราง courses สำหรับผู้ใช้ (CORE + user track)
// รวมสถานะเกรดจาก user_grades (ถ้ามี)
// =========================================================
router.get('/me/curriculum', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // ตรวจสอบว่าผู้ใช้มี track_id ในระบบหรือไม่
    const u = await query('SELECT track_id FROM users WHERE id = $1', [userId]);
    if (!u.rows.length) return res.status(404).json({ error: 'User not found' });
    const track = u.rows[0].track_id;

    const rows = await query(
      `SELECT c.code, c.name, c.credit, c.credit_format, c.type, c.track_id, c.year, c.semester,
              ug.grade, ug.status
       FROM courses c
       LEFT JOIN user_grades ug ON ug.course_code = c.code AND ug.user_id = $1
       WHERE c.track_id IN ('CORE', 'ALL') OR c.track_id = $2 OR ug.user_id = $1
       ORDER BY c.year, c.semester, c.code`,
      [userId, track]
    );

    // Attach a friendly track full name to each course row (if available)
    const out = rows.rows.map(r => ({
      ...r,
      track_full_name: TRACKS_FULL[r.track_id] || null
    }));

    res.json(out);
  } catch (err) {
    console.error('Error /api/users/me/curriculum:', err);
    res.status(500).json({ error: 'Server error fetching curriculum.' });
  }
});


// =========================================================
// PUT /api/users/me/grades (บันทึก/อัปเดตเกรด)
// =========================================================
router.put('/me/grades', authMiddleware, async (req, res) => {
  const userId = req.user.id; 
  
  // ✅ FIX: ดึงค่า course_code, grade, status จาก req.body
  const { course_code, grade, status } = req.body; 
  const { course_name, credit: course_credit, type: course_type, track_id: course_track_id, year: course_year, semester: course_semester } = req.body;

  if (!course_code || !grade || !status) {
    return res.status(400).json({ error: 'Missing course code, grade, or status in request.' });
  }

  try {
    // Ensure course exists in courses table. If not and we have details, create it.
    const courseExists = await query('SELECT code FROM courses WHERE code = $1', [course_code]);
    if (courseExists.rows.length === 0) {
      // If caller provided course details, insert a minimal courses row to allow FK and future queries
      if (course_name && (course_credit || course_credit === 0)) {
        const insertTrack = course_track_id || (await query('SELECT track_id FROM users WHERE id = $1', [userId])).rows[0].track_id || null;
        await query(
          `INSERT INTO courses (code, name, credit, credit_format, type, track_id, year, semester)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            course_code,
            course_name,
            Number(course_credit) || 0,
            typeof course_credit === 'number' ? `${course_credit}(3-0-6)` : null,
            course_type || 'Free_Elective',
            insertTrack,
            course_year || null,
            course_semester || null
          ]
        );
      } else {
        // No course row and not enough details to create one
        return res.status(400).json({ error: `Course code ${course_code} not found. Provide course_name and credit to create it.` });
      }
    }

    // Use UPSERT (INSERT OR UPDATE) in PostgreSQL
    const result = await query(
      `INSERT INTO user_grades (user_id, course_code, grade, status, credit)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, course_code) DO UPDATE
       SET grade = EXCLUDED.grade, status = EXCLUDED.status, credit = EXCLUDED.credit
       RETURNING *`,
      [userId, course_code, grade, status, course_credit || null]
    );

    // ส่ง JSON กลับไปเพื่อบอกว่าสำเร็จ
    // Recalculate academic_history for the user so term GPA and GPAX stay in sync
    try {
      await rebuildAcademicHistoryForUser(userId);
    } catch (err2) {
      console.error('Failed to rebuild academic history:', err2);
    }

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


// Helper: map grade to grade points
function gradeToPoint(grade) {
  const map = { 'A': 4.0, 'B+': 3.5, 'B': 3.0, 'C+': 2.5, 'C': 2.0, 'D+': 1.5, 'D': 1.0, 'F': 0.0 };
  return map[grade] ?? null;
}

// Rebuild academic_history for a user by grouping user_grades by course year/semester
async function rebuildAcademicHistoryForUser(userId) {
  // Fetch all graded courses joined with course metadata
  const gradesRes = await query(
    `SELECT ug.grade, COALESCE(ug.credit, c.credit) AS credit, c.year, c.semester
     FROM user_grades ug
     LEFT JOIN courses c ON ug.course_code = c.code
     WHERE ug.user_id = $1
       AND ug.grade IS NOT NULL
     ORDER BY c.year, c.semester`,
    [userId]
  );

  // Group by term (year, semester)
  const terms = new Map(); // key -> {year, semester, rows: [{grade,credit}]}
  for (const r of gradesRes.rows) {
    const year = r.year;
    const semester = r.semester;
    if (year == null || semester == null) continue; // skip unknown term placement
    const key = `${year}__${semester}`;
    if (!terms.has(key)) terms.set(key, { year, semester, rows: [] });
    terms.get(key).rows.push({ grade: r.grade, credit: Number(r.credit) || 0 });
  }

  // Sort terms by year, semester ascending
  const sortedTerms = Array.from(terms.values()).sort((a,b) => (a.year - b.year) || (a.semester - b.semester));

  // Build academic history rows and compute cumulative GPAX
  let cumulativeGradePoints = 0;
  let cumulativeCreditsForGPA = 0;
  const historyRows = [];

  for (const term of sortedTerms) {
    let termGradePoints = 0;
    let termCreditsForGPA = 0;

    for (const cr of term.rows) {
      const gp = gradeToPoint(cr.grade);
      // Only letter grades (including F) count toward GPA
      if (gp !== null && !isNaN(cr.credit) && cr.credit > 0) {
        termGradePoints += gp * cr.credit;
        termCreditsForGPA += cr.credit;
      }
    }

    const termGpa = termCreditsForGPA > 0 ? +(termGradePoints / termCreditsForGPA).toFixed(2) : 0.00;

    cumulativeGradePoints += termGradePoints;
    cumulativeCreditsForGPA += termCreditsForGPA;
    const gpax = cumulativeCreditsForGPA > 0 ? +(cumulativeGradePoints / cumulativeCreditsForGPA).toFixed(2) : 0.00;

    const termLabel = `Year ${term.year} Semester ${term.semester}`;
    historyRows.push({ term: termLabel, term_gpa: termGpa, gpax });
  }

  // Replace academic_history for the user (simple approach: delete and insert)
  await query('BEGIN');
  try {
    await query('DELETE FROM academic_history WHERE user_id = $1', [userId]);
    for (const hr of historyRows) {
      await query(
        'INSERT INTO academic_history (user_id, term, term_gpa, gpax) VALUES ($1, $2, $3, $4)',
        [userId, hr.term, hr.term_gpa, hr.gpax]
      );
    }
    await query('COMMIT');
  } catch (err) {
    await query('ROLLBACK');
    throw err;
  }
}


export default router;