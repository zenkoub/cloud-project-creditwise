// public/js/admin-curriculum.js

// NOTE: ต้องมี window.TRACKS_INFO จาก curriculum-master.js โหลดไว้ก่อน
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
   function getAuthHeaders() {
        const token = localStorage.getItem('cw_token');
        return { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }
     function populateTrackSelects() {
        const TRACKS_FALLBACK = {
            SD: { full_name: 'Software Development' },
            ITI: { full_name: 'Information Technology Infrastructure' },
            MM: { full_name: 'Multimedia for Interactive Media, Web and Game Development' }
        };
        const source = window.TRACKS_INFO || TRACKS_FALLBACK;
        // Use 'ALL' as the canonical DB track id for courses required for all students
        const coreOption = '<option value="ALL">CORE (Required for All)</option>';
        const trackOptions = Object.entries(source).map(([id, info]) => `<option value="${id}">${info.full_name || id}</option>`).join('');
        trackFilterSelect.innerHTML = '<option value="">All Tracks</option>' + coreOption + trackOptions;
        courseTrackSelect.innerHTML = coreOption + trackOptions;
     }
     function getSelectedCourseId() {
        const selectedRadio = document.querySelector('input[name="selCourse"]:checked');
        return selectedRadio ? parseInt(selectedRadio.value, 10) : null;
     }

    // --- Data Fetching & Rendering ---
    // *** เปลี่ยนเป็น async และ fetch API ***
    async function loadAndRenderCourses() { // *** เปลี่ยนเป็น async ***
        console.log("Attempting to load and render courses...");

        const headers = getAuthHeaders(); // ดึง headers และ Token
        if (!headers['Authorization']) {
            groupContainer.innerHTML = `<p class="text-center muted">Access denied. Token missing.</p>`;
            return;
        }

        groupContainer.innerHTML = `<p class="text-center muted" style="padding: 30px;">Loading courses...</p>`;
        
        try {
            // *** API call ที่ทำให้เกิด SyntaxError ต้องมั่นใจว่า Server รู้จัก ***
            const response = await fetch('/api/admin/courses', { headers: headers });
            
            if (!response.ok) {
                // ถ้า API ตอบกลับด้วย 403/404/500
                const errorText = await response.text();
                // ถ้าเป็น HTML ให้ Error message แทน
                if (errorText.startsWith('<')) {
                     throw new Error('Server error: Admin API route not found (Received HTML instead of JSON). Check server.js routes.');
                }
                const errorJson = JSON.parse(errorText); // ลอง parse ถ้าไม่ใช่ HTML
                throw new Error(errorJson.error || 'Failed to fetch courses with unknown server error.');
            }
            
            allCourses = await response.json(); // ดึงข้อมูลล่าสุด
            console.log(`Successfully fetched ${allCourses.length} courses.`);
            applyFiltersAndRender();
            
        } catch (error) {
            console.error("Error loading courses:", error);
            groupContainer.innerHTML = `<p class="text-center muted">Error loading courses: ${error.message}</p>`;
        }
    }

    function applyFiltersAndRender() {
        const selectedTrack = trackFilterSelect.value;
        const selectedYear = yearFilterSelect.value;
        const selectedSemester = semesterFilterSelect.value;
        const searchTerm = searchBox.value.trim().toLowerCase();

        let filteredCourses = allCourses.filter(c => {
            const semesterMatch = !selectedSemester || String(c.semester) === selectedSemester;
            return (!selectedTrack || c.track_id === selectedTrack) && // ใช้ track_id
                   (!selectedYear || String(c.year) === selectedYear) &&
                   semesterMatch &&
                   (!searchTerm || c.name.toLowerCase().includes(searchTerm) || c.code.toLowerCase().includes(searchTerm));
        });
        
        // Sort courses before rendering (Track, Year, Semester, Code)
        filteredCourses.sort((a, b) =>
            a.year - b.year ||
            a.semester - b.semester ||
            a.track_id.localeCompare(b.track_id) ||
            a.code.localeCompare(b.code)
        );

        renderCoursesGrouped(filteredCourses);
    }

     function createInnerTableHTML(courses) {
         return `<table><thead><tr><th style="width:5%"></th> <th style="width:15%">Code</th><th style="width:55%; text-align: left;">Name</th><th style="width:10%">Credit</th><th style="width:15%">Type/Track</th></tr></thead><tbody>${courses.map(c => `<tr data-id="${c.id}"><td><input type="radio" name="selCourse" value="${c.id}" aria-label="Select course ${c.code}"></td><td>${c.code}</td><td style="text-align: left;">${c.name}</td><td>${c.credit}</td><td class="muted">${(c.track_id === 'CORE' || c.track_id === 'ALL') ? c.type : c.track_id}</td></tr>`).join('')}</tbody></table>`;
     }
     
     function renderCoursesGrouped(coursesToRender) {
         if (!groupContainer) return; 
         if (!coursesToRender || coursesToRender.length === 0) { groupContainer.innerHTML = `<div class="text-center muted" style="padding: 20px;"><span style="font-size: 24px; display: block; margin-bottom: 8px;">ℹ️</span>No courses match the current filters.</div>`; selectedCourseId = null; return; } 
         
         const grouped = {}; 
         coursesToRender.forEach(c => { 
             const y=`Year ${c.year}`, s=c.semester===0?'Summer':`Semester ${c.semester}`, t=c.track_id||"CORE"; 
             if(!grouped[y])grouped[y]={}; 
             if(!grouped[y][s])grouped[y][s]={}; 
             if(!grouped[y][s][t])grouped[y][s][t]=[]; 
             grouped[y][s][t].push(c); 
         }); 
         
         let htmlContent=''; 
         // Sorting by Year
         Object.keys(grouped).sort((a,b)=>parseInt(a.split(' ')[1])-parseInt(b.split(' ')[1])).forEach(y=>{ 
             htmlContent+=`<h3>📘 ${y}</h3>`; 
             // Sorting by Semester (1, 2, Summer)
             Object.keys(grouped[y]).sort((a,b)=>(a==='Summer'?3:parseInt(a.split(' ')[1]))-(b==='Summer'?3:parseInt(b.split(' ')[1]))).forEach(s=>{ 
                 htmlContent+=`<h4>📗 ${s}</h4>`; 
                 const w=document.createElement('div'); 
                 w.className='track-group-wrapper'; 
                 let tHTML=''; 
                 // Sorting by Track (CORE first)
                 Object.keys(grouped[y][s]).sort((a,b)=>( (a==='CORE' || a==='ALL')?-1:((b==='CORE' || b==='ALL')?1:(window.TRACKS_INFO?.[a]?.full_name||a).localeCompare(window.TRACKS_INFO?.[b]?.full_name||b)) )).forEach(t=>{ 
                     const cs=grouped[y][s][t], fN=window.TRACKS_INFO?.[t]?.full_name|| (t==='ALL' ? 'CORE (All)' : t); 
                     tHTML+=`<div class="track-group"><h5>🔹 ${fN}</h5>${createInnerTableHTML(cs)}</div>`; 
                 }); 
                 w.innerHTML=tHTML; 
                 htmlContent+=w.outerHTML; 
             }); 
         }); 
         
         groupContainer.innerHTML=htmlContent; 
         if(selectedCourseId){ 
             const rS=groupContainer.querySelector(`input[name="selCourse"][value="${selectedCourseId}"]`); 
             if(rS)rS.checked=true; 
             else selectedCourseId=null; 
         }
     }


    // --- Modal Handling ---
      function openModalForAdd() {
          if (!modal || !form) return;
          modalTitle.textContent = 'Add Course';
          form.reset();
          const idInput = form.querySelector('input[name="course_id"]');
          if (idInput) idInput.value = '';
          if (typeof modal.showModal === 'function') modal.showModal(); else modal.setAttribute('open', '');
      }
      function openModalForEdit() {
          const id = getSelectedCourseId();
          if (!id) {
              alert('Please select a course to edit.');
              return;
          }
          const course = allCourses.find(c => c.id === id);
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
          if (f('#courseTrack')) f('#courseTrack').value = course.track_id || 'ALL'; // ใช้ track_id (default ALL for core/all-students)
          if (f('#courseFormat')) f('#courseFormat').value = course.credit_format || '';
          
          if (typeof modal.showModal === 'function') modal.showModal(); else modal.setAttribute('open', '');
      }

      // *** เปลี่ยนเป็น async และ fetch API ***
      async function handleDelete() {
          const id = getSelectedCourseId();
          if (!id) { alert('Please select a course to delete.'); return; }
          const course = allCourses.find(c => c.id === id);
          if (!course) { alert('Selected course not found.'); return; }

          if (!confirm(`Are you sure you want to delete course ${course.code} - ${course.name}? This action cannot be undone.`)) return;

          try {
              const response = await fetch(`/api/admin/courses/${id}`, { // NOTE: ต้องสร้าง PUT/DELETE API ใน routes/admin.js ด้วย
                  method: 'DELETE',
                  headers: getAuthHeaders()
              });

              if (!response.ok) throw new Error('Failed to delete course on server.');
              
              alert('Course deleted successfully.');
              loadAndRenderCourses(); // Refresh UI

          } catch (error) {
              console.error("Delete error:", error);
              alert('Failed to delete the course: ' + error.message);
          }
      }
      
      // *** เปลี่ยนเป็น async และ fetch API ***
      async function handleFormSubmit(event) {
          event.preventDefault();
          if (!form) return;

          const get = (sel) => form.querySelector(sel)?.value;
          const idVal = get('input[name="course_id"]');
          const method = idVal ? 'PUT' : 'POST';
          const url = idVal ? `/api/admin/courses/${idVal}` : '/api/admin/courses';
          
          const payload = {
              code: (get('#courseCode') || '').trim(),
              name: (get('#courseName') || '').trim(),
              credit: Number(get('#courseCredit')) || 0,
              year: Number(get('#courseYear')) || 0,
              semester: Number(get('#courseSemester')) || 0,
              type: get('#courseType') || 'Core',
              track_id: get('#courseTrack') || 'ALL', // ใช้ track_id (default ALL for core/all-students)
              credit_format: get('#courseFormat') || ''
          };

          if (!payload.code || !payload.name) { alert('Please provide both course code and name.'); return; }
          if (!Number.isFinite(payload.year) || !Number.isFinite(payload.semester) || !Number.isFinite(payload.credit)) { alert('Year, semester and credit must be numeric.'); return; }

          try {
              const response = await fetch(url, {
                  method: method,
                  headers: getAuthHeaders(),
                  body: JSON.stringify(payload)
              });

              if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData.error || `Failed to ${method === 'POST' ? 'add' : 'update'} course.`);
              }
              
              alert(`Course ${payload.code} saved successfully.`);
              loadAndRenderCourses(); // Refresh UI
              if (typeof modal.close === 'function') modal.close(); else modal.removeAttribute('open');
          
          } catch (error) {
              console.error("Form submit error:", error);
              alert(`Error saving course: ${error.message}`);
          }
      }

    // --- Event Listeners ---
     if(addBtn) addBtn.addEventListener('click', openModalForAdd);
     if(editBtn) editBtn.addEventListener('click', openModalForEdit);
     // NOTE: ต้องสร้าง API Endpoint สำหรับ PUT/DELETE ก่อนใช้งานปุ่มนี้
     if(deleteBtn) deleteBtn.addEventListener('click', handleDelete);
     if(closeModalBtn) closeModalBtn.addEventListener('click', () => modal?.close());
     if(form) form.addEventListener('submit', handleFormSubmit);
     if(trackFilterSelect) trackFilterSelect.addEventListener('change', applyFiltersAndRender);
     if(yearFilterSelect) yearFilterSelect.addEventListener('change', applyFiltersAndRender);
     if(semesterFilterSelect) semesterFilterSelect.addEventListener('change', applyFiltersAndRender);
     if(searchBtn) searchBtn.addEventListener('click', applyFiltersAndRender);
     if(searchBox) { searchBox.addEventListener('input', applyFiltersAndRender); searchBox.addEventListener('keypress', (e) => { if (e.key === 'Enter') applyFiltersAndRender(); }); }
     if(groupContainer) groupContainer.addEventListener('change', (event)=>{ if (event.target.type === 'radio' && event.target.name === 'selCourse') selectedCourseId = parseInt(event.target.value, 10); });

    // --- Initial Load ---
    populateTrackSelects();
    loadAndRenderCourses(); 

});