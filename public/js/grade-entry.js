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
        is_user_entry_slot: r.is_user_entry_slot || false
      }));
      console.log('Loaded curriculum into window.__dbCourses:', window.__dbCourses.length, 'rows');
    } else {
      console.warn('Could not load /api/users/me/curriculum for grade-entry:', resp.status);
      window.__dbCourses = [];
    }
  } catch (err) {
    console.error('Error loading curriculum for grade-entry:', err);
    window.__dbCourses = [];
  }

  if (!userData.grades) userData.grades = {};
  if (!userData.user_electives) userData.user_electives = {};
  if (!userData.free_electives) userData.free_electives = []; // these objects now include year/semester when created

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
      userData.user_electives[slotId] = { code, name, credit, grade, status, slot_id: slotId, is_user_entry_slot: true };
      if (code && code !== 'Enter Code') {
        saveGradeToApi._extra = saveGradeToApi._extra || {};
        saveGradeToApi._extra[code] = { course_name: name, credit: credit, type: 'Gen_Elective', track_id: userData.info.track_id };
        await saveGradeToApi(code, grade, status);
      }
    } else if (type === 'free') {
      const oldCode = row.dataset.code;
      const newCode = row.querySelector('[data-field="code"]').value.trim();
      const name = row.querySelector('[data-field="name"]').value.trim();
      const credit = parseInt(row.querySelector('[data-field="credit"]')?.value, 10) || 0;
      const selYear = parseInt(yearSelect.value, 10);
      const selSemesterRaw = semesterSelect.value;
      const selSemester = selSemesterRaw === 'summer' ? 0 : Number(selSemesterRaw);

      const index = userData.free_electives.findIndex(c => c.code === oldCode);
      const freeObj = { code: newCode, name, credit, grade, status, year: selYear, semester: selSemester };
      if (index !== -1) userData.free_electives[index] = freeObj; else userData.free_electives.push(freeObj);

      if (newCode && newCode !== 'Enter Code') {
        saveGradeToApi._extra = saveGradeToApi._extra || {};
        saveGradeToApi._extra[newCode] = { course_name: name, credit: credit, type: 'Free_Elective', track_id: userData.info.track_id, year: selYear, semester: selSemester };
        await saveGradeToApi(newCode, grade, status);
      }
    } else { // main course
      if (userData.grades.hasOwnProperty(id)) {
        userData.grades[id].grade = grade;
        userData.grades[id].status = status;
      } else {
        userData.grades[id] = { grade, status, credit: parseInt(row.querySelector('td:nth-child(3)')?.textContent || '0') };
      }
      await saveGradeToApi(id, grade, status);
    }

    renderTables();
  }

  function saveElectiveDetailChange(element) {
    const row = element.closest('tr');
    const type = row?.dataset.type;
    if (type === 'slot') {
      const slotId = row.dataset.slotId;
      const code = row.querySelector('[data-field="code"]').value.trim();
      const name = row.querySelector('[data-field="name"]').value.trim();
      const credit = parseInt(row.querySelector('[data-field="credit"]')?.value, 10) || 0;
      userData.user_electives[slotId] = { ...(userData.user_electives[slotId] || {}), code, name, credit };
    } else if (type === 'free') {
      const code = row.dataset.code || row.querySelector('[data-field="code"]').value.trim();
      const index = userData.free_electives.findIndex(c => c.code === code);
      if (index !== -1) {
        userData.free_electives[index].code = row.querySelector('[data-field="code"]')?.value.trim();
        userData.free_electives[index].name = row.querySelector('[data-field="name"]')?.value.trim();
        userData.free_electives[index].credit = parseInt(row.querySelector('[data-field="credit"]')?.value, 10) || 0;
      }
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

    if (window.__dbCourses && Array.isArray(window.__dbCourses) && window.__dbCourses.length > 0) {
      const candidates = window.__dbCourses.filter(c => {
        const sameYear = Number(c.year) === selectedYear;
        const sameSem = Number(c.semester) === selectedSemester;
        const isCore = c.track_id === 'CORE' || c.track_id === 'ALL';
        const isUserTrack = c.track_id === trackId;
        return sameYear && sameSem && (isCore || isUserTrack);
      });

      candidates.forEach((c, idx) => {
        const cType = (c.type || '').toString();
        const isUserSlot = !!c.is_user_entry_slot;
        const isGen = cType === 'Gen_Elective' || cType === 'Gen';
        const isFree = cType === 'Free_Elective' || cType === 'Free';

        if (isUserSlot) {
          const slotId = c.slot_id || `SLOT_USER_${c.code || idx}`;
          electiveSlots.push({ slot_id: slotId, type: c.type || 'Elective', name: c.name, credit: c.credit || 3, is_user_entry_slot: true, code: c.code || null, editable: !(c.code && !/x+/i.test(c.code)) });
        } else if (isGen || isFree) {
          const safeCode = c.code && !/x+/i.test(c.code) ? c.code : null;
          const slotId = safeCode || `SLOT_${(cType || 'ELECT').replace(/[^A-Z0-9]/ig, '')}_${c.year}_${c.semester}_${idx}`;
          electiveSlots.push({ slot_id: slotId, type: cType === 'Gen_Elective' ? 'Gen_Elective' : (cType === 'Free_Elective' ? 'Free_Elective' : cType), name: c.name || (isGen ? 'General Elective' : 'Free Elective'), credit: c.credit || 3, is_user_entry_slot: true, code: safeCode, editable: !safeCode });
        } else {
          mainTableCourses.push(c);
        }
      });
    } else if (typeof window.MASTER_CURRICULUM !== 'undefined') {
      const yearKey = `Year ${selectedYear}`;
      const semesterKey = getSemesterKey(selectedYear, selectedSemesterRaw, studyPlan);
      const masterCore = window.MASTER_CURRICULUM['CORE'] || {};
      const masterTrack = (trackId && trackId !== 'N/A' && window.MASTER_CURRICULUM[trackId]) ? window.MASTER_CURRICULUM[trackId] : {};
      const coreCourses = masterCore[yearKey]?.[`Semester ${selectedSemesterRaw}`] || [];
      const trackCourses = masterTrack[yearKey]?.[semesterKey] || [];
      const combinedCurriculum = [...coreCourses];
      trackCourses.forEach(tc => { if (!combinedCurriculum.some(cc => cc.code === tc.code)) combinedCurriculum.push(tc); });
      combinedCurriculum.forEach(course => { if (course.is_user_entry_slot) electiveSlots.push(course); else mainTableCourses.push(course); });
    } else {
      mainTbody.innerHTML = `<tr><td colspan="4" class="text-center muted">No curriculum data available for this term.</td></tr>`;
      electiveTbody.innerHTML = '';
      return;
    }

    if (mainTableCourses.length > 0) {
      mainTbody.innerHTML = mainTableCourses.map(course => {
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

    let electiveHtml = '';

    electiveSlots.forEach(slot => {
      const userEntry = userData.user_electives[slot.slot_id];
      const codeVal = userEntry?.code || slot.code || 'Enter Code';
      const nameVal = userEntry?.name || slot.name;
      const creditVal = userEntry?.credit || slot.credit || 3;
      const gradeVal = userEntry?.grade || (codeVal && userData.grades[codeVal]?.grade) || '—';

      if (slot.code && !slot.editable) {
        electiveHtml += `
          <tr data-slot-id="${slot.slot_id}" data-type="slot">
            <td class="muted">${slot.slot_id} (${slot.type.replace(/_/g, ' ')})</td>
            <td><input type="text" class="inputelec" value="${codeVal}" data-field="code" readonly aria-label="Course code for ${slot.slot_id}"></td>
            <td><input type="text" class="inputelec" value="${nameVal}" data-field="name" readonly aria-label="Course name for ${slot.slot_id}"></td>
            <td><input type="number" class="inputelec" value="${creditVal}" data-field="credit" min="0" step="1" readonly aria-label="Credit for ${slot.slot_id}"></td>
            <td>${createGradeDropdown(slot.slot_id, gradeVal)}</td>
            <td><button class="btn-sm btn-del" data-action="remove-slot" data-slot-id="${slot.slot_id}" disabled>Clear</button></td>
          </tr>
        `;
      } else {
        electiveHtml += `
          <tr data-slot-id="${slot.slot_id}" data-type="slot">
            <td class="muted">${slot.slot_id} (${slot.type.replace(/_/g, ' ')})</td>
            <td><input type="text" class="inputelec" value="${codeVal}" data-field="code" placeholder="e.g., 0601xxxx" aria-label="Course code for ${slot.slot_id}"></td>
            <td><input type="text" class="inputelec" value="${nameVal}" data-field="name" placeholder="Course Name" aria-label="Course name for ${slot.slot_id}"></td>
            <td><input type="number" class="inputelec" value="${creditVal}" data-field="credit" min="0" step="1" aria-label="Credit for ${slot.slot_id}"></td>
            <td>${createGradeDropdown(slot.slot_id, gradeVal)}</td>
            <td><button class="btn-sm btn-del" data-action="remove-slot" data-slot-id="${slot.slot_id}" disabled>Clear</button></td>
          </tr>
        `;
      }
    });

    const termFree = userData.free_electives.filter(f => Number(f.year) === selectedYear && Number(f.semester) === selectedSemester);
    termFree.forEach((course, index) => {
      electiveHtml += `
        <tr data-code="${course.code}" data-type="free" data-index="${index}">
          <td class="muted">Free Elective</td>
          <td><input type="text" class="inputelec" value="${course.code}" data-field="code" placeholder="e.g., 90xxxxxx" aria-label="Course code for free elective ${index + 1}"></td>
          <td><input type="text" class="inputelec" value="${course.name}" data-field="name" placeholder="Course Name" aria-label="Course name for free elective ${index + 1}"></td>
          <td><input type="number" class="inputelec" value="${course.credit}" data-field="credit" min="0" step="1" aria-label="Credit for free elective ${index + 1}"></td>
          <td>${createGradeDropdown(course.code, course.grade || '—')}</td>
          <td><button class="btn-sm btn-del" data-action="remove-free" data-code="${course.code}">Remove</button></td>
        </tr>
      `;
    });

    if (!electiveHtml) electiveTbody.innerHTML = `<tr><td colspan="6" class="text-center muted">No elective slots or free electives for this term.</td></tr>`; else electiveTbody.innerHTML = electiveHtml;

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

    mainCourses.forEach(course => {
      const gradeInfo = userData.grades[course.code];
      const credit = gradeInfo?.credit || course.credit || 0;
      const grade = gradeInfo?.grade || '—';
      if (credit > 0 && grade !== '—' && grade !== 'W') {
        totalCreditAttempted += credit;
        if (!['F', 'U'].includes(grade)) earnedCredit += credit;
        if (!['S', 'U'].includes(grade)) { totalCreditForGPA += credit; totalGradePoints += credit * (gradeToPoint(grade) || 0); }
      }
    });

    electiveSlots.forEach(slot => {
      const userEntry = userData.user_electives[slot.slot_id];
      const codeToCheck = userEntry?.code || slot.code;
      const grade = (userEntry && userEntry.grade) || (codeToCheck && userData.grades[codeToCheck]?.grade) || '—';
      const credit = (userEntry && userEntry.credit) || slot.credit || 0;
      if (credit > 0 && grade !== '—' && grade !== 'W') {
        totalCreditAttempted += credit;
        if (!['F', 'U'].includes(grade)) earnedCredit += credit;
        if (!['S', 'U'].includes(grade)) { totalCreditForGPA += credit; totalGradePoints += credit * (gradeToPoint(grade) || 0); }
      }
    });

    const termFree = userData.free_electives.filter(f => Number(f.year) === selectedYear && Number(f.semester) === selectedSemester);
    termFree.forEach(course => {
      const credit = course.credit || 0;
      const grade = course.grade || '—';
      if (credit > 0 && grade !== '—' && grade !== 'W') {
        totalCreditAttempted += credit;
        if (!['F', 'U'].includes(grade)) earnedCredit += credit;
        if (!['S', 'U'].includes(grade)) { totalCreditForGPA += credit; totalGradePoints += credit * (gradeToPoint(grade) || 0); }
      }
    });

    const termGPA = totalCreditForGPA > 0 ? (totalGradePoints / totalCreditForGPA) : 0;
    termTotalCreditEl.textContent = totalCreditAttempted;
    termEarnedCreditEl.textContent = earnedCredit;
    termGpaEl.textContent = termGPA.toFixed(2);
  }

  function addFreeElective() {
    const newCode = `FE-${Date.now().toString().slice(-5)}`;
    const selYear = parseInt(yearSelect.value, 10);
    const selSemesterRaw = semesterSelect.value;
    const selSemester = selSemesterRaw === 'summer' ? 0 : Number(selSemesterRaw);
    userData.free_electives.push({ code: newCode, name: 'New Free Elective', credit: 3, grade: '—', status: '—', year: selYear, semester: selSemester });
    renderTables();
  }

  function removeFreeElective(code) {
    const initialLength = userData.free_electives.length;
    userData.free_electives = userData.free_electives.filter(c => c.code !== code);
    if (userData.free_electives.length < initialLength) renderTables();
  }

  function clearElectiveSlot(slotId) { if (userData.user_electives[slotId]) { delete userData.user_electives[slotId]; renderTables(); } }

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
      <option value="summer" ${currentSemester === 'summer' ? 'selected' : ''}>Summer</option>
    `;

    if (trackId && trackId !== 'N/A') { const label = trackName && trackName !== '(No Track Selected)' ? trackName : trackId; trackSelect.innerHTML = `<option value="${trackId}">${label}</option>`; trackSelect.value = trackId; trackSelect.disabled = true; } else { trackSelect.innerHTML = `<option value="">(No Track)</option>`; trackSelect.disabled = true; }

    yearSelect.addEventListener('change', renderTables);
    semesterSelect.addEventListener('change', renderTables);
    addFreeElectiveBtn.addEventListener('click', addFreeElective);

    document.body.addEventListener('change', function (event) { if (event.target.matches('.grade')) saveGradeChange(event.target); else if (event.target.matches('.inputelec')) saveElectiveDetailChange(event.target); });

    document.body.addEventListener('click', function (event) { const action = event.target.dataset.action; if (action === 'remove-free') { const code = event.target.dataset.code; if (code && confirm(`Remove free elective ${code}?`)) removeFreeElective(code); } });

    renderTables();
  }

  initializePage();
});