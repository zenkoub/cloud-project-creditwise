// js/admin-students.js

// 🚀 AUTH GUARD (Admin Version) - Placed at the top
(function () {
  const role = localStorage.getItem('cw_role');
  if (role !== 'admin') {
    alert('Access Denied: Admin privileges required.');
    // Redirect non-admins away
    localStorage.clear(); // Optional: Clear storage if redirecting
    window.location.href = 'index.html';
  }
})(); // Immediately invoke the guard

// --- Utility Functions ---
function calculateStatus(academic_history) {
  if (!academic_history || academic_history.length === 0) {
    return { status: 'Normal', cls: 'pass' }; // Default if no history
  }
  const last = academic_history[academic_history.length - 1]; // Use index for wider compatibility
  const gps = last.term_gpa || 0;
  const gpax = last.gpax || 0; // Renamed for clarity

  // Explicit status checks based on flowchart/rules
  if (gpax < 1.00) return { status: 'Retired', cls: 'fail' };
  if (gpax < 2.00) {
    if (gps < 2.00) return { status: 'Retired', cls: 'fail' };
    else return { status: 'Probation', cls: 'warn' };
  }
  return { status: 'Normal', cls: 'pass' };
}

function splitName(fullName = "") {
  const parts = fullName.trim().split(" ");
  const name = parts[0] || "";
  const surname = parts.slice(1).join(" ") || "";
  return { name, surname };
}

// --- Data Fetching & Processing ---
function getAllStudentsFromUserData() {
  if (typeof USER_DATA === "undefined" || !USER_DATA) {
      console.error("USER_DATA is not defined or empty.");
      return [];
  }

  const studentArray = [];
  for (const id in USER_DATA) {
    if (Object.hasOwnProperty.call(USER_DATA, id)) {
      const u = USER_DATA[id];
      if (!u || !u.info || u.info.role !== "student") {
        continue; // Skip non-student entries safely
      }

      const info = u.info;
      const grades = u.grades || {};
      const academic_history = u.academic_history || [];

      const totalCredit = Object.values(grades)
        .filter(g => g && (g.status === "Passed" || g.grade === "S"))
        .reduce((sum, g) => sum + (g.credit || 0), 0);

      const latestHistory = academic_history.length > 0 ? academic_history[academic_history.length - 1] : null;
      const gpax = latestHistory ? (latestHistory.gpax || 0) : 0;
      const statusInfo = calculateStatus(academic_history);
      const trackDisplay = (info.track_id && info.track_id !== "N/A") ? info.track_id : "-";

      studentArray.push({
        id,
        name: info.name || "N/A",
        surname: info.surname || "",
        email: `${id}@example.com`,
        credit: totalCredit,
        gpa: gpax.toFixed(2),
        status: statusInfo.status,
        statusCls: statusInfo.cls,
        track: trackDisplay,
        year: info.current_year !== undefined ? info.current_year : "-"
      });
    }
  }
  return studentArray;
}

