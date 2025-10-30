// public/js/curriculum-display.js

// *** แก้ฟังก์ชันนี้ให้เป็น async ***
async function renderCurriculum() {
  const userData = await getCurrentUserData(); // <<< เปลี่ยนเป็น await
  if (!userData) return;

  // Defensive coding: Ensure necessary data exists, provide defaults
  if (!userData.grades) userData.grades = {};
  if (!userData.user_electives) userData.user_electives = {};
  if (!userData.free_electives) userData.free_electives = [];

  const trackId = userData.info.track_id;
  const studyPlan = userData.info.study_plan || "Non-Co-op";
  const container = document.getElementById("curriculum-container");

  // Update header info
  document.getElementById("student-badge").textContent =
    `${userData.info.name || 'N/A'} • ${userData.info.username || 'N/A'}`;

  // NOTE: Assuming window.TRACKS_INFO is still loaded via curriculum-master.js
  const trackName = (trackId && trackId !== "N/A" && window.TRACKS_INFO && window.TRACKS_INFO[trackId])
                    ? window.TRACKS_INFO[trackId].full_name
                    : '(No Track Selected)';
  document.getElementById("student-track").textContent =
    `Track: ${trackName} (${studyPlan})`;
    
  // --- Start Building HTML ---
  let htmlContent = "";

  // NOTE: เราไม่มี MASTER_CURRICULUM client-side แล้ว
  // ในเวอร์ชั่นนี้ เราต้องถือว่า ข้อมูลหลักสูตรทั้งหมด
  // ถูกส่งมาจาก API ในรูปแบบที่จัดเรียงแล้ว หรือต้องโหลดแยก
  // แต่เนื่องจากโค้ดเดิมพึ่งพา MASTER_CURRICULUM มาก
  // เราจะ *สมมติ* ว่า MASTER_CURRICULUM ถูกโหลดไว้ก่อนแล้ว
  // (อาจจะยังใช้ curriculum-master.js หรือโหลด API อื่น)
  if (typeof window.MASTER_CURRICULUM === 'undefined') {
       container.innerHTML = `<p class="text-center muted">Error: Curriculum master data not loaded. (Missing MASTER_CURRICULUM)</p>`;
       return;
  }
  
  const masterCore = window.MASTER_CURRICULUM["CORE"] || {};
  const masterTrack = window.MASTER_CURRICULUM[trackId] || {};


  // Student has a track selected
  const years = ["Year 1", "Year 2", "Year 3", "Year 4"];

  years.forEach(year => {
    const coreYear = masterCore[year] || {};
    const trackYear = masterTrack[year] || {};
    // Combine semester keys from both Core and Track, sort them
    const allSemesterKeys = Array.from(new Set([
      ...Object.keys(coreYear),
      ...Object.keys(trackYear),
    ])).sort();

    allSemesterKeys.forEach(semesterKey => {
      // Filter out semesters not relevant to the student's study plan (Co-op/Non-Co-op)
      if (year === "Year 3" || year === "Year 4") {
        const isCoopKey = semesterKey.includes("(Co-op)");
        const isNonCoopKey = semesterKey.includes("(Non-Co-op)");
        if (studyPlan === "Co-op" && isNonCoopKey) return;
        if (studyPlan === "Non-Co-op" && isCoopKey) return;
      }

      const coreCourses = coreYear[semesterKey] || [];
      const trackCourses = trackYear[semesterKey] || [];

      // Combine courses, avoiding duplicates based on course code
      const combinedCourses = [...coreCourses];
      trackCourses.forEach(tc => {
        if (!combinedCourses.some(cc => cc.code === tc.code)) {
          combinedCourses.push(tc);
        }
      });

      if (combinedCourses.length > 0) {
        htmlContent += generateSemesterTable(year, semesterKey, combinedCourses, userData);
      }
    });
  });


  // --- Add Free Electives Table (if any) ---
  if (userData.free_electives.length > 0) {
    htmlContent += generateFreeElectivesTable(userData.free_electives);
  }

  // --- Render the final HTML ---
  container.innerHTML = htmlContent || `<p class="text-center muted">No curriculum data to display for the selected track/year.</p>`;
}

// ... (generateSemesterTable และ generateFreeElectivesTable เหมือนเดิม) ...
function generateSemesterTable(year, semesterKey, courses, userData) {
    const displaySemester = semesterKey.replace(/\s*\([^)]*\)/g, "");
    const tblHead = `${year} • ${displaySemester}`;
    let tableRows = "";

    courses.forEach((course) => {
      let finalCourse = { ...course };
      let gradeInfo = userData.grades[course.code];

      if (course.is_user_entry_slot && userData.user_electives[course.slot_id]) {
        const userElec = userData.user_electives[course.slot_id];
        finalCourse.code = userElec.code || course.code;
        finalCourse.name = userElec.name || course.name;
        finalCourse.credit = userElec.credit || course.credit;
        gradeInfo = userElec;
      }

      const grade = gradeInfo?.grade || "—";
      const status = gradeInfo?.status || "—";
      let statusClass = "none";
      if (status === "Passed" || status === "Paased" || status === "S") statusClass = "pass";
      else if (status === "Withdrawn" || status === "W") statusClass = "wait";
      else if (status === "Failed" || status === "F" || status === "U") statusClass = "fail";

      tableRows += `
        <tr>
          <td>${finalCourse.code}</td>
          <td style="text-align: left;">${finalCourse.name}</td>
          <td>${finalCourse.credit}</td>
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
        <tbody>
          ${tableRows}
        </tbody>
      </table>`;
}

function generateFreeElectivesTable(freeElectives) {
    let tableRows = "";
    freeElectives.forEach((course) => {
      const grade = course.grade || "—";
      const status = course.status || "—";
      let statusClass = "none";
      if (status === "Passed" || status === "Paased" || status === "S") statusClass = "pass";
      else if (status === "Withdrawn" || status === "W") statusClass = "wait";
      else if (status === "Failed" || status === "F" || status === "U") statusClass = "fail";

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
        <tbody>
          ${tableRows}
        </tbody>
      </table>`;
}

document.addEventListener("DOMContentLoaded", renderCurriculum);