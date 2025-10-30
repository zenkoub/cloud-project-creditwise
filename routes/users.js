// routes/users.js

import express from 'express';
import { authMiddleware } from '../authMiddleware.js';
import { query } from '../db.js';

const router = express.Router();

// Small mapping of track IDs to human-friendly full names.
const TRACKS_FULL = {
  CORE: 'Core Curriculum',
  ALL: 'Core Curriculum',
  SD: 'Software Development',
  ITI: 'Information Technology Infrastructure',
  MM: 'Multimedia for Interactive Media, Web and Game Development',
  USER_FE: 'User Added Free Elective', // New: For user-added electives
  USER_GE: 'User Added General Elective', // New: For user-added electives
};

// Helper: Creates a course object used for replacement
function createReplacementObject(realElec, slot) {
    const gradeRow = realElec.gradeRow;
    return {
        code: realElec.code,
        name: gradeRow.course_name,
        credit: Number(gradeRow.credit),
        type: gradeRow.course_type,
        track_id: gradeRow.course_track_id,
        year: gradeRow.year, 
        semester: gradeRow.semester,
        grade: gradeRow.grade,
        status: gradeRow.status,
        track_full_name: TRACKS_FULL[gradeRow.course_track_id] || null,
        is_user_entry_slot: false, 
        replaces_slot_id: slot ? slot.slot_id : null
    };
}


// =========================================================
// GET /api/users/me (ดึงข้อมูลผู้ใช้ เกรด และประวัติทั้งหมด)
// =========================================================
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; 
    const userResult = await query(
      'SELECT id, username, name, role, track_id, study_plan, current_year, current_semester FROM users WHERE id = $1',
      [userId]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found in database.' });
    }
    const info = userResult.rows[0];
    const gradesResult = await query(
      `SELECT ug.course_code, ug.grade, ug.status, c.credit
       FROM user_grades ug
       LEFT JOIN courses c ON ug.course_code = c.code
       WHERE ug.user_id = $1`,
      [userId]
    );
    const grades = {};
    for (const row of gradesResult.rows) {
      grades[row.course_code] = {
        grade: row.grade,
        status: row.status,
        credit: parseInt(row.credit)
      };
    }
    const historyResult = await query(
      'SELECT term, term_gpa, gpax FROM academic_history WHERE user_id = $1 ORDER BY id ASC',
      [userId]
    );
    const academic_history = historyResult.rows.map(row => ({
        term: row.term,
        term_gpa: parseFloat(row.term_gpa),
        gpax: parseFloat(row.gpax)
    }));
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
    res.status(500).json({ error: 'Server error fetching user data.' });
  }
});