// --- Rendering ---
function renderStudentTable(students) {
  const tbody = document.getElementById("student-table-body");
  if (!tbody) return;

  if (!students || students.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" class="muted text-center" style="padding: 30px;">
          <div style="display: flex; justify-content: center; align-items: center; gap: 8px;">
            <span style="font-size: 24px;">ℹ️</span>
            <span>No students found matching your criteria.</span>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = students.map((s, i) => {
    const { name, surname } = splitName(s.name);
    const yearDisplay = s.year === 0 ? "Grad" : (s.year || "-");
    return `
    <tr data-id="${s.id}">
      <td class="text-center muted">${i + 1}</td>
      <td>${name}</td>
      <td>${surname}</td>
      <td class="text-center">${yearDisplay}</td>
      <td class="text-center">${s.track}</td>
      <td>${s.email}</td>
      <td class="text-center">${s.credit}</td>
      <td class="text-center font-bold">${s.gpa}</td>
      <td class="text-center">
        <span class="ic ${s.statusCls}">
          <span class="dot"></span>${s.status}
        </span>
      </td>
      <td class="text-center">
        <button class="btnViewGrade" title="View Grade History">📘</button>
      </td>
    </tr>
  `;
  }).join('');

  attachHistoryButtonListeners(); // Attach listeners after rendering
}

// --- Event Handling ---
function viewGradeHistory(studentId) {
   if (typeof USER_DATA === "undefined" || !USER_DATA || !USER_DATA[studentId]) {
     alert("Student data not found.");
     return;
   }
  const user = USER_DATA[studentId];
  const name = user.info?.name || studentId;
  const history = user.academic_history || [];

  if (history.length === 0) {
    alert(`${name} has no grade history available.`);
    return;
  }

  let msg = `📘 Grade History for ${name}\n--------------------------\n`;
  history.forEach(h => {
    msg += `Term ${h.term || 'N/A'}:\n`;
    msg += `  • Term GPA: ${h.term_gpa !== undefined ? h.term_gpa.toFixed(2) : 'N/A'}\n`;
    msg += `  • GPAX:     ${h.gpax !== undefined ? h.gpax.toFixed(2) : 'N/A'}\n\n`;
  });
  alert(msg);
}

function attachHistoryButtonListeners() {
  document.querySelectorAll(".btnViewGrade").forEach(btn => {
     btn.onclick = (e) => {
         const studentId = e.target.closest("tr")?.dataset.id;
         if (studentId) {
           viewGradeHistory(studentId);
         }
     };
  });
}

function applyFilters() {
  const yearFilter = document.getElementById("filterYear").value;
  const trackFilter = document.getElementById("filterTrack").value;
  const searchTerm = document.getElementById("searchBox").value.trim().toLowerCase();

  let studentList = getAllStudentsFromUserData(); // Get all students

  // Apply filters
  let filteredList = studentList.filter(s => {
    // ✅ MODIFIED: Year Matching Logic
    let yearMatch = false;
    if (!yearFilter) { // ถ้าไม่ได้เลือกปี (ค่าว่าง = "All Years")
      yearMatch = true;
    } else if (yearFilter === "0") { // ถ้าเลือก "Graduated/Other" (ค่า "0")
      // ให้ Match กับคนที่ year เป็น 0 (จบแล้ว) หรือ มากกว่า 4 (ปี 5+)
      yearMatch = (s.year === 0 || s.year > 4);
    } else { // ถ้าเลือกปี 1, 2, 3, หรือ 4
      // ให้ Match กับคนที่ year ตรงกับค่าที่เลือก
      yearMatch = (String(s.year) === yearFilter);
    }
    // END MODIFIED

    const trackMatch = !trackFilter || s.track === trackFilter || (trackFilter === "N/A" && s.track === "-");
    const searchMatch = !searchTerm ||
      s.id.toLowerCase().includes(searchTerm) ||
      s.name.toLowerCase().includes(searchTerm) ||
      (s.surname && s.surname.toLowerCase().includes(searchTerm)); // Check if surname exists

    return yearMatch && trackMatch && searchMatch;
  });

  renderStudentTable(filteredList);
}

// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
  // Initial render based on default filters (all)
  applyFilters();

  // Attach event listeners for filters
  const searchButton = document.getElementById("btnSearch");
  const yearSelect = document.getElementById("filterYear");
  const trackSelect = document.getElementById("filterTrack");
  const searchInput = document.getElementById("searchBox");

  if(searchButton) searchButton.addEventListener("click", applyFilters);
  if(yearSelect) yearSelect.addEventListener("change", applyFilters);
  if(trackSelect) trackSelect.addEventListener("change", applyFilters);
  if(searchInput) searchInput.addEventListener("input", applyFilters); // Live search

  // Sidebar Toggle logic is now expected to be in menu-toggle.js
});