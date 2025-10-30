// public/js/curriculum-display.js

async function renderCurriculum() {
  const container = document.getElementById("curriculum-container");
  container.innerHTML = `<p class="text-center muted">Loading curriculum...</p>`;

  const token = localStorage.getItem("cw_token");
  if (!token) {
    console.error("❌ No token found — redirecting to login.");
    window.location.href = "/login.html";
    return;
  }

  try {
    // ✅ 1. Fetch user profile + grades
    const userRes = await fetch("/api/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!userRes.ok) {
      const text = await userRes.text();
      console.error("❌ Failed to fetch user info:", userRes.status, text);
      container.innerHTML = `<p class="text-center text-red">❌ โหลดข้อมูลผู้ใช้ไม่สำเร็จ (${userRes.status})</p>`;
      return;
    }

    const userData = await userRes.json();
    console.log("✅ Loaded user data:", userData);

    // Update header (student name & track) if present in DOM
    const badgeEl = document.getElementById('student-badge');
    const trackEl = document.getElementById('student-track');
    try {
      if (badgeEl) badgeEl.textContent = userData.info?.name || userData.info?.username || '(Student)';
      const trackFull = userData.info?.track_full_name || userData.info?.track || userData.info?.track_id || 'N/A';
      if (trackEl) trackEl.textContent = `Track: ${trackFull}`;
    } catch (e) {
      console.warn('Could not set header info:', e);
    }

    // ✅ 2. Get curriculum from server (uses DB `courses` + `user_grades`)
    const courseRes = await fetch('/api/users/me/curriculum', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!courseRes.ok) {
      const text = await courseRes.text();
      console.error('❌ Failed to load curriculum from API:', courseRes.status, text);
      container.innerHTML = `<p class="text-center text-red">❌ โหลดหลักสูตรไม่สำเร็จ (${courseRes.status})</p>`;
      return;
    }

  const rows = await courseRes.json();
  console.log('✅ /api/users/me/curriculum returned', rows.length, 'rows');
    // rows: [{ code, name, credit, credit_format, type, track_id, year, semester, grade, status }, ...]
    const allCourses = rows.map(r => ({
      code: r.code,
      name: r.name,
      credit: r.credit,
      credit_format: r.credit_format,
      type: r.type,
      track: r.track_id || 'CORE',
      year: Number(r.year) || 0,
      semester: Number(r.semester) || 0,
      grade: r.grade ?? null,
      status: r.status ?? null
    }));

    if (!allCourses || allCourses.length === 0) {
      container.innerHTML = `<p class="text-center muted">ไม่พบข้อมูลหลักสูตร</p>`;
      return;
    }

    // ✅ 3. แบ่งหลักสูตรตามปี/เทอม
    const grouped = {};
    allCourses.forEach((c) => {
      const year = `Year ${c.year}`;
      const sem = `Semester ${c.semester}`;
      if (!grouped[year]) grouped[year] = {};
      if (!grouped[year][sem]) grouped[year][sem] = [];
      grouped[year][sem].push(c);
    });

    let htmlContent = "";
    const years = Object.keys(grouped).sort((a, b) => {
      const na = parseInt(a.split(' ')[1]) || 0;
      const nb = parseInt(b.split(' ')[1]) || 0;
      return na - nb;
    });

    years.forEach((year) => {
      const semesters = Object.keys(grouped[year]).sort((a, b) => {
        const sa = parseInt(a.split(' ')[1]) || 0;
        const sb = parseInt(b.split(' ')[1]) || 0;
        return sa - sb;
      });
      semesters.forEach((sem) => {
        const courses = grouped[year][sem];
        htmlContent += generateSemesterTable(year, sem, courses, userData);
      });
    });

    // ✅ 4. Free Electives (วิชาเลือกเสรี)
    if (userData.free_electives?.length > 0) {
      htmlContent += generateFreeElectivesTable(userData.free_electives);
    }

    container.innerHTML =
      htmlContent || `<p class="text-center muted">No curriculum data available.</p>`;
  } catch (err) {
    console.error("❌ renderCurriculum() Error:", err);
    container.innerHTML = `<p class="text-center text-red">❌ เกิดข้อผิดพลาดในการโหลดข้อมูล</p>`;
  }
}

// ===== ตารางรายวิชา =====
function generateSemesterTable(year, semesterKey, courses, userData) {
  const tblHead = `${year} • ${semesterKey}`;
  let tableRows = "";

  courses.forEach((course) => {
    // grade/status may come either from the course row (server merged) or from userData.grades
    const gradeFromRow = course.grade ?? null;
    const statusFromRow = course.status ?? null;
    const gradeInfo = userData.grades?.[course.code] || {};
    const grade = gradeFromRow ?? gradeInfo.grade ?? "—";
    const status = statusFromRow ?? gradeInfo.status ?? "—";

    let statusClass = "none";
    if (["Passed", "S"].includes(status)) statusClass = "pass";
    else if (["Withdrawn", "W"].includes(status)) statusClass = "wait";
    else if (["Failed", "F", "U"].includes(status)) statusClass = "fail";

    tableRows += `
      <tr>
        <td>${course.code}</td>
        <td style="text-align: left;">${course.name}</td>
        <td>${course.credit}</td>
        <td>${grade}</td>
        <td><span class="ic ${statusClass}"><span class="dot"></span>${status}</span></td>
      </tr>`;
  });

  return `
    <div class="tbl-head">${tblHead}</div>
    <table>
      <thead>
        <tr>
          <th style="width:15%">Course Code</th>
          <th style="width:45%; text-align: left;">Course Name</th>
          <th style="width:10%">Credit</th>
          <th style="width:10%">Grade</th>
          <th style="width:20%">Status</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>`;
}

// ===== Free Electives =====
function generateFreeElectivesTable(freeElectives) {
  let tableRows = "";
  freeElectives.forEach((course) => {
    const grade = course.grade || "—";
    const status = course.status || "—";

    let statusClass = "none";
    if (["Passed", "S"].includes(status)) statusClass = "pass";
    else if (["Withdrawn", "W"].includes(status)) statusClass = "wait";
    else if (["Failed", "F", "U"].includes(status)) statusClass = "fail";

    tableRows += `
      <tr>
        <td>${course.code}</td>
        <td style="text-align: left;">${course.name}</td>
        <td>${course.credit}</td>
        <td>${grade}</td>
        <td><span class="ic ${statusClass}"><span class="dot"></span>${status}</span></td>
      </tr>`;
  });

  return `
    <div class="tbl-head">Free Electives</div>
    <table>
      <thead>
        <tr>
          <th style="width:15%">Course Code</th>
          <th style="width:45%; text-align: left;">Course Name</th>
          <th style="width:10%">Credit</th>
          <th style="width:10%">Grade</th>
          <th style="width:20%">Status</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>`;
}

// ===== เริ่มเมื่อโหลดหน้าเว็บ =====
document.addEventListener("DOMContentLoaded", renderCurriculum);
