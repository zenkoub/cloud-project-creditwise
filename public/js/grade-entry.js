document.addEventListener('DOMContentLoaded', () => {
  // --- Global Variables & Initial Setup ---
  const userData = getCurrentUserData(); // Assumes Auth Guard ran

  // Defensive coding: Ensure necessary data exists
  if (!userData.grades) userData.grades = {};
  if (!userData.user_electives) userData.user_electives = {};
  if (!userData.free_electives) userData.free_electives = [];

  const GRADE_OPTIONS = ['—', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F', 'W', 'S', 'U'];

  // Cache DOM elements
  const yearSelect = document.getElementById('sel-year');
  const semesterSelect = document.getElementById('sel-semester');
  const trackSelect = document.getElementById('sel-track');
  const mainTbody = document.getElementById('grade-entry-body');
  const electiveTbody = document.getElementById('elective-entry-body');
  const addFreeElectiveBtn = document.getElementById('add-free-elective-btn');
  const termTotalCreditEl = document.getElementById('term-total-credit');
  const termEarnedCreditEl = document.getElementById('term-earned-credit');
  const termGpaEl = document.getElementById('term-gpa');

  // --- Helper Functions ---
  function gradeToPoint(grade) {
    // S/U grades don't contribute to GPA calculation points
    const map = { "A": 4.0, "B+": 3.5, "B": 3.0, "C+": 2.5, "C": 2.0, "D+": 1.5, "D": 1.0, "F": 0.0 };
    return map[grade] ?? 0.0; // Return 0.0 if grade is not in map (like W, S, U, —)
  }

  function getStatusFromGrade(grade) {
      if (['F', 'W', 'U', '—'].includes(grade)) return grade;
      if (['A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'S'].includes(grade)) return 'Passed';
      return '—'; // Default or unknown status
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

    // Apply Co-op/Non-Co-op suffix based on rules
    if (year === 3 || year === 4) {
      const planSuffix = ` (${studyPlan === "Co-op" ? 'Co-op' : 'Non-Co-op'})`;
      // Apply suffix usually to Semester 2 and Summer, and specific Year 4 Sem 1 cases
      if (semester === "2" || semester.toLowerCase() === 'summer') {
          semesterKey = `Semester 2${planSuffix}`;
      } else if (year === 4 && semester === "1") {
          semesterKey = `Semester 1${planSuffix}`;
      }
      // Year 3 Sem 1 typically doesn't have suffix, handled implicitly
    }
    return semesterKey;
  }

  // --- Core Logic Functions ---

  // Saves grade from dropdown/input change
  function saveGradeChange(element) {
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
    } else if (isFree) {
      const oldCode = row.dataset.code; // Use original code as key initially
      const newCode = row.querySelector('[data-field="code"]').value.trim(); // Get potentially new code
      const name = row.querySelector('[data-field="name"]').value.trim();
      const credit = parseInt(row.querySelector('[data-field="credit"]').value, 10) || 0;

      const index = userData.free_electives.findIndex(c => c.code === oldCode);
      if (index !== -1) {
        // Update existing free elective, including potentially its code
        userData.free_electives[index] = { code: newCode, name, credit, grade, status };
        // Update the row's data-code attribute if the code changed
        if (oldCode !== newCode) {
            row.dataset.code = newCode;
            // Update the grade dropdown data-id as well if it uses code
            const gradeSelect = row.querySelector('.grade');
            if (gradeSelect && gradeSelect.dataset.id === oldCode) {
                gradeSelect.dataset.id = newCode;
            }
        }
      }
    } else { // Regular course from curriculum
      if (userData.grades.hasOwnProperty(id)) {
        userData.grades[id].grade = grade;
        userData.grades[id].status = status;
      } else {
        // Handle case where grade might not exist yet (though unlikely if rendered)
        userData.grades[id] = { grade, status, credit: parseInt(row.querySelector('td:nth-child(3)')?.textContent || '0') };
      }
    }

    // After saving any change, re-render everything to reflect updates and recalculate stats
    // Consider optimizing later if performance becomes an issue
    renderTables();
  }

   // Saves elective details (code, name, credit) from input change
  function saveElectiveDetailChange(element) {
    const row = element.closest('tr');
    const type = row.dataset.type;
    const gradeSelect = row.querySelector('.grade');
    const grade = gradeSelect ? gradeSelect.value : '—'; // Get current grade from dropdown

    if (type === 'slot') {
        const slotId = row.dataset.slotId;
        saveGradeChange(element); // Let saveGradeChange handle saving slot details
    } else if (type === 'free') {
        const oldCode = row.dataset.code;
        saveGradeChange(element); // Let saveGradeChange handle saving free elective details
    }
  }


  // Renders both main course table and elective table based on selection
  function renderTables() {
    const selectedYear = parseInt(yearSelect.value, 10);
    const selectedSemester = semesterSelect.value; // Keep as string ('1', '2', 'summer')
    const trackId = userData.info.track_id;
    const studyPlan = userData.info.study_plan;
    const masterCore = window.MASTER_CURRICULUM["CORE"] || {};
    const masterTrack = (trackId && trackId !== "N/A" && window.MASTER_CURRICULUM[trackId]) ? window.MASTER_CURRICULUM[trackId] : {};

    const yearKey = `Year ${selectedYear}`;
    const semesterKey = getSemesterKey(selectedYear, selectedSemester, studyPlan);

    // --- Get Courses for the Main Table ---
    const coreCourses = masterCore[yearKey]?.[`Semester ${selectedSemester}`] || []; // Core uses simple sem key
    const trackCourses = masterTrack[yearKey]?.[semesterKey] || [];

    // Combine, excluding slots and duplicates
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
            electiveSlots.push(course); // Keep slots separate for elective table
        } else {
            mainTableCourses.push(course);
        }
    });

    // --- Render Main Course Table ---
    if (mainTableCourses.length > 0) {
      mainTbody.innerHTML = mainTableCourses.map(course => {
        const gradeInfo = userData.grades[course.code];
        const grade = gradeInfo?.grade || '—';
        return `
          <tr data-code="${course.code}" data-type="main">
            <td>${course.code}</td>
            <td style="text-align: left;">${course.name}</td>
            <td>${course.credit}</td>
            <td>${createGradeDropdown(course.code, grade)}</td>
          </tr>
        `;
      }).join('');
    } else {
      mainTbody.innerHTML = `<tr><td colspan="4" class="text-center muted">No required courses for this term.</td></tr>`;
    }

    // --- Render Elective Entry Table ---
    let electiveHtml = '';
    // 1. Render slots from the curriculum for this term
    electiveSlots.forEach(slot => {
        const userEntry = userData.user_electives[slot.slot_id];
        const code = userEntry?.code || 'Enter Code';
        const name = userEntry?.name || slot.name; // Default to slot name
        const credit = userEntry?.credit || slot.credit || 3; // Default credit
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
      const credit = course.credit || 0;
      const gradeInfo = userData.grades[course.code];
      const grade = gradeInfo?.grade || '—';

      if (credit > 0 && grade !== '—' && grade !== 'W') { // Count attempted if not withdrawn or pending
          totalCreditAttempted += credit;
          if (!['F', 'U'].includes(grade)) { // Count earned if passed (A-D, S)
              earnedCredit += credit;
          }
          if (!['S', 'U'].includes(grade)) { // Count for GPA if not S/U
              totalCreditForGPA += credit;
              totalGradePoints += credit * gradeToPoint(grade);
          }
      }
    });

    // 2. Process filled elective slots
    electiveSlots.forEach(slot => {
        const userEntry = userData.user_electives[slot.slot_id];
        if (userEntry && userEntry.code !== 'Enter Code') { // Only count if filled
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


    // 3. Process free electives
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

    // Optional: Add credit limit check (can be noisy)
    // const remainingTotalCredit = 144; // Example total needed
    // const isFinalYear = (parseInt(yearSelect.value) === 4);
    // checkCreditLimit(totalCreditAttempted, yearSelect.value, semesterSelect.value, remainingTotalCredit, isFinalYear);
  }

  // Adds a new row for a free elective
  function addFreeElective() {
    // Generate a somewhat unique placeholder code
    const newCode = `FE-${Date.now().toString().slice(-5)}`;
    userData.free_electives.push({ code: newCode, name: 'New Free Elective', credit: 3, grade: '—', status: '—' });
    renderTables(); // Re-render to show the new row
  }

  // Removes a free elective
  function removeFreeElective(code) {
      const initialLength = userData.free_electives.length;
      userData.free_electives = userData.free_electives.filter(c => c.code !== code);
      if (userData.free_electives.length < initialLength) {
           renderTables(); // Re-render only if something was removed
      }
  }

  // Clears data for a specific elective slot (sets back to default placeholder)
  function clearElectiveSlot(slotId) {
      if (userData.user_electives[slotId]) {
           delete userData.user_electives[slotId];
           renderTables(); // Re-render to show placeholder again
      }
  }


  // --- Initialization ---
  function initializePage() {
    // Populate header
    document.getElementById('student-badge').textContent = `${userData.info.name || 'N/A'} • ${userData.info.id || 'N/A'}`;
    const trackId = userData.info.track_id;
    const trackName = (trackId && trackId !== "N/A" && window.TRACKS_INFO && window.TRACKS_INFO[trackId])
                        ? window.TRACKS_INFO[trackId].full_name
                        : '(No Track Selected)';
    document.getElementById('student-track').textContent = `Track: ${trackName}`;

    // Populate Year selector
    const currentYear = userData.info.current_year || 1;
    yearSelect.innerHTML = [...Array(5)].map((_, i) => // Allow up to Year 5
      `<option value="${i + 1}" ${i + 1 === currentYear ? 'selected' : ''}>Year ${i + 1}</option>`
    ).join('');

    // Populate Semester selector
    const currentSemester = userData.info.current_semester || '1';
    semesterSelect.innerHTML = `
      <option value="1" ${currentSemester === '1' ? 'selected' : ''}>1</option>
      <option value="2" ${currentSemester === '2' ? 'selected' : ''}>2</option>
      <option value="summer" ${currentSemester === 'summer' ? 'selected' : ''}>Summer</option>
    `;

    // Populate and disable Track selector (display only)
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
         } else if (action === 'remove-slot') {
             // Currently disabled, but logic would be:
             // const slotId = event.target.dataset.slotId;
             // if (slotId && confirm(`Clear data for slot ${slotId}?`)) {
             //     clearElectiveSlot(slotId);
             // }
         }
     });


    // Initial render
    renderTables();
  }

  // Run initialization
  initializePage();
});