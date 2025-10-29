document.addEventListener('DOMContentLoaded', () => {
    // --- Globals & DOM Cache ---
    const modal = document.getElementById('courseEditModal');
    const form = document.getElementById('courseForm');
    const modalTitle = document.getElementById('modalTitle');
    const groupContainer = document.getElementById('courseGroupContainer');
    const trackFilterSelect = document.getElementById('filterTrack');
    const yearFilterSelect = document.getElementById('filterYear');
    const semesterFilterSelect = document.getElementById('filterSemester');
    const searchBox = document.getElementById('searchBox');
    const searchBtn = document.getElementById('btnSearch');
    const addBtn = document.getElementById('btnAddCourse');
    const editBtn = document.getElementById('btnEditCourse');
    const deleteBtn = document.getElementById('btnDeleteCourse');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const courseTrackSelect = document.getElementById('courseTrack');

    let allCourses = []; // Cache all courses locally
    let selectedCourseId = null;

    // --- Helper Functions ---
    // ... (populateTrackSelects, getSelectedCourseId - เหมือนเดิม) ...
     function populateTrackSelects() { /* ...เหมือนเดิม... */
        if (!window.TRACKS_INFO) return;
        const coreOption = '<option value="Core">Core Curriculum</option>';
        const trackOptions = Object.entries(window.TRACKS_INFO).map(([id, info]) => `<option value="${id}">${info.full_name || id}</option>`).join('');
        trackFilterSelect.innerHTML = '<option value="">All Tracks</option>' + coreOption + trackOptions;
        courseTrackSelect.innerHTML = coreOption + trackOptions; // Populate modal too
     }
     function getSelectedCourseId() { /* ...เหมือนเดิม... */
        const selectedRadio = document.querySelector('input[name="selCourse"]:checked');
        return selectedRadio ? selectedRadio.value : null;
     }


    // --- Data Fetching & Rendering ---
    // ✅ Function นี้จะถูกเรียกโดย Event Listener เท่านั้น
    function loadAndRenderCourses() {
        console.log("Attempting to load and render courses..."); // Log เพิ่ม
        if (window.cwAdmin && typeof window.cwAdmin.getCourses === 'function') {
             allCourses = window.cwAdmin.getCourses() || []; // ดึงข้อมูลล่าสุด
             console.log(`Successfully fetched ${allCourses.length} courses.`);
             applyFiltersAndRender(); // เรียก render ทันทีหลังโหลด
        } else {
             console.error("cwAdmin API or getCourses not available when needed.");
             if(groupContainer) groupContainer.innerHTML = `<p class="text-center muted">Error loading course data API.</p>`;
        }
    }

    function applyFiltersAndRender() {
        console.log("Applying filters and rendering..."); // Log เพิ่ม
        const selectedTrack = trackFilterSelect.value;
        const selectedYear = yearFilterSelect.value;
        const selectedSemester = semesterFilterSelect.value; // 0, 1, 2
        const searchTerm = searchBox.value.trim().toLowerCase();

        // ✅ เช็ค allCourses อีกครั้งเผื่อกรณีโหลดไม่สำเร็จ
        if (allCourses.length === 0) {
            console.warn("applyFiltersAndRender called but allCourses is empty. Attempting fetch again.");
             if (window.cwAdmin && typeof window.cwAdmin.getCourses === 'function') {
                allCourses = window.cwAdmin.getCourses() || []; // ลองดึงใหม่
             }
        }


        let filteredCourses = allCourses.filter(c => {
            const semesterMatch = !selectedSemester || String(c.semester) === selectedSemester;
            return (!selectedTrack || c.track === selectedTrack) &&
                   (!selectedYear || String(c.year) === selectedYear) &&
                   semesterMatch &&
                   (!searchTerm || c.name.toLowerCase().includes(searchTerm) || c.code.toLowerCase().includes(searchTerm));
        });
        console.log(`Filtered down to ${filteredCourses.length} courses.`); // Log เพิ่ม
        renderCoursesGrouped(filteredCourses);
    }

    // ... (createInnerTableHTML, renderCoursesGrouped - เหมือนเดิม) ...
     function createInnerTableHTML(courses) { /* ...เหมือนเดิม... */
         return `<table><thead><tr><th style="width:5%"></th> <th style="width:15%">Code</th><th style="width:55%; text-align: left;">Name</th><th style="width:10%">Credit</th><th style="width:15%">Type/Track</th></tr></thead><tbody>${courses.map(c => `<tr data-id="${c.id}"><td><input type="radio" name="selCourse" value="${c.id}" aria-label="Select course ${c.code}"></td><td>${c.code}</td><td style="text-align: left;">${c.name}</td><td>${c.credit}</td><td class="muted">${c.track === 'Core' ? c.type : c.track}</td></tr>`).join('')}</tbody></table>`;
     }
     function renderCoursesGrouped(coursesToRender) { /* ...เหมือนเดิม... */
         if (!groupContainer) return; console.log(`Rendering ${coursesToRender ? coursesToRender.length : 0} courses.`); // Log เพิ่ม
         if (!coursesToRender || coursesToRender.length === 0) { groupContainer.innerHTML = `<div class="text-center muted" style="padding: 20px;"><span style="font-size: 24px; display: block; margin-bottom: 8px;">ℹ️</span>No courses match the current filters.</div>`; selectedCourseId = null; return; } const grouped = {}; coursesToRender.forEach(c => { const y=`Year ${c.year}`, s=c.semester===0?'Summer':`Semester ${c.semester}`, t=c.track||"Core"; if(!grouped[y])grouped[y]={}; if(!grouped[y][s])grouped[y][s]={}; if(!grouped[y][s][t])grouped[y][s][t]=[]; grouped[y][s][t].push(c); }); let htmlContent=''; Object.keys(grouped).sort((a,b)=>parseInt(a.split(' ')[1])-parseInt(b.split(' ')[1])).forEach(y=>{ htmlContent+=`<h3>📘 ${y}</h3>`; Object.keys(grouped[y]).sort((a,b)=>(a==='Summer'?3:parseInt(a.split(' ')[1]))-(b==='Summer'?3:parseInt(b.split(' ')[1]))).forEach(s=>{ htmlContent+=`<h4>📗 ${s}</h4>`; const w=document.createElement('div'); w.className='track-group-wrapper'; let tHTML=''; Object.keys(grouped[y][s]).sort((a,b)=>(a==='Core'?-1:(b==='Core'?1:(window.TRACKS_INFO?.[a]?.full_name||a).localeCompare(window.TRACKS_INFO?.[b]?.full_name||b)))).forEach(t=>{ const cs=grouped[y][s][t], fN=window.TRACKS_INFO?.[t]?.full_name||t; tHTML+=`<div class="track-group"><h5>🔹 ${fN}</h5>${createInnerTableHTML(cs)}</div>`; }); w.innerHTML=tHTML; htmlContent+=w.outerHTML; }); }); groupContainer.innerHTML=htmlContent; if(selectedCourseId){ const rS=groupContainer.querySelector(`input[name="selCourse"][value="${selectedCourseId}"]`); if(rS)rS.checked=true; else selectedCourseId=null; }
     }


    // --- Modal Handling ---
    // ... (openModalForAdd, openModalForEdit, handleDelete, handleFormSubmit - เหมือนเดิม) ...
      function openModalForAdd() {
          if (!modal || !form) return;
          modalTitle.textContent = 'Add Course';
          // Clear form fields
          form.reset();
          // Ensure hidden id is empty
          const idInput = form.querySelector('input[name="course_id"]');
          if (idInput) idInput.value = '';
          // Show modal (support both <dialog> and fallback)
          if (typeof modal.showModal === 'function') modal.showModal(); else modal.setAttribute('open', '');
      }
      function openModalForEdit() {
          const id = getSelectedCourseId();
          if (!id) {
              alert('Please select a course to edit.');
              return;
          }
          // Find course in cache
          const course = allCourses.find(c => String(c.id) === String(id));
          if (!course) {
              alert('Selected course not found.');
              return;
          }
          // Populate form
          modalTitle.textContent = 'Edit Course';
          const idInput = form.querySelector('input[name="course_id"]');
          if (idInput) idInput.value = course.id;
          const f = (sel) => form.querySelector(sel);
          if (f('#courseYear')) f('#courseYear').value = course.year || '';
          if (f('#courseSemester')) f('#courseSemester').value = course.semester || '';
          if (f('#courseCode')) f('#courseCode').value = course.code || '';
          if (f('#courseName')) f('#courseName').value = course.name || '';
          if (f('#courseCredit')) f('#courseCredit').value = course.credit || '';
          if (f('#courseType')) f('#courseType').value = course.type || '';
          if (f('#courseTrack')) f('#courseTrack').value = course.track === 'Core' ? 'Core' : course.track || '';
          if (f('#courseFormat')) f('#courseFormat').value = course.credit_format || '';
          // Show modal
          if (typeof modal.showModal === 'function') modal.showModal(); else modal.setAttribute('open', '');
      }
      function handleDelete() {
          const id = getSelectedCourseId();
          if (!id) { alert('Please select a course to delete.'); return; }
          if (!confirm('Are you sure you want to delete the selected course? This action cannot be undone.')) return;
          if (window.cwAdmin && typeof window.cwAdmin.deleteCourse === 'function') {
              const success = window.cwAdmin.deleteCourse(Number(id));
              if (success) {
                  // Notify other parts and refresh UI
                  window.dispatchEvent(new CustomEvent('coursesUpdated'));
                  // Also reload immediately
                  loadAndRenderCourses();
              } else {
                  alert('Failed to delete the course.');
              }
          } else {
              alert('Course management API unavailable.');
          }
      }
      function handleFormSubmit(event) {
          event.preventDefault();
          if (!form) return;
          const get = (sel) => form.querySelector(sel)?.value;
          const idVal = get('input[name="course_id"]');
          const year = Number(get('#courseYear')) || 0;
          const semester = Number(get('#courseSemester')) || 0;
          const code = (get('#courseCode') || '').trim();
          const name = (get('#courseName') || '').trim();
          const credit = Number(get('#courseCredit')) || 0;
          const type = get('#courseType') || '';
          const trackRaw = get('#courseTrack') || '';
          const track = (trackRaw === 'Core' || trackRaw === 'CORE') ? 'Core' : trackRaw;
          const credit_format = get('#courseFormat') || '';

          // Basic validation
          if (!code || !name) { alert('Please provide both course code and name.'); return; }
          if (!Number.isFinite(year) || !Number.isFinite(semester) || !Number.isFinite(credit)) { alert('Year, semester and credit must be numeric.'); return; }

          const payload = {
              code,
              name,
              credit,
              year,
              semester,
              type,
              track,
              credit_format
          };

          if (idVal) {
              // Update existing
              const idNum = Number(idVal);
              payload.id = idNum;
              if (window.cwAdmin && typeof window.cwAdmin.updateCourse === 'function') {
                  const ok = window.cwAdmin.updateCourse(payload);
                  if (ok) {
                      window.dispatchEvent(new CustomEvent('coursesUpdated'));
                      loadAndRenderCourses();
                      if (typeof modal.close === 'function') modal.close(); else modal.removeAttribute('open');
                  } else {
                      alert('Failed to update course.');
                  }
              } else {
                  alert('Course management API unavailable.');
              }
          } else {
              // Add new
              if (window.cwAdmin && typeof window.cwAdmin.addCourse === 'function') {
                  const ok = window.cwAdmin.addCourse(payload);
                  if (ok) {
                      window.dispatchEvent(new CustomEvent('coursesUpdated'));
                      loadAndRenderCourses();
                      if (typeof modal.close === 'function') modal.close(); else modal.removeAttribute('open');
                  } else {
                      alert('Failed to add course.');
                  }
              } else {
                  alert('Course management API unavailable.');
              }
          }
      }

    // --- Event Listeners ---
    // ... (Modal buttons, Form submit, Filter changes - เหมือนเดิม) ...
     if(addBtn) addBtn.addEventListener('click', openModalForAdd);
     if(editBtn) editBtn.addEventListener('click', openModalForEdit);
     if(deleteBtn) deleteBtn.addEventListener('click', handleDelete);
     if(closeModalBtn) closeModalBtn.addEventListener('click', () => modal?.close());
     if(form) form.addEventListener('submit', handleFormSubmit);
     if(trackFilterSelect) trackFilterSelect.addEventListener('change', applyFiltersAndRender);
     if(yearFilterSelect) yearFilterSelect.addEventListener('change', applyFiltersAndRender);
     if(semesterFilterSelect) semesterFilterSelect.addEventListener('change', applyFiltersAndRender);
     if(searchBtn) searchBtn.addEventListener('click', applyFiltersAndRender);
     if(searchBox) { searchBox.addEventListener('input', applyFiltersAndRender); searchBox.addEventListener('keypress', (e) => { if (e.key === 'Enter') applyFiltersAndRender(); }); }
     if(groupContainer) groupContainer.addEventListener('change', (event)=>{ if (event.target.type === 'radio' && event.target.name === 'selCourse') selectedCourseId = event.target.value; });

    // --- Initial Load ---
    populateTrackSelects();

    // ✅ แสดง Loading ทันที
    if (groupContainer) {
        groupContainer.innerHTML = `<p class="text-center muted" style="padding: 30px;">Loading courses...</p>`;
    }

    // ✅ Trigger หลัก: รอ event 'coursesInitialized'
    window.addEventListener('coursesInitialized', () => {
        console.log('Event: coursesInitialized received. Loading cache and rendering.');
        loadAndRenderCourses(); // โหลดและ render เมื่อพร้อม
    });

    // ✅ Trigger รอง: รอ event 'coursesUpdated' (หลังจาก Add/Edit/Delete)
    window.addEventListener('coursesUpdated', () => {
        console.log('Event: coursesUpdated received. Reloading cache and rendering.');
        loadAndRenderCourses(); // โหลดใหม่และ render ใหม่
    });

    // ✅ เช็คเผื่อกรณี courses พร้อมแล้วจริงๆ ก่อน event จะมาถึง (Edge Case)
    // ทำหลังจาก DOMContentLoaded แน่นอนแล้ว แต่ก่อน event อาจจะมาถึง
    if (window.cwAdmin && typeof window.cwAdmin.getCourses === 'function' && window.cwAdmin.getCourses().length > 0) {
        console.log("Initial Check: Courses seem ready before event. Loading cache...");
        loadAndRenderCourses();
    } else {
        console.log("Initial Check: Courses not ready yet, waiting for event...");
    }

}); // End DOMContentLoaded