// =========================================================
// GET /api/users/me/curriculum
// REVISED: Implement explicit matching for 9064xxxx (USER_GE) and xxxxxxxx (USER_FE)
// =========================================================
router.get('/me/curriculum', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const u = await query('SELECT track_id FROM users WHERE id = $1', [userId]);
    if (!u.rows.length) return res.status(404).json({ error: 'User not found' });
    const track = u.rows[0].track_id;

    // 1. ดึงวิชาจากหลักสูตร (Core/All + User Track)
    const curriculumCoursesRes = await query(
      `SELECT c.code, c.name, c.credit, c.credit_format, c.type, c.track_id, c.year, c.semester
       FROM courses c
       WHERE c.track_id IN ('CORE', 'ALL') OR c.track_id = $1
       ORDER BY c.year, c.semester, c.code`,
      [track]
    );

    // 2. ดึงเกรดทั้งหมดของผู้ใช้ (รวมถึงวิชาที่ผู้ใช้เพิ่มเอง)
    const userGradesRes = await query(
        `SELECT ug.course_code, ug.grade, ug.status, COALESCE(ug.credit, c.credit) AS credit, 
                c.name AS course_name, c.type AS course_type, c.track_id AS course_track_id, c.year, c.semester
         FROM user_grades ug
         LEFT JOIN courses c ON ug.course_code = c.code
         WHERE ug.user_id = $1`,
        [userId]
    );
    
    const userGradesMap = new Map();
    userGradesRes.rows.forEach(r => userGradesMap.set(r.course_code, r));
    
    let finalCurriculum = []; // Declared with 'let'
    
    // 2a. แยกวิชาหลัก/สล็อต
    curriculumCoursesRes.rows.forEach(c => {
        const gradeInfo = userGradesMap.get(c.code);
        const row = {
            ...c,
            grade: gradeInfo?.grade ?? null,
            status: gradeInfo?.status ?? null,
            track_full_name: TRACKS_FULL[c.track_id] || null,
        };

        const isPlaceholderCode = c.code.includes('xxxx') || c.code.includes('xx');

        if (isPlaceholderCode) {
            const key = `${c.code}_${c.year}_${c.semester}_${c.track_id}_${c.type}`; 
            row.slot_id = key;
            finalCurriculum.push({ ...row, is_user_entry_slot: true });
        } else {
            finalCurriculum.push(row);
        }
    });
    
    // 3. จัดการ Slot Replacement
    
    // 3a. คัดกรองวิชา Elective จริงที่ผู้ใช้ลงทะเบียนแล้ว
    let realElectivesPool = [];
    userGradesMap.forEach((gradeRow, code) => {
        const isRealCourse = !(code.includes('xxxx') || code.includes('xx'));
        const isElectiveType = ['IT_Elective', 'Gen_Elective', 'Free_Elective', 'Gen', 'USER_FE', 'USER_GE'].includes(gradeRow.course_type) ||
                                 ['USER_FE', 'USER_GE'].includes(gradeRow.course_track_id);
        
        // Exclude Core/Major courses that are explicitly in the fixed curriculum
        const isFixedCoreOrMajor = finalCurriculum.some(c => c.code === code && !c.is_user_entry_slot && c.track_id !== 'USER_FE' && c.track_id !== 'USER_GE');
        
        if (isRealCourse && isElectiveType && !isFixedCoreOrMajor) {
             realElectivesPool.push({ code, gradeRow });
        }
    });

    // 3b. จัดเรียงวิชาจริงตามเวลาที่ลงทะเบียน (Oldest first)
    realElectivesPool.sort((a, b) => 
        (a.gradeRow.year || 99) - (b.gradeRow.year || 99) || 
        (a.gradeRow.semester || 99) - (b.gradeRow.semester || 99)
    );
    
    const realElectivesMap = new Map(realElectivesPool.map(e => [e.code, e]));
    
    let coreAndMajors = finalCurriculum.filter(c => !c.is_user_entry_slot);
    let slotsToFill = finalCurriculum.filter(c => c.is_user_entry_slot);

    // 4. Slot Filling Process
    const slotsToKeep = [];

    slotsToFill.sort((a, b) => (a.year || 0) - (b.year || 0) || (a.semester || 0) - (b.semester || 0));

    for (const slot of slotsToFill) {
        let filled = false;
        
        // Try to find a matching elective from the pool
        const match = Array.from(realElectivesMap.values()).find(realElec => {
            const gradeRow = realElec.gradeRow;
            const realCourseType = gradeRow.course_type; 
            const slotCode = slot.code;
            const slotType = slot.type;
            
            // Must have a grade and not be Withdrawn
            if (gradeRow.grade === '—' || gradeRow.grade === 'W' || gradeRow.status === 'Withdrawn') return false; 

            // Matching Logic based on Slot Type/Code
            let canFill = false;
            
            // 1. General Elective Slot (9064xxxx / Gen_Elective)
            if (slotCode.includes('9064xxxx') || slotType === 'Gen_Elective') {
                // Priority: USER_GE (Strict Match) > USER_FE/Free Elective (Flexible Match)
                if (realCourseType === 'USER_GE' || realCourseType === 'Gen_Elective' || realCourseType === 'Gen') {
                    canFill = true; // Strict Match
                } else if (realCourseType === 'USER_FE' || realCourseType === 'Free_Elective') {
                    canFill = true; // Flexible Match
                }
            }
            // 2. Free Elective Slot (xxxxxxxx / Free_Elective)
            else if (slotCode.includes('xxxxxxxx') || slotType === 'Free_Elective') {
                // Priority: USER_FE (Strict Match) > Anything else
                if (realCourseType === 'USER_FE') {
                    canFill = true;
                } else if (['Gen_Elective', 'Gen', 'USER_GE', 'Free_Elective', 'IT_Elective', 'Major'].includes(realCourseType)) {
                    canFill = true;
                }
            }
            // 3. IT/Major Elective Slot (0601xxxx / IT_Elective) - less flexible
            else if (slotType === 'IT_Elective' || slotType === 'Major') {
                if (['IT_Elective', 'Major'].includes(realCourseType)) {
                    canFill = true;
                }
            }
            
            return canFill;
        });
        
        if (match) {
            // Fill the slot
            const replacement = createReplacementObject(match, slot);
            coreAndMajors.push(replacement);
            realElectivesMap.delete(match.code); // Remove from pool
            filled = true;
        } 
        
        if (!filled) {
            slotsToKeep.push(slot);
        }
    }

    // 5. Collect Remaining User Added Electives (for display in Grade Entry)
    realElectivesMap.forEach(realElec => {
         const gradeRow = realElec.gradeRow;
         
         // Only re-add USER_FE/USER_GE electives that were manually added
         if (gradeRow.course_track_id === 'USER_FE' || gradeRow.course_track_id === 'USER_GE') {
             coreAndMajors.push(createReplacementObject(realElec, null));
         }
    });

    // Final Curriculum = [Core/Majors (including replacements), Remaining Slots]
    finalCurriculum = [...coreAndMajors, ...slotsToKeep]; // FIX: Remove 'const'

    // Sort the final output
    const out = finalCurriculum.sort((a, b) => 
        (a.year || 0) - (b.year || 0) || 
        (a.semester || 0) - (b.semester || 0) || 
        a.code.localeCompare(b.code)
    );

    res.json(out);
    
  } catch (err) {
    console.error('Error /api/users/me/curriculum:', err);
    res.status(500).json({ error: 'Server error fetching curriculum. Check server logs for details.' });
  }
});


// =========================================================
// PUT /api/users/me/grades (บันทึก/อัปเดตเกรด)
// =========================================================
router.put('/me/grades', authMiddleware, async (req, res) => {
  const userId = req.user.id; 
  const { course_code, grade, status } = req.body; 
  const { course_name, credit: course_credit, type: course_type, track_id: course_track_id, year: course_year, semester: course_semester } = req.body;

  if (!course_code || !grade || !status) {
    return res.status(400).json({ error: 'Missing course code, grade, or status in request.' });
  }

  try {
    const courseExists = await query('SELECT code FROM courses WHERE code = $1', [course_code]);
    if (courseExists.rows.length === 0) {
      if (course_name && (course_credit || course_credit === 0)) {
        
        const determinedType = course_type || 'Free_Elective';
        const determinedTrackId = determinedType === 'Free_Elective' ? 'USER_FE' : (determinedType === 'Gen_Elective' ? 'USER_GE' : (course_track_id || 'USER_MISC'));
        
        await query(
          `INSERT INTO courses (code, name, credit, credit_format, type, track_id, year, semester)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT DO NOTHING`,
          [
            course_code,
            course_name,
            Number(course_credit) || 0,
            typeof course_credit === 'number' ? `${course_credit}(3-0-6)` : null,
            determinedType,
            determinedTrackId,
            course_year || null,
            course_semester || null
          ]
        );
      } else {
        return res.status(400).json({ error: `Course code ${course_code} not found. Provide course_name and credit to create it.` });
      }
    }

    const result = await query(
      `INSERT INTO user_grades (user_id, course_code, grade, status, credit)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, course_code) DO UPDATE
       SET grade = EXCLUDED.grade, status = EXCLUDED.status, credit = EXCLUDED.credit
       RETURNING *`,
      [userId, course_code, grade, status, course_credit || null]
    );

    try {
      await rebuildAcademicHistoryForUser(userId);
    } catch (err2) {
      console.error('Failed to rebuild academic history:', err2);
    }

    res.json({ message: 'Grade saved successfully', gradeEntry: result.rows[0] });
    
  } catch (err) {
    console.error(`Error saving grade for ${course_code}:`, err);
    if (err.code === '23505') { 
        return res.status(400).json({ error: 'Course code already exists' }); 
    }
    if (err.code === '23503') { 
        return res.status(400).json({ error: `Course code ${course_code} not found in master curriculum (courses table).` });
    }
    res.status(500).json({ error: `Database error while saving grade for ${course_code}.` });
  }
});


// =========================================================
// DELETE /api/users/me/grades
// =========================================================
router.delete('/me/grades', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { course_code } = req.body;

  if (!course_code) {
    return res.status(400).json({ error: 'Missing course code in request.' });
  }

  try {
    const deleteResult = await query(
      'DELETE FROM user_grades WHERE user_id = $1 AND course_code = $2 RETURNING *',
      [userId, course_code]
    );

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ error: `Grade for ${course_code} not found for this user.` });
    }

    try {
      await rebuildAcademicHistoryForUser(userId);
    } catch (err2) {
      console.error('Failed to rebuild academic history after deletion:', err2);
    }
    
    res.json({ message: `Grade for ${course_code} deleted successfully` });

  } catch (err) {
    console.error(`Error deleting grade for ${course_code}:`, err);
    res.status(500).json({ error: `Database error while deleting grade for ${course_code}.` });
  }
});


// Helper: map grade to grade points
function gradeToPoint(grade) {
  const map = { 'A': 4.0, 'B+': 3.5, 'B': 3.0, 'C+': 2.5, 'C': 2.0, 'D+': 1.5, 'D': 1.0, 'F': 0.0 };
  return map[grade] ?? null;
}

// Rebuild academic_history for a user by grouping user_grades by course year/semester
async function rebuildAcademicHistoryForUser(userId) {
  const gradesRes = await query(
    `SELECT ug.grade, COALESCE(ug.credit, c.credit) AS credit, c.year, c.semester
     FROM user_grades ug
     LEFT JOIN courses c ON ug.course_code = c.code
     WHERE ug.user_id = $1
       AND ug.grade IS NOT NULL
     ORDER BY c.year, c.semester`,
    [userId]
  );

  const terms = new Map();
  for (const r of gradesRes.rows) {
    const year = r.year;
    const semester = r.semester;
    if (year == null || semester == null) continue;
    const key = `${year}__${semester}`;
    if (!terms.has(key)) terms.set(key, { year, semester, rows: [] });
    terms.get(key).rows.push({ grade: r.grade, credit: Number(r.credit) || 0 });
  }

  const sortedTerms = Array.from(terms.values()).sort((a,b) => (a.year - b.year) || (a.semester - b.semester));

  let cumulativeGradePoints = 0;
  let cumulativeCreditsForGPA = 0;
  const historyRows = [];

  for (const term of sortedTerms) {
    let termGradePoints = 0;
    let termCreditsForGPA = 0;

    for (const cr of term.rows) {
      const gp = gradeToPoint(cr.grade);
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

// =========================================================
// DELETE /api/users/me/grades
// =========================================================
router.delete('/me/grades', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { course_code } = req.body;

  if (!course_code) {
    return res.status(400).json({ error: 'Missing course code in request.' });
  }

  await query('BEGIN'); // Start transaction
  try {
    // 1. ดึง track_id ก่อนทำการลบ
    const courseCheck = await query('SELECT track_id FROM courses WHERE code = $1', [course_code]);
    const trackId = courseCheck.rows.length > 0 ? courseCheck.rows[0].track_id : null;
    
    // 2. ลบเกรดของผู้ใช้นี้ออกจาก user_grades
    const deleteGradeResult = await query(
      'DELETE FROM user_grades WHERE user_id = $1 AND course_code = $2 RETURNING *',
      [userId, course_code]
    );

    if (deleteGradeResult.rows.length === 0) {
      // แม้จะไม่มีเกรดให้ลบ แต่เรายังต้องพยายามลบวิชาออกจาก courses ถ้าจำเป็น
      // แต่เพื่อความปลอดภัย เราจะยอมให้ proceed หากมีการเริ่ม transaction ไปแล้ว
    }

    // 3. ถ้าเป็นวิชาที่ผู้ใช้สร้างเอง (USER_FE/USER_GE)
    if (trackId === 'USER_FE' || trackId === 'USER_GE') {
    
    const remainingGrades = await query(
        'SELECT 1 FROM user_grades WHERE course_code = $1 LIMIT 1',
        [course_code]
    );
    
    // ถ้าไม่มีเกรดเหลืออยู่เลยสำหรับวิชานี้ ให้พยายามลบ Course Definition
    if (remainingGrades.rows.length === 0) {
        
        // **!!! เพิ่มการล้างข้อมูลอ้างอิงที่อาจเป็นปัญหา !!!**
        // 1. ลองลบการอ้างอิงจากตาราง Prerequisite (ถ้ามี)
        try {
            // (สมมติว่ามีตารางชื่อ course_prerequisites)
            await query('DELETE FROM course_prerequisites WHERE course_code = $1 OR prerequisite_code = $1', [course_code]);
        } catch(e) {
            console.warn(`[DB Clean Warning] Failed to clean prerequisites for ${course_code}. Continuing...`, e.message);
        }

        // 2. ลองลบวิชาออกจากตาราง courses
        const deleteCourseResult = await query('DELETE FROM courses WHERE code = $1 RETURNING *', [course_code]);
        if (deleteCourseResult.rows.length > 0) {
             console.log(`[DELETE SUCCESS] User-added course definition deleted from 'courses' for code: ${course_code}`);
        } else {
             console.log(`[DELETE WARNING] Course definition for ${course_code} not found in 'courses'.`);
        }
    }
}
    
    // 4. สร้าง academic history ใหม่ (ภายใน transaction)
    try {
      await rebuildAcademicHistoryForUser(userId);
    } catch (err2) {
      console.error('Failed to rebuild academic history after deletion:', err2);
      throw new Error("Failed to rebuild history."); // Rollback if history fails
    }

    await query('COMMIT'); // Commit changes
    res.json({ message: `Grade and course definition for ${course_code} processed successfully` });

  } catch (err) {
    await query('ROLLBACK'); // Rollback if any error occurs
    console.error(`Error deleting grade for ${course_code}:`, err);
    res.status(500).json({ error: `Database error while deleting grade for ${course_code}. Details: ${err.message}` });
  }
});

export default router;