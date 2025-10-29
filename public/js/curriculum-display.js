function renderCurriculum() {
  const userData = getCurrentUserData(); // Assumes Auth Guard ran

  // Defensive coding: Ensure necessary data exists, provide defaults
  if (!userData.grades) userData.grades = {};
  if (!userData.user_electives) userData.user_electives = {};
  if (!userData.free_electives) userData.free_electives = [];

  const trackId = userData.info.track_id;
  const studyPlan = userData.info.study_plan || "Non-Co-op"; // Default study plan
  const container = document.getElementById("curriculum-container");

  // Update header info
  document.getElementById("student-badge").textContent =
    `${userData.info.name || 'N/A'} • ${userData.info.id || 'N/A'}`;

  const trackName = (trackId && trackId !== "N/A" && window.TRACKS_INFO && window.TRACKS_INFO[trackId])
                    ? window.TRACKS_INFO[trackId].full_name
                    : '(No Track Selected)';
  document.getElementById("student-track").textContent =
    `Track: ${trackName} (${studyPlan})`;

  // --- Start Building HTML ---
  let htmlContent = "";
  const masterCore = window.MASTER_CURRICULUM["CORE"] || {};

  // Handle case for students without a selected track (e.g., Year 1)
  if (!trackId || trackId === "N/A") {
    const year = "Year 1";
    const coreYear = masterCore[year] || {};
    const semesters = Object.keys(coreYear).sort();

    if (semesters.length === 0) {
        container.innerHTML = `<p class="text-center muted">Core curriculum data for Year 1 not found.</p>`;
        return;
    }

    semesters.forEach(semesterKey => {
      const courses = coreYear[semesterKey] || [];
      if (courses.length > 0) {
        htmlContent += generateSemesterTable(year, semesterKey, courses, userData);
      }
    });

  } else {
    // Student has a track selected
    const masterTrack = window.MASTER_CURRICULUM[trackId] || {};
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
          if (studyPlan === "Co-op" && isNonCoopKey) return; // Skip Non-Co-op semester if student is Co-op
          if (studyPlan === "Non-Co-op" && isCoopKey) return; // Skip Co-op semester if student is Non-Co-op
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
  }

  // --- Add Free Electives Table (if any) ---
  if (userData.free_electives.length > 0) {
    htmlContent += generateFreeElectivesTable(userData.free_electives);
  }

  // --- Render the final HTML ---
  container.innerHTML = htmlContent || `<p class="text-center muted">No curriculum data to display for the selected track/year.</p>`;
}

// --- Helper function to generate HTML for one semester's table ---
function generateSemesterTable(year, semesterKey, courses, userData) {
  const displaySemester = semesterKey.replace(/\s*\([^)]*\)/g, ""); // Clean up semester name (remove "(Co-op)")
  const tblHead = `${year} • ${displaySemester}`;
  let tableRows = "";

  courses.forEach((course) => {
    let finalCourse = { ...course }; // Clone course object
    let gradeInfo = userData.grades[course.code];

    // Check if it's an elective slot and if the user has filled it
    if (course.is_user_entry_slot && userData.user_electives[course.slot_id]) {
      // Use user's elective data, merge with base slot info if needed
      const userElec = userData.user_electives[course.slot_id];
      finalCourse.code = userElec.code || course.code; // Prefer user code
      finalCourse.name = userElec.name || course.name; // Prefer user name
      finalCourse.credit = userElec.credit || course.credit; // Prefer user credit
      gradeInfo = userElec; // Grade info comes from user elective data
    }

    const grade = gradeInfo?.grade || "—";
    const status = gradeInfo?.status || "—";
    let statusClass = "none";
    if (status === "Passed" || status === "Paased") statusClass = "pass"; // Handle typo "Paased" if present
    else if (status === "Withdrawn" || status === "W") statusClass = "wait";
    else if (status === "Failed" || status === "F" || status === "U") statusClass = "fail";
    else if (status === "S") statusClass = "pass"; // S treated as pass visually

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

// --- Helper function to generate HTML for Free Electives ---
function generateFreeElectivesTable(freeElectives) {
  let tableRows = "";
  freeElectives.forEach((course) => {
    const grade = course.grade || "—";
    const status = course.status || "—";
    let statusClass = "none";
    if (status === "Passed" || status === "Paased") statusClass = "pass";
    else if (status === "Withdrawn" || status === "W") statusClass = "wait";
    else if (status === "Failed" || status === "F" || status === "U") statusClass = "fail";
    else if (status === "S") statusClass = "pass";

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

// Run the render function when the DOM is ready
document.addEventListener("DOMContentLoaded", renderCurriculum);