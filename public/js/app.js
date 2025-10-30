///js/app.js
fetch('/api/users/me', { // Or other endpoints
  headers: {
    'Authorization': `Bearer ${token}` // Include the token
  }
})
.then(response => {
  if (response.status === 401 || response.status === 403) {
     // Token invalid/expired - Redirect to login
     alert('Session expired. Please log in again.');
     localStorage.clear();
     window.location.href = 'index.html';
     return; // Stop processing
  }
  if (!response.ok) {
     throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
})
.then(data => {
  // Process the data from the API
  console.log(data);
  // Example: updateDashboardInfo(data);
})
.catch(error => {
  console.error('Error fetching data:', error);
  // Display an error message to the user
});

// ใช้ใน planner.html
(function () {
  const dlg = document.getElementById('dlg');
  const openAdd = document.getElementById('openAdd');
  if (!openAdd || !dlg) return;

  const zone = document.getElementById('compZone');
  const addComp = document.getElementById('addComp');
  const calcBtn = document.getElementById('calcBtn');
  const closeBtn = document.getElementById('closeBtn');
  const saveBtn = document.getElementById('saveBtn');
  const form = document.getElementById('calcForm');
  const result = document.getElementById('result');

  function rowTpl() {
    return `
      <div class="comp-row">
        <input class="sm" name="comp_name" placeholder="Midterm / Final / Assignment">
        <input class="sm" name="weight_pct" type="number" min="0" step="0.1" placeholder="%">
        <input class="sm" name="max_score" type="number" min="0" step="0.1" placeholder="Max">
        <input class="sm" name="score" type="number" min="0" step="0.1" placeholder="Score">
        <button type="button" class="pill-btn remove">✕</button>
      </div>`;
  }
  function ensureOne() { if (zone.children.length === 0) zone.insertAdjacentHTML('beforeend', rowTpl()); }
  function calc() {
    const scale = new FormData(form).get('grading_scale') || 'AF';
    let total = 0;
    zone.querySelectorAll('.comp-row').forEach(r => {
      const w = parseFloat(r.querySelector('[name="weight_pct"]').value) || 0;
      const s = parseFloat(r.querySelector('[name="score"]').value) || 0;
      const m = parseFloat(r.querySelector('[name="max_score"]').value) || 0;
      total += w * (m > 0 ? (s / m) : 0);
    });
    total = Math.max(0, Math.min(100, total));
    let grade = "—";
    if (scale === "SU") grade = total >= 60 ? "S" : "U";
    else grade = total >= 80 ? "A" : total >= 75 ? "B+" : total >= 70 ? "B" : total >= 65 ? "C+" : total >= 60 ? "C" : total >= 55 ? "D+" : total >= 50 ? "D" : "F";
    result.textContent = `Total Score : ${total.toFixed(0)}    Estimated Grade : ${grade}`;
    return { total, grade };
  }

  openAdd.onclick = () => { dlg.showModal(); ensureOne(); };
  closeBtn.onclick = () => dlg.close();
  addComp.onclick = () => zone.insertAdjacentHTML('beforeend', rowTpl());
  zone.addEventListener('click', e => { if (e.target.classList.contains('remove')) e.target.parentElement.remove(); });
  calcBtn.onclick = calc;

  // demo เพียงเพิ่มบล็อกรายวิชาแบบ static ด้านบน (ไม่เก็บถาวร)
  saveBtn.onclick = () => {
    const { total, grade } = calc();
    const code = form.course_code.value || '00000000';
    const name = form.course_name.value || 'New Course';
    const credit = parseInt(form.credit.value || 0, 10);

    const container = document.createElement('div');
    container.className = 'list-card';
    container.innerHTML = `
      <div class="rowx">
        <div><b>${code}</b></div>
        <div style="font-size:13px">${name}</div>
        <div>${credit}</div>
        <div>${Math.round(total)}</div>
        <div><b>${grade}</b></div>
        <div><button class="action" id="action">•••</button></div>
      </div>`;
    document.querySelector('main').insertBefore(container, document.querySelector('.center'));

    // อัปเดต Estimated GPS แบบง่าย ๆ เฉพาะ A-F
    const map = { "A": 4, "B+": 3.5, "B": 3, "C+": 2.5, "C": 2, "D+": 1.5, "D": 1, "F": 0 };
    const rows = [...document.querySelectorAll('.list-card .rowx')];
    let sumC = 0, sumCG = 0;
    rows.forEach(r => {
      const c = parseInt(r.children[2].textContent, 10) || 0;
      const g = r.children[4].innerText.trim();
      if (map[g] !== undefined) { sumC += c; sumCG += c * map[g]; }
    });
    document.getElementById('gps').textContent = sumC ? (sumCG / sumC).toFixed(2) : '0.00';

    dlg.close();
    form.reset(); zone.innerHTML = ''; result.textContent = 'Total Score : —    Estimated Grade : —';
  };

  // --- เมนูแก้ไข/ลบ ---
  document.addEventListener('click', e => {
    if (e.target.classList.contains('action')) {
      const card = e.target.closest('.list-card');
      showMenu(e.target, card);
    }
  });
  
  function showMenu(btn, card) {
    // ลบเมนูเก่าก่อนถ้ามี
    document.querySelectorAll('.context-menu').forEach(m => m.remove());

    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.innerHTML = `
      <button class="edit">✏️ Edit</button>
      <button class="delete">🗑️ Delete</button>
    `;
    document.body.appendChild(menu);

    // กำหนดตำแหน่งเมนู
    const rect = btn.getBoundingClientRect();
    menu.style.top = rect.bottom + 'px';
    menu.style.left = rect.left + 'px';

    // ปิดเมนูเมื่อคลิกข้างนอก
    setTimeout(() => {
      document.addEventListener('click', e => {
        if (!menu.contains(e.target) && !btn.contains(e.target)) menu.remove();
      }, { once: true });
    });

    // --- กด Edit ---
    menu.querySelector('.edit').onclick = () => {
      const row = card.querySelector('.rowx').children;
      const code = row[0].querySelector('b').textContent.trim();
      const name = row[1].textContent.trim();
      const credit = row[2].textContent.trim();
      const score = row[3].textContent.trim();
      const grade = row[4].querySelector('b').textContent.trim();

      // เปิด dialog พร้อมข้อมูลเดิม
      dlg.showModal();
      const f = document.getElementById('calcForm');
      f.course_code.value = code;
      f.course_name.value = name;
      f.credit.value = credit;
      f.grading_scale.value = 'AF';
      result.textContent = `Total Score : ${score}    Estimated Grade : ${grade}`;

      // เมื่อกด Save ให้แก้ข้อมูลแทน
      const saveBtn = document.getElementById('saveBtn');
      saveBtn.onclick = () => {
        const { total, grade } = calc();
        row[3].textContent = Math.round(total);
        row[4].querySelector('b').textContent = grade;
        dlg.close();
        updateGPS();
      };

      menu.remove();
    };

    // --- กด Delete ---
    menu.querySelector('.delete').onclick = () => {
      card.remove();
      menu.remove();
      updateGPS();
    };
  }

  // --- คำนวณ GPS ---
  function updateGPS() {
    const map = { "A": 4, "B+": 3.5, "B": 3, "C+": 2.5, "C": 2, "D+": 1.5, "D": 1, "F": 0 };
    const rows = [...document.querySelectorAll('.list-card .rowx')];
    let sumC = 0, sumCG = 0;
    rows.forEach(r => {
      const c = parseInt(r.children[2].textContent, 10) || 0;
      const g = r.children[4].innerText.trim();
      if (map[g] !== undefined) { sumC += c; sumCG += c * map[g]; }
    });
    document.getElementById('gps').textContent = sumC ? (sumCG / sumC).toFixed(2) : '0.00';
  }
})();