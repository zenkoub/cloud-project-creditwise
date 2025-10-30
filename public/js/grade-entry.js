// public/js/grade-entry.js

// Grade entry page: load curriculum from server, render term tables, support free/elective slots
// Behavior changes made:
// - Free electives appear only for the selected term (either from curriculum or user-added)
// - If a free/slot course has a concrete code (not a placeholder like 'xxxx'), render the code/name/credit as readonly and only allow grade entry
// - When user fills a free/slot entry, create course + user_grade on the server so it persists

document.addEventListener('DOMContentLoaded', async () => {
  const userData = await getCurrentUserData();
  if (!userData) return;

  // Fetch curriculum for this user (server is authoritative)
  try {
    const token = localStorage.getItem('cw_token');
    const resp = await fetch('/api/users/me/curriculum', { headers: { Authorization: `Bearer ${token}` } });
    if (resp.ok) {
      const rows = await resp.json();
      window.__dbCourses = rows.map(r => ({
        code: r.code,
        name: r.name,
        credit: r.credit,
        credit_format: r.credit_format,
        type: r.type,
        track_id: r.track_id,
        track_full_name: r.track_full_name || null,
        year: r.year == null ? null : Number(r.year),
        semester: r.semester == null ? null : Number(r.semester),
        grade: r.grade ?? null,
        status: r.status ?? null,
        is_user_entry_slot: r.is_user_entry_slot || false,
        slot_id: r.slot_id || null,
        replaces_slot_id: r.replaces_slot_id || null
      }));
      // Update userData.free_electives from the new server data
      userData.free_electives = window.__dbCourses.filter(c => 
          (c.track_id === 'USER_FE' || c.track_id === 'USER_GE')
      );
      console.log('Loaded curriculum into window.__dbCourses:', window.__dbCourses.length, 'rows');
    } else {
      console.warn('Could not load /api/users/me/curriculum for grade-entry:', resp.status);
      window.__dbCourses = [];
      if (!userData.free_electives) userData.free_electives = [];
    }
  } catch (err) {
    console.error('Error loading curriculum for grade-entry:', err);
    window.__dbCourses = [];
    if (!userData.free_electives) userData.free_electives = [];
  }

  if (!userData.grades) userData.grades = {};
  if (!userData.user_electives) userData.user_electives = {};

  const GRADE_OPTIONS = ['—', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F', 'W', 'S', 'U'];

  const yearSelect = document.getElementById('sel-year');
  const semesterSelect = document.getElementById('sel-semester');
  const trackSelect = document.getElementById('sel-track');
  const mainTbody = document.getElementById('grade-entry-body');
  const electiveTbody = document.getElementById('elective-entry-body');
  const addFreeElectiveBtn = document.getElementById('add-free-elective-btn');
  const termTotalCreditEl = document.getElementById('term-total-credit');
  const termEarnedCreditEl = document.getElementById('term-earned-credit');
  const termGpaEl = document.getElementById('term-gpa');

  function gradeToPoint(grade) {
    const map = { A: 4.0, 'B+': 3.5, B: 3.0, 'C+': 2.5, C: 2.0, 'D+': 1.5, D: 1.0, F: 0.0 };
    return map[grade] ?? null;
  }

  function getStatusFromGrade(grade) {
    if (['F', 'W', 'U', '—'].includes(grade)) return grade;
    if (['A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'S'].includes(grade)) return 'Passed';
    return '—';
  }

  function createGradeDropdown(identifier, currentGrade = '—') {
    return `
      <select class="grade" data-id="${identifier}" aria-label="Select grade for ${identifier}">
        ${GRADE_OPTIONS.map(g => `<option value="${g}" ${g === currentGrade ? 'selected' : ''}>${g}</option>`).join('')}
      </select>
    `;
  }
  
  async function reloadCurriculumData() {
     try {
        const token = localStorage.getItem('cw_token');
        const resp = await fetch('/api/users/me/curriculum', { headers: { Authorization: `Bearer ${token}` } });
        if (resp.ok) {
           const rows = await resp.json();
           window.__dbCourses = rows.map(r => ({
              code: r.code, name: r.name, credit: r.credit, credit_format: r.credit_format, type: r.type, 
              track_id: r.track_id, track_full_name: r.track_full_name || null, 
              year: r.year == null ? null : Number(r.year), 
              semester: r.semester == null ? null : Number(r.semester), 
              grade: r.grade ?? null, status: r.status ?? null, 
              is_user_entry_slot: r.is_user_entry_slot || false, 
              slot_id: r.slot_id || null, 
              replaces_slot_id: r.replaces_slot_id || null
           }));
           // Update userData.free_electives from the new server data
           userData.free_electives = window.__dbCourses.filter(c => 
               (c.track_id === 'USER_FE' || c.track_id === 'USER_GE')
           );
        }
     } catch(e) {
         console.error('Error reloading curriculum after save:', e);
     }
  }


  // API: save grade (upsert). Accepts extra metadata via saveGradeToApi._extra[code]
  async function saveGradeToApi(code, grade, status) {
    const token = localStorage.getItem('cw_token');
    if (!token) return;
    const payload = { course_code: code, grade, status };
    if (saveGradeToApi._extra && saveGradeToApi._extra[code]) Object.assign(payload, saveGradeToApi._extra[code]);
    try {
      const response = await fetch('/api/users/me/grades', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to save grade on server.');
      }
    } catch (err) {
      console.error('API Save Error for', code, err);
      alert('Error saving grade: ' + err.message);
    }
  }
  
  // API: delete user grade
  async function deleteGradeFromApi(code) {
      const token = localStorage.getItem('cw_token');
      if (!token) return;
      try {
          const response = await fetch('/api/users/me/grades', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ course_code: code })
          });
          if (!response.ok) {
              const err = await response.json().catch(() => ({}));
              throw new Error(err.error || 'Failed to delete grade on server.');
          }
      } catch (err) {
          console.error('API Delete Error for', code, err);
          alert('Error deleting grade: ' + err.message);
      }
  }


  // Save change handler
  async function saveGradeChange(element) {
    const grade = element.value;
    const id = element.dataset.id; // course code or slot id
    const row = element.closest('tr');
    const type = row.dataset.type; // 'main' | 'slot' | 'free'
    const status = getStatusFromGrade(grade);

    if (type === 'slot') {
      const slotId = row.dataset.slotId;
      const code = row.querySelector('[data-field="code"]').value.trim();
      const name = row.querySelector('[data-field="name"]').value.trim();
      const credit = parseInt(row.querySelector('[data-field="credit"]')?.value, 10) || 0;
      
      // We don't save slot data locally anymore, just send grade if code is present
      if (code && code !== 'Enter Code') {
        saveGradeToApi._extra = saveGradeToApi._extra || {};
        const slotCourse = window.__dbCourses.find(c => c.slot_id === slotId) || {};
        
        // Use type and track_id from the slot placeholder if available, otherwise default
        const courseType = slotCourse.type || 'Gen_Elective';
        const courseTrackId = slotCourse.track_id || userData.info.track_id;

        saveGradeToApi._extra[code] = { 
          course_name: name, 
          credit: credit, 
          type: courseType, 
          track_id: courseTrackId,
          year: slotCourse.year, 
          semester: slotCourse.semester 
        };
        await saveGradeToApi(code, grade, status);
      }
    } else if (type === 'free') {
      const globalIndex = Number(row.dataset.globalIndex); // <<< FIX: Get stable index
      
      const newCode = row.querySelector('[data-field="code"]').value.trim();
      const name = row.querySelector('[data-field="name"]').value.trim();
      const credit = parseInt(row.querySelector('[data-field="credit"]')?.value, 10) || 0;
      const selYear = parseInt(yearSelect.value, 10);
      const selSemesterRaw = semesterSelect.value;
      const selSemester = selSemesterRaw === 'summer' ? 0 : Number(selSemesterRaw);
      
      const courseType = row.dataset.courseType; // Get actual type from DOM

      const freeObj = { 
          code: newCode, 
          name: name || (courseType === 'Gen_Elective' ? 'New General Elective' : 'New Free Elective'), 
          credit: credit, 
          grade: grade, 
          status: status, 
          year: selYear, 
          semester: selSemester, 
          type: courseType, 
          track_id: courseType === 'Gen_Elective' ? 'USER_GE' : 'USER_FE' 
      };
      
      // FIX: Update object in place using the stable index
      if (globalIndex >= 0 && globalIndex < userData.free_electives.length) {
          userData.free_electives[globalIndex] = freeObj; 
      } else {
          // Fallback: This should only occur if it's a freshly added item, but we ensure it's added.
          userData.free_electives.push(freeObj);
      }

      if (newCode && newCode !== 'Enter Code') {
        saveGradeToApi._extra = saveGradeToApi._extra || {};
        // Pass necessary metadata for server to create the course row
        saveGradeToApi._extra[newCode] = { 
          course_name: freeObj.name, 
          credit: credit, 
          type: freeObj.type, 
          track_id: freeObj.track_id, // Use specific track_id for server
          year: selYear, 
          semester: selSemester 
        };
        await saveGradeToApi(newCode, grade, status);
      }
    } else { // main course
      const course = window.__dbCourses.find(c => c.code === id);
      const credit = parseInt(row.querySelector('td:nth-child(3)')?.textContent || course?.credit || '0');
      
      if (userData.grades.hasOwnProperty(id)) {
        userData.grades[id].grade = grade;
        userData.grades[id].status = status;
        userData.grades[id].credit = credit;
      } else {
        userData.grades[id] = { grade, status, credit };
      }
      await saveGradeToApi(id, grade, status);
    }

    await reloadCurriculumData(); 
    renderTables();
  }

  function saveElectiveDetailChange(element) {
    const row = element.closest('tr');
    const type = row?.dataset.type;
    if (type === 'slot') {
      // In grade-entry page, we now rely on the grade save to persist manual slot data.
      // We no longer locally cache slot data in user_electives for fixed placeholders.
    } else if (type === 'free') {
      const globalIndex = Number(row.dataset.globalIndex); 

      if (globalIndex >= 0 && globalIndex < userData.free_electives.length) {
         // Update the object in place
         userData.free_electives[globalIndex].code = row.querySelector('[data-field="code"]')?.value.trim();
         userData.free_electives[globalIndex].name = row.querySelector('[data-field="name"]')?.value.trim();
         userData.free_electives[globalIndex].credit = parseInt(row.querySelector('[data-field="credit"]')?.value, 10) || 0;
         // Ensure we update the temporary attribute used for grade selection 
         row.querySelector('.grade').dataset.id = userData.free_electives[globalIndex].code; 
      }
    }
  }
  
  // REVISED: Function to handle adding user-defined electives (both types)
  function addUserElectiveSlot() {
      const selectedType = prompt('ต้องการเพิ่มวิชาเลือกประเภทใด?\n1: วิชาเลือกทั่วไป (แทน 9064xxxx)\n2: วิชาเลือกเสรี (แทน xxxxxxxx)', '1');
      
      let courseType;
      let namePlaceholder;
      
      if (selectedType === '1') {
          courseType = 'Gen_Elective';
          namePlaceholder = 'New General Elective';
      } else if (selectedType === '2') {
          courseType = 'Free_Elective';
          namePlaceholder = 'New Free Elective';
      } else {
          return; // Cancelled or invalid selection
      }
      
      // Use Date.now() as a unique temporary code
      const newCode = `${courseType.slice(0, 2)}-${Date.now().toString().slice(-5)}`; 
      const selYear = parseInt(yearSelect.value, 10);
      const selSemesterRaw = semesterSelect.value;
      const selSemester = selSemesterRaw === 'summer' ? 0 : Number(selSemesterRaw);
      
      userData.free_electives.push({ 
          code: newCode, 
          name: namePlaceholder, 
          credit: 3, 
          grade: '—', 
          status: '—', 
          year: selYear, 
          semester: selSemester,
          type: courseType,
          track_id: courseType === 'Gen_Elective' ? 'USER_GE' : 'USER_FE'
      });
      renderTables();
  }
  
  // MODIFIED: Function to remove elective
  async function removeUserElective(globalIndex) {
    const index = Number(globalIndex);
    if (index >= 0 && index < userData.free_electives.length) {
         const courseToDelete = userData.free_electives[index];
         
         // 1. ลบเกรดออกจาก Server (user_grades)
         if (courseToDelete.code && courseToDelete.code !== 'Enter Code') {
             // We attempt to delete the course by its code
             await deleteGradeFromApi(courseToDelete.code);
         }
         
         // 2. ลบออกจาก Local array (This will be refreshed by reloadCurriculumData but we delete locally first for consistency)
         userData.free_electives.splice(index, 1);
         
         // 3. รีโหลดข้อมูลและเรนเดอร์ตาราง
         await reloadCurriculumData();
         renderTables();
    }
  }


  function renderTables() {
    const selectedYear = parseInt(yearSelect.value, 10);
    const selectedSemesterRaw = semesterSelect.value;
    const selectedSemester = selectedSemesterRaw === 'summer' ? 0 : Number(selectedSemesterRaw);
    const trackId = userData.info.track_id;
    const studyPlan = userData.info.study_plan;

    let mainTableCourses = [];
    let electiveSlots = [];

    if (!window.__dbCourses || window.__dbCourses.length === 0) {
      mainTbody.innerHTML = `<tr><td colspan="4" class="text-center muted">No curriculum data available for this term.</td></tr>`;
      electiveTbody.innerHTML = '';
      return;
    }

    // Filtered courses from /me/curriculum
    const candidates = window.__dbCourses.filter(c => {
        const sameYear = Number(c.year) === selectedYear;
        const sameSem = Number(c.semester) === selectedSemester;
        
        // Exclude User-Added Electives here; they are handled separately
        if (c.track_id === 'USER_FE' || c.track_id === 'USER_GE') return false; 
        
        return sameYear && sameSem; 
    });

    const filledSlots = new Set();
    
    // Process to populate mainTableCourses and electiveSlots
    candidates.forEach((c) => {
        if (c.is_user_entry_slot) {
             // Treat as a slot placeholder
             electiveSlots.push({ 
                 slot_id: c.slot_id || c.code, 
                 type: c.type || 'Elective', 
                 name: c.name, 
                 credit: c.credit || 3, 
                 is_user_entry_slot: true, 
                 code: c.code || null, 
                 editable: true,
                 year: c.year,
                 semester: c.semester,
                 track_id: c.track_id
             });
        } else {
             // If this is a real course that replaced a placeholder (server logic did this replacement)
             if (c.replaces_slot_id) {
                 filledSlots.add(c.replaces_slot_id);
             }
             mainTableCourses.push(c);
        }
    });
    
    // Remove placeholder slots that were filled by the server logic
    electiveSlots = electiveSlots.filter(slot => !filledSlots.has(slot.slot_id));
      

    if (mainTableCourses.length > 0) {
      mainTbody.innerHTML = mainTableCourses.map(course => {
        const grade = course.grade || '—';
        const credit = course.credit;
        return `
          <tr data-code="${course.code}" data-type="main">
            <td>${course.code}</td>
            <td style="text-align: left;">${course.name}</td>
            <td>${credit}</td>
            <td>${createGradeDropdown(course.code, grade)}</td>
          </tr>
        `;
      }).join('');
    } else {
      mainTbody.innerHTML = `<tr><td colspan="4" class="text-center muted">No required courses for this term.</td></tr>`;
    }

    let electiveHtml = '';

    // Render Slots (Gen Electives / IT Electives)
    electiveSlots.forEach(slot => {
      // NOTE: For fixed slots from curriculum, we don't need to look at userData.user_electives anymore.
      
      const codeVal = slot.code || 'Enter Code';
      const nameVal = slot.name;
      const creditVal = slot.credit || 3;
      
      // Get the grade for the code the user has entered/saved previously
      const currentGrade = userData.grades[codeVal]?.grade || '—';

      const typeDisplay = (slot.type || 'Elective').replace(/_/g, ' ');
      const isReadOnly = (slot.code && !slot.editable);
      
      electiveHtml += `
          <tr data-slot-id="${slot.slot_id}" data-type="slot">
            <td class="muted">${slot.slot_id} (${typeDisplay})</td>
            <td><input type="text" class="inputelec" value="${codeVal}" data-field="code" ${isReadOnly ? 'readonly' : ''} placeholder="e.g., 0601xxxx" aria-label="Course code for ${slot.slot_id}"></td>
            <td><input type="text" class="inputelec" value="${nameVal}" data-field="name" ${isReadOnly ? 'readonly' : ''} placeholder="Course Name" aria-label="Course name for ${slot.slot_id}"></td>
            <td><input type="number" class="inputelec" value="${creditVal}" data-field="credit" min="0" step="1" ${isReadOnly ? 'readonly' : ''} aria-label="Credit for ${slot.slot_id}"></td>
            <td>${createGradeDropdown(codeVal, currentGrade)}</td>
            <td><button class="btn-sm btn-del" data-action="remove-slot" data-slot-id="${slot.slot_id}" ${isReadOnly ? 'disabled' : ''}>Clear</button></td>
          </tr>
      `;
    });


    // Render User-Added Electives (MODIFIED logic)
    const allUserElectives = userData.free_electives;
    let termUserElectiveHtml = '';

    allUserElectives.forEach((course, globalIndex) => { // <<< Use globalIndex
        // Filter by selected term
        const isForSelectedTerm = Number(course.year) === selectedYear && Number(course.semester) === selectedSemester;
        
        if (isForSelectedTerm) {
            const grade = course.grade || '—';
            const typeDisplay = (course.type || 'Elective').replace(/_/g, ' ');
            
            termUserElectiveHtml += `
              <tr data-code="${course.code}" data-type="free" data-global-index="${globalIndex}" data-course-type="${course.type}"> 
                <td class="muted">${typeDisplay}</td>
                <td><input type="text" class="inputelec" value="${course.code}" data-field="code" placeholder="e.g., 90xxxxxx" aria-label="Course code for free elective ${globalIndex + 1}"></td>
                <td><input type="text" class="inputelec" value="${course.name}" data-field="name" placeholder="Course Name" aria-label="Course name for free elective ${globalIndex + 1}"></td>
                <td><input type="number" class="inputelec" value="${course.credit}" data-field="credit" min="0" step="1" aria-label="Credit for free elective ${globalIndex + 1}"></td>
                <td>${createGradeDropdown(course.code, grade)}</td>
                <td><button class="btn-sm btn-del" data-action="remove-free" data-global-index="${globalIndex}" data-code="${course.code}">Remove</button></td> 
              </tr>
            `;
        }
    });

    electiveHtml += termUserElectiveHtml; // Combine HTML of user-added electives


    if (!electiveHtml) electiveTbody.innerHTML = `<tr><td colspan="6" class="text-center muted">No elective slots or user-added electives for this term.</td></tr>`; else electiveTbody.innerHTML = electiveHtml;

    updateTermStats(mainTableCourses, electiveSlots);
  }

  function updateTermStats(mainCourses, electiveSlots) {
    const selectedYear = parseInt(yearSelect.value, 10);
    const selectedSemesterRaw = semesterSelect.value;
    const selectedSemester = selectedSemesterRaw === 'summer' ? 0 : Number(selectedSemesterRaw);

    let totalCreditAttempted = 0;
    let earnedCredit = 0;
    let totalGradePoints = 0;
    let totalCreditForGPA = 0;

    // Helper to process a course for stats
    const processCourseForStats = (course) => {
        const gradeInfo = userData.grades[course.code];
        const credit = course.credit || gradeInfo?.credit || 0;
        const grade = course.grade || gradeInfo?.grade || '—';
        if (credit > 0 && grade !== '—' && grade !== 'W') {
            totalCreditAttempted += credit;
            if (!['F', 'U'].includes(grade)) earnedCredit += credit;
            if (!['S', 'U'].includes(grade)) { totalCreditForGPA += credit; totalGradePoints += credit * (gradeToPoint(grade) || 0); }
        }
    };

    // 1. Main Courses (from server/curriculum)
    mainCourses.forEach(processCourseForStats);


    // 2. Elective Slots (Only count if a grade is present in the main grades map for the code entered)
    electiveSlots.forEach(slot => {
        // Get code from the rendered input field (if user edited it)
        const row = document.querySelector(`tr[data-slot-id="${slot.slot_id}"]`);
        const codeVal = row?.querySelector('[data-field="code"]')?.value || slot.code;
        
        // Use the grade/credit from the main grades map for the entered code
        const gradeInfo = userData.grades[codeVal];
        
        if (gradeInfo) {
             const credit = gradeInfo.credit || slot.credit || 0;
             const grade = gradeInfo.grade || '—';
             if (credit > 0 && grade !== '—' && grade !== 'W') {
                 totalCreditAttempted += credit;
                 if (!['F', 'U'].includes(grade)) earnedCredit += credit;
                 if (!['S', 'U'].includes(grade)) { totalCreditForGPA += credit; totalGradePoints += credit * (gradeToPoint(grade) || 0); }
             }
        }
    });
    
    // 3. User-Added Electives (from local userData.free_electives, which were loaded from server)
    const termUserElectives = userData.free_electives.filter(f => Number(f.year) === selectedYear && Number(f.semester) === selectedSemester);
    termUserElectives.forEach(processCourseForStats);


    const termGPA = totalCreditForGPA > 0 ? (totalGradePoints / totalCreditForGPA) : 0;
    termTotalCreditEl.textContent = totalCreditAttempted;
    termEarnedCreditEl.textContent = earnedCredit;
    termGpaEl.textContent = termGPA.toFixed(2);
  }


  function initializePage() {
    document.getElementById('student-badge').textContent = `${userData.info.name || 'N/A'} • ${userData.info.username || 'N/A'}`;
    const trackId = userData.info.track_id;
    const trackName = userData.info.track_full_name || (trackId && trackId !== 'N/A' && window.TRACKS_INFO && window.TRACKS_INFO[trackId] ? window.TRACKS_INFO[trackId].full_name : '(No Track Selected)');
    document.getElementById('student-track').textContent = `Track: ${trackName}`;

    const currentYear = userData.info.current_year || 1;
    yearSelect.innerHTML = [...Array(5)].map((_, i) => `<option value="${i + 1}" ${i + 1 === currentYear ? 'selected' : ''}>Year ${i + 1}</option>`).join('');

    const currentSemester = userData.info.current_semester || '1';
    semesterSelect.innerHTML = `
      <option value="1" ${currentSemester === '1' ? 'selected' : ''}>1</option>
      <option value="2" ${currentSemester === '2' ? 'selected' : ''}>2</option>
      <option value="0" ${currentSemester === 'summer' ? 'selected' : ''}>Summer</option>
    `;

    if (trackId && trackId !== 'N/A') { const label = trackName && trackName !== '(No Track Selected)' ? trackName : trackId; trackSelect.innerHTML = `<option value="${trackId}">${label}</option>`; trackSelect.value = trackId; trackSelect.disabled = true; } else { trackSelect.innerHTML = `<option value="">(No Track)</option>`; trackSelect.disabled = true; }

    yearSelect.addEventListener('change', renderTables);
    semesterSelect.addEventListener('change', renderTables);
    
    // MODIFIED: Use new function
    addFreeElectiveBtn.addEventListener('click', addUserElectiveSlot); 

    document.body.addEventListener('change', async function (event) { 
        if (event.target.matches('.grade')) await saveGradeChange(event.target); 
        else if (event.target.matches('.inputelec')) saveElectiveDetailChange(event.target); 
    });

    // MODIFIED: Use new remove function
    document.body.addEventListener('click', function (event) { 
        const action = event.target.dataset.action; 
        if (action === 'remove-free') { 
            const globalIndex = event.target.dataset.globalIndex; 
            const code = event.target.dataset.code;
            if (globalIndex !== undefined && confirm(`Remove elective ${code}?`)) { 
                 removeUserElective(globalIndex); 
            } 
        }
    });

    renderTables();
  }

  initializePage();
});