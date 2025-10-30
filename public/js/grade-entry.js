// public/js/grade-entry.js

document.addEventListener('DOMContentLoaded', async () => { // *** เปลี่ยนเป็น async ***
  
  // --- Global Variables & Initial Setup ---
  const userData = await getCurrentUserData(); // *** เปลี่ยนเป็น await ***
  if (!userData) return;

  // ... (โค้ดส่วนอื่น ๆ เหมือนเดิม) ...
  if (!userData.grades) userData.grades = {};
  if (!userData.user_electives) userData.user_electives = {};
  if (!userData.free_electives) userData.free_electives = [];

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

  // --- Helper Functions (gradeToPoint, getStatusFromGrade, createGradeDropdown, getSemesterKey เหมือนเดิม) ---
  function gradeToPoint(grade) {
    const map = { "A": 4.0, "B+": 3.5, "B": 3.0, "C+": 2.5, "C": 2.0, "D+": 1.5, "D": 1.0, "F": 0.0 };
    return map[grade] ?? 0.0;
  }

  function getStatusFromGrade(grade) {
      if (['F', 'W', 'U', '—'].includes(grade)) return grade;
      if (['A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'S'].includes(grade)) return 'Passed';
      return '—';
  }

  function createGradeDropdown(identifier, currentGrade = '—') {
    return `
      <select class="grade" data-id="${identifier}" aria-label="Select grade for ${identifier}">
        ${GRADE_OPTIONS.map(g =>
          `<option value="${g}" ${g === currentGrade ? 'selected' : ''}>${g}</option>`
        ).join('')}
      </select>
    `;
  }

  function getSemesterKey(year, semester, studyPlan) {
    const yearKey = `Year ${year}`;
    let semesterKey = `Semester ${semester}`;
    if (semester.toLowerCase() === 'summer') semesterKey = 'Summer';

    if (year === 3 || year === 4) {
      const planSuffix = ` (${studyPlan === "Co-op" ? 'Co-op' : 'Non-Co-op'})`;
      if (semester === "2" || semester.toLowerCase() === 'summer') {
          semesterKey = `Semester 2${planSuffix}`;
      } else if (year === 4 && semester === "1") {
          semesterKey = `Semester 1${planSuffix}`;
      }
    }
    return semesterKey;
  }
  
  // *** ฟังก์ชันใหม่: ส่งเกรดไปบันทึกที่ API ***
  async function saveGradeToApi(code, grade, status) {
      const token = localStorage.getItem('cw_token');
      if (!token) return;

      const payload = { course_code: code, grade, status };
      try {
          const response = await fetch('/api/users/me/grades', {
              method: 'PUT',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(payload)
          });
          
          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to save grade on server.');
          }
          // console.log(`Grade for ${code} saved successfully.`);
      } catch (error) {
          console.error(`API Save Error for ${code}:`, error);
          alert(`Error saving grade for ${code}: ${error.message}`);
      }
  }


  // --- Core Logic Functions ---

  // Saves grade from dropdown/input change
  async function saveGradeChange(element) { // *** เปลี่ยนเป็น async ***
    const grade = element.value;
    const id = element.dataset.id; // Identifier (course code or slot_id)
    const row = element.closest('tr');
    const isSlot = row.dataset.type === 'slot';
    const isFree = row.dataset.type === 'free';
    const status = getStatusFromGrade(grade);

    if (isSlot) {
      const slotId = row.dataset.slotId;
      const code = row.querySelector('[data-field="code"]').value.trim();
      const name = row.querySelector('[data-field="name"]').value.trim();
      const credit = parseInt(row.querySelector('[data-field="credit"]').value, 10) || 0;
      userData.user_electives[slotId] = { code, name, credit, grade, status, slot_id: slotId, is_user_entry_slot: true };
      // NOTE: Electives/Free Electives ไม่ถูกบันทึกใน API นี้ ต้องปรับปรุง API ในภายหลัง
      // if (code !== 'Enter Code') await saveGradeToApi(code, grade, status);
    } else if (isFree) {
      const oldCode = row.dataset.code;
      const newCode = row.querySelector('[data-field="code"]').value.trim();
      const name = row.querySelector('[data-field="name"]').value.trim();
      const credit = parseInt(row.querySelector('[data-field="credit"]').value, 10) || 0;

      const index = userData.free_electives.findIndex(c => c.code === oldCode);
      if (index !== -1) {
        userData.free_electives[index] = { code: newCode, name, credit, grade, status };
        if (oldCode !== newCode) {
            row.dataset.code = newCode;
            const gradeSelect = row.querySelector('.grade');
            if (gradeSelect && gradeSelect.dataset.id === oldCode) {
                gradeSelect.dataset.id = newCode;
            }
        }
      }
      // NOTE: Electives/Free Electives ไม่ถูกบันทึกใน API นี้
    } else { // Regular course from curriculum
      if (userData.grades.hasOwnProperty(id)) {
        userData.grades[id].grade = grade;
        userData.grades[id].status = status;
      } else {
        userData.grades[id] = { grade, status, credit: parseInt(row.querySelector('td:nth-child(3)')?.textContent || '0') };
      }
      // *** บันทึกเกรดของวิชาปกติเข้า DB ***
      await saveGradeToApi(id, grade, status);
    }

    renderTables();
  }

   // Saves elective details (code, name, credit) from input change
  function saveElectiveDetailChange(element) {
    // โค้ดส่วนนี้ยังทำงานกับ Local userData เท่านั้น (สำหรับ Electives/Free)
    // การบันทึกเกรดเข้า DB จะเกิดเมื่อมีการเปลี่ยนเกรดใน saveGradeChange
    saveGradeChange(element); 
  }


  // Renders both main course table and elective table based on selection
  function renderTables() {
    // NOTE: Assuming window.MASTER_CURRICULUM is still loaded via curriculum-master.js
    if (typeof window.MASTER_CURRICULUM === 'undefined') {
        mainTbody.innerHTML = `<tr><td colspan="4" class="text-center muted">Error: Curriculum master data not available.</td></tr>`;
        return;
    }

    const selectedYear = parseInt(yearSelect.value, 10);
    const selectedSemester = semesterSelect.value;
    const trackId = userData.info.track_id;
    const studyPlan = userData.info.study_plan;
    const masterCore = window.MASTER_CURRICULUM["CORE"] || {};
    const masterTrack = (trackId && trackId !== "N/A" && window.MASTER_CURRICULUM[trackId]) ? window.MASTER_CURRICULUM[trackId] : {};

    const yearKey = `Year ${selectedYear}`;
    const semesterKey = getSemesterKey(selectedYear, selectedSemester, studyPlan);

    // --- Get Courses for the Main Table ---
    const coreCourses = masterCore[yearKey]?.[`Semester ${selectedSemester}`] || [];
    const trackCourses = masterTrack[yearKey]?.[semesterKey] || [];

    let mainTableCourses = [];
    let electiveSlots = [];

    const combinedCurriculum = [...coreCourses];
    trackCourses.forEach(tc => {
        if (!combinedCurriculum.some(cc => cc.code === tc.code)) {
            combinedCurriculum.push(tc);
        }
    });

    combinedCurriculum.forEach(course => {
        if (course.is_user_entry_slot) {
            electiveSlots.push(course);
        } else {
            mainTableCourses.push(course);
        }
    });

    // --- Render Main Course Table ---
    if (mainTableCourses.length > 0) {
      mainTbody.innerHTML = mainTableCourses.map(course => {
        // ใช้ credit จาก DB (ถ้ามี) หรือใช้จาก Master (ถ้าไม่มี)
        const gradeInfo = userData.grades[course.code];
        const grade = gradeInfo?.grade || '—';
        const credit = gradeInfo?.credit || course.credit; 

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

    // --- Render Elective Entry Table (เหมือนเดิม) ---
    // ... (Elective rendering logic is the same) ...
    let electiveHtml = '';
    // 1. Render slots from the curriculum for this term
    electiveSlots.forEach(slot => {
        const userEntry = userData.user_electives[slot.slot_id];
        const code = userEntry?.code || 'Enter Code';
        const name = userEntry?.name || slot.name;
        const credit = userEntry?.credit || slot.credit || 3;
        const grade = userEntry?.grade || '—';
        electiveHtml += `
          <tr data-slot-id="${slot.slot_id}" data-type="slot">
            <td class="muted">${slot.slot_id} (${slot.type.replace(/_/g, ' ')})</td>
            <td><input type="text" class="inputelec" value="${code}" data-field="code" placeholder="e.g., 0601xxxx" aria-label="Course code for ${slot.slot_id}"></td>
            <td><input type="text" class="inputelec" value="${name}" data-field="name" placeholder="Course Name" aria-label="Course name for ${slot.slot_id}"></td>
            <td><input type="number" class="inputelec" value="${credit}" data-field="credit" min="0" step="1" aria-label="Credit for ${slot.slot_id}"></td>
            <td>${createGradeDropdown(slot.slot_id, grade)}</td>
            <td><button class="btn-sm btn-del" data-action="remove-slot" data-slot-id="${slot.slot_id}" aria-label="Clear elective slot ${slot.slot_id}" disabled>Clear</button></td>
          </tr>
        `;
    });

    // 2. Render free electives added by the user
    userData.free_electives.forEach((course, index) => {
      electiveHtml += `
        <tr data-code="${course.code}" data-type="free" data-index="${index}">
          <td class="muted">Free Elective</td>
          <td><input type="text" class="inputelec" value="${course.code}" data-field="code" placeholder="e.g., 90xxxxxx" aria-label="Course code for free elective ${index + 1}"></td>
          <td><input type="text" class="inputelec" value="${course.name}" data-field="name" placeholder="Course Name" aria-label="Course name for free elective ${index + 1}"></td>
          <td><input type="number" class="inputelec" value="${course.credit}" data-field="credit" min="0" step="1" aria-label="Credit for free elective ${index + 1}"></td>
          <td>${createGradeDropdown(course.code, course.grade)}</td>
          <td><button class="btn-sm btn-del" data-action="remove-free" data-code="${course.code}" aria-label="Remove free elective ${course.code}">Remove</button></td>
        </tr>
      `;
    });

    if (electiveHtml === '') {
        electiveTbody.innerHTML = `<tr><td colspan="6" class="text-center muted">No elective slots or free electives for this term.</td></tr>`;
    } else {
        electiveTbody.innerHTML = electiveHtml;
    }


    // --- Calculate and Update Stats ---
    updateTermStats(mainTableCourses, electiveSlots);
  }

  // Calculates and displays Term GPA, Credits
  function updateTermStats(mainCourses, electiveSlots) {
    let totalCreditAttempted = 0;
    let earnedCredit = 0;
    let totalGradePoints = 0;
    let totalCreditForGPA = 0;

    // 1. Process main curriculum courses
    mainCourses.forEach(course => {
      // ใช้ credit จาก DB (ถ้ามี)
      const gradeInfo = userData.grades[course.code];
      const credit = gradeInfo?.credit || course.credit || 0;
      const grade = gradeInfo?.grade || '—';

      if (credit > 0 && grade !== '—' && grade !== 'W') {
          totalCreditAttempted += credit;
          if (!['F', 'U'].includes(grade)) {
              earnedCredit += credit;
          }
          if (!['S', 'U'].includes(grade)) {
              totalCreditForGPA += credit;
              totalGradePoints += credit * gradeToPoint(grade);
          }
      }
    });

    // 2. Process filled elective slots (Same as original)
    electiveSlots.forEach(slot => {
        const userEntry = userData.user_electives[slot.slot_id];
        if (userEntry && userEntry.code !== 'Enter Code') {
            const credit = userEntry.credit || 0;
            const grade = userEntry.grade || '—';

            if (credit > 0 && grade !== '—' && grade !== 'W') {
                totalCreditAttempted += credit;
                if (!['F', 'U'].includes(grade)) {
                    earnedCredit += credit;
                }
                 if (!['S', 'U'].includes(grade)) {
                    totalCreditForGPA += credit;
                    totalGradePoints += credit * gradeToPoint(grade);
                }
            }
        }
    });


    // 3. Process free electives (Same as original)
    userData.free_electives.forEach(course => {
      const credit = course.credit || 0;
      const grade = course.grade || '—';

      if (credit > 0 && grade !== '—' && grade !== 'W') {
          totalCreditAttempted += credit;
          if (!['F', 'U'].includes(grade)) {
              earnedCredit += credit;
          }
          if (!['S', 'U'].includes(grade)) {
              totalCreditForGPA += credit;
              totalGradePoints += credit * gradeToPoint(grade);
          }
      }
    });

    const termGPA = totalCreditForGPA > 0 ? (totalGradePoints / totalCreditForGPA) : 0;

    termTotalCreditEl.textContent = totalCreditAttempted;
    termEarnedCreditEl.textContent = earnedCredit;
    termGpaEl.textContent = termGPA.toFixed(2);
  }

  // Adds a new row for a free elective (Same as original)
  function addFreeElective() {
    const newCode = `FE-${Date.now().toString().slice(-5)}`;
    userData.free_electives.push({ code: newCode, name: 'New Free Elective', credit: 3, grade: '—', status: '—' });
    renderTables();
  }

  // Removes a free elective (Same as original)
  function removeFreeElective(code) {
      const initialLength = userData.free_electives.length;
      userData.free_electives = userData.free_electives.filter(c => c.code !== code);
      if (userData.free_electives.length < initialLength) {
           renderTables();
      }
  }

  // Clears data for a specific elective slot (Same as original)
  function clearElectiveSlot(slotId) {
      if (userData.user_electives[slotId]) {
           delete userData.user_electives[slotId];
           renderTables();
      }
  }


  // --- Initialization ---
  function initializePage() {
    // Populate header
    document.getElementById('student-badge').textContent = `${userData.info.name || 'N/A'} • ${userData.info.username || 'N/A'}`;
    const trackId = userData.info.track_id;
    // NOTE: Assuming window.TRACKS_INFO is still loaded via curriculum-master.js
    const trackName = (trackId && trackId !== "N/A" && window.TRACKS_INFO && window.TRACKS_INFO[trackId])
                        ? window.TRACKS_INFO[trackId].full_name
                        : '(No Track Selected)';
    document.getElementById('student-track').textContent = `Track: ${trackName}`;

    // Populate Year selector
    const currentYear = userData.info.current_year || 1;
    yearSelect.innerHTML = [...Array(5)].map((_, i) =>
      `<option value="${i + 1}" ${i + 1 === currentYear ? 'selected' : ''}>Year ${i + 1}</option>`
    ).join('');

    // Populate Semester selector
    const currentSemester = userData.info.current_semester || '1';
    semesterSelect.innerHTML = `
      <option value="1" ${currentSemester === '1' ? 'selected' : ''}>1</option>
      <option value="2" ${currentSemester === '2' ? 'selected' : ''}>2</option>
      <option value="summer" ${currentSemester === 'summer' ? 'selected' : ''}>Summer</option>
    `;

    // Populate and disable Track selector
    if (trackId && trackId !== "N/A" && window.TRACKS_INFO && window.TRACKS_INFO[trackId]) {
      trackSelect.innerHTML = `<option value="${trackId}">${trackName}</option>`;
      trackSelect.value = trackId;
    } else {
      trackSelect.innerHTML = `<option value="">(No Track)</option>`;
    }

    // Add event listeners
    yearSelect.addEventListener('change', renderTables);
    semesterSelect.addEventListener('change', renderTables);
    addFreeElectiveBtn.addEventListener('click', addFreeElective);

    // Event delegation for dynamic elements (grades, inputs, remove buttons)
    document.body.addEventListener('change', function(event) {
        if (event.target.matches('.grade')) {
            saveGradeChange(event.target);
        } else if (event.target.matches('.inputelec')) {
            saveElectiveDetailChange(event.target);
        }
    });

     document.body.addEventListener('click', function(event) {
         const action = event.target.dataset.action;
         if (action === 'remove-free') {
             const code = event.target.dataset.code;
             if (code && confirm(`Remove free elective ${code}?`)) {
                 removeFreeElective(code);
             }
         }
     });

    // Initial render
    renderTables();
  }

  // Run initialization
  initializePage();
});