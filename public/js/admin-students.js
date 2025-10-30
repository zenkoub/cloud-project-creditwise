// js/admin-students.js

// 🚀 AUTH GUARD (Admin Version) - Placed at the top
(function () {
  const role = localStorage.getItem('cw_role');
  if (role !== 'admin') {
    alert('Access Denied: Admin privileges required.');
    localStorage.clear();
    window.location.href = 'index.html';
  }
})();

// --- Utility Functions (Same as original) ---
function calculateStatus(academic_history) {
  if (!academic_history || academic_history.length === 0) {
    return { status: 'Normal', cls: 'pass' };
  }
  const last = academic_history[academic_history.length - 1];
  const gps = last.term_gpa || 0;
  const gpax = last.gpax || 0;

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
// *** เปลี่ยนฟังก์ชันนี้ให้เป็น async และดึงจาก API ***
async function getAllStudentsFromAPI() {
  const token = localStorage.getItem('cw_token');
  if (!token) return [];

  try {
    const response = await fetch('/api/admin/students', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      if (response.status === 403) throw new Error("Admin access denied by server.");
      throw new Error('Failed to fetch student list.');
    }

    const students = await response.json(); // Array of student objects

    return students.map(s => {
      // Prefer latest_term_gpa + gpax returned by the admin endpoint.
      // If those are not present, fall back to any academic_history array.
      const hasLatest = s.latest_term_gpa !== undefined && s.latest_term_gpa !== null;
      let academic_history = [];
      if (hasLatest || (s.gpax !== undefined && s.gpax !== null)) {
        academic_history = [{ term_gpa: Number(s.latest_term_gpa) || 0, gpax: Number(s.gpax) || 0 }];
      } else if (Array.isArray(s.academic_history) && s.academic_history.length > 0) {
        academic_history = s.academic_history;
      }

      const gpax = (s.gpax !== undefined && s.gpax !== null) ? Number(s.gpax) : (academic_history.length > 0 ? Number(academic_history[academic_history.length - 1].gpax || 0) : 0);
      const totalCredit = s.total_credits !== undefined && s.total_credits !== null ? Number(s.total_credits) : 0;

      const statusInfo = calculateStatus(academic_history);
      const trackDisplay = (s.track_id && s.track_id !== "N/A") ? s.track_id : "-";
      const { name, surname } = splitName(s.name);

      return {
        id: s.id,
        username: s.username,
        name: name,
        surname: surname,
        email: `${s.username}@example.com`,
        credit: totalCredit,
        gpa: gpax.toFixed(2),
        status: statusInfo.status,
        statusCls: statusInfo.cls,
        track: trackDisplay,
        year: s.current_year !== undefined ? s.current_year : "-"
      };
    });

  } catch (error) {
    console.error("Error fetching students:", error);
    alert(error.message);
    return [];
  }
}

// --- Rendering (Same as original) ---
function renderStudentTable(students) {
  const tbody = document.getElementById("student-table-body");
  if (!tbody) return;

  if (!students || students.length === 0) {
    // ... (No students found message) ...
    return;
  }

  tbody.innerHTML = students.map((s, i) => {
    const yearDisplay = s.year === 0 ? "Grad" : (s.year || "-");
    return `
    <tr data-id="${s.id}" data-username="${s.username}">
      <td class="text-center muted">${i + 1}</td>
      <td>${s.name}</td>
      <td>${s.surname}</td>
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
        <button class="btnViewGrade" title="View Grade History" data-username="${s.username}">📘</button>
      </td>
    </tr>
  `;
  }).join('');

  attachHistoryButtonListeners();
}

// --- Event Handling ---
// *** ฟังก์ชันนี้ต้องถูกปรับให้เรียก API เพื่อดึง History ของนักศึกษาคนนั้น ***
async function viewGradeHistory(username) { 
   const token = localStorage.getItem('cw_token');
   if (!token) return;

   try {
        // NOTE: ต้องมี API Endpoint เช่น /api/admin/students/:username/history
        const response = await fetch(`/api/admin/students/${username}/history`, {
             headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 404) {
             alert(`${username} has no grade history available.`);
             return;
        }
        if (!response.ok) throw new Error("Failed to fetch history.");

        const history = await response.json();
        const name = username; // ใช้ username ก่อน

        if (history.length === 0) {
            alert(`${name} has no grade history available.`);
            return;
        }

        let msg = `📘 Grade History for ${name}\n--------------------------\n`;
        history.forEach(h => {
          const termGpa = parseFloat(h.term_gpa) || 0;
          const gpax = parseFloat(h.gpax) || 0;
          msg += `Term ${h.term || 'N/A'}:\n`;
          msg += `  • Term GPA: ${termGpa.toFixed(2)}\n`;
          msg += `  • GPAX:     ${gpax.toFixed(2)}\n\n`;
        });
        alert(msg);

   } catch (error) {
       alert(`Error fetching history: ${error.message}`);
   }
}

function attachHistoryButtonListeners() {
  document.querySelectorAll(".btnViewGrade").forEach(btn => {
     btn.onclick = (e) => {
         const username = e.target.dataset.username;
         if (username) {
           viewGradeHistory(username);
         }
     };
  });
}

// *** แก้ฟังก์ชันนี้ให้เป็น async ***
async function applyFilters() {
  const yearFilter = document.getElementById("filterYear").value;
  const trackFilter = document.getElementById("filterTrack").value;
  const searchTerm = document.getElementById("searchBox").value.trim().toLowerCase();

  const studentList = await getAllStudentsFromAPI(); // *** เปลี่ยนเป็น await ***
  if (!studentList) return; // ถ้าดึงไม่สำเร็จ

  // Apply filters (logic is the same, but applied to the fetched list)
  let filteredList = studentList.filter(s => {
    // ... (Filter logic is the same) ...
    let yearMatch = false;
    if (!yearFilter) {
      yearMatch = true;
    } else if (yearFilter === "0") {
      yearMatch = (s.year === 0 || s.year > 4);
    } else {
      yearMatch = (String(s.year) === yearFilter);
    }

    const trackMatch = !trackFilter || s.track === trackFilter || (trackFilter === "N/A" && s.track === "-");
    const searchMatch = !searchTerm ||
      s.username.toLowerCase().includes(searchTerm) || // ใช้ username (Student ID)
      s.name.toLowerCase().includes(searchTerm) ||
      (s.surname && s.surname.toLowerCase().includes(searchTerm));

    return yearMatch && trackMatch && searchMatch;
  });

  renderStudentTable(filteredList);
}

// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
  applyFilters();

  const searchButton = document.getElementById("btnSearch");
  const yearSelect = document.getElementById("filterYear");
  const trackSelect = document.getElementById("filterTrack");
  const searchInput = document.getElementById("searchBox");

  if(searchButton) searchButton.addEventListener("click", applyFilters);
  if(yearSelect) yearSelect.addEventListener("change", applyFilters);
  if(trackSelect) trackSelect.addEventListener("change", applyFilters);
  if(searchInput) searchInput.addEventListener("input", applyFilters);
});