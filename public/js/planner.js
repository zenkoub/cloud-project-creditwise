document.addEventListener('DOMContentLoaded', () => {
    // --- Globals & DOM Cache ---
    const PLANNER_STORAGE_KEY = 'cw_planner_courses';
    const courseListContainer = document.getElementById('course-list-container');
    const estimatedGpsEl = document.getElementById('estimated-gps');
    const openModalBtn = document.getElementById('openAddCourseModal');

    // Modal elements
    const modal = document.getElementById('gradeCalcModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('calcForm');
    const compZone = document.getElementById('compZone');
    const addCompBtn = document.getElementById('addComp');
    const calcBtn = document.getElementById('calcBtn');
    const saveBtn = document.getElementById('saveBtn');
    const closeBtn = document.getElementById('closeBtn');
    const resultEl = document.getElementById('result');
    const courseIdInput = form.querySelector('input[name="course_id"]');

    let plannerCourses = []; // In-memory store for courses

    // --- Helper Functions ---
    function generateUUID() { // Simple UUID generator for unique course IDs
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    function gradeMap(gradeScale = 'AF') {
        if (gradeScale === 'SU') return { S: 1, U: 0 }; // Example value, not used for GPA
        return { "A": 4.0, "B+": 3.5, "B": 3.0, "C+": 2.5, "C": 2.0, "D+": 1.5, "D": 1.0, "F": 0.0 };
    }

    // --- Local Storage Functions ---
    function loadCoursesFromStorage() {
        const storedCourses = localStorage.getItem(PLANNER_STORAGE_KEY);
        plannerCourses = storedCourses ? JSON.parse(storedCourses) : [];
        renderCourseList();
        updateEstimatedGPS();
    }

    function saveCoursesToStorage() {
        localStorage.setItem(PLANNER_STORAGE_KEY, JSON.stringify(plannerCourses));
    }

    // --- Core Planner Logic ---
    function addCourse(courseData) {
        courseData.id = generateUUID(); // Assign a unique ID
        plannerCourses.push(courseData);
        saveCoursesToStorage();
        renderCourseList();
        updateEstimatedGPS();
    }

    function updateCourse(courseData) {
        const index = plannerCourses.findIndex(c => c.id === courseData.id);
        if (index !== -1) {
            plannerCourses[index] = { ...plannerCourses[index], ...courseData }; // Merge updates
            saveCoursesToStorage();
            renderCourseList();
            updateEstimatedGPS();
        }
    }

    function deleteCourse(courseId) {
        plannerCourses = plannerCourses.filter(c => c.id !== courseId);
        saveCoursesToStorage();
        renderCourseList();
        updateEstimatedGPS();
    }

    function calculateEstimatedGPS() {
        let totalCredits = 0;
        let totalGradePoints = 0;
        const standardGradeMap = gradeMap('AF');

        plannerCourses.forEach(course => {
            const credit = course.credit || 0;
            const grade = course.grade || '—';

            if (credit > 0 && standardGradeMap[grade] !== undefined) { // Only count A-F grades for GPA
                totalCredits += credit;
                totalGradePoints += credit * standardGradeMap[grade];
            }
        });

        return totalCredits > 0 ? (totalGradePoints / totalCredits) : 0;
    }

    function updateEstimatedGPS() {
        const gps = calculateEstimatedGPS();
        estimatedGpsEl.textContent = gps.toFixed(2);
    }

    // --- UI Rendering ---
    function renderCourseList() {
        if (plannerCourses.length === 0) {
            courseListContainer.innerHTML = '<p class="text-center muted" style="margin: 20px 0;">No courses added to the planner yet.</p>';
            return;
        }

        courseListContainer.innerHTML = plannerCourses.map(course => `
            <div class="list-card" data-id="${course.id}">
              <div class="rowx">
                <div><b>${course.code || 'N/A'}</b></div>
                <div>${course.name || 'Unnamed Course'}</div>
                <div>${course.credit || 0}</div>
                <div>${course.score !== undefined ? Math.round(course.score) : '—'}</div>
                <div><b>${course.grade || '—'}</b></div>
                <div><button class="action" aria-label="Actions for ${course.name || course.code}">•••</button></div>
              </div>
            </div>
        `).join('');
    }

    // --- Modal Logic ---
    function openModalForAdd() {
        modalTitle.textContent = 'Add New Course';
        form.reset();
        courseIdInput.value = ''; // Ensure no ID for adding
        compZone.innerHTML = ''; // Clear components
        ensureOneComponentRow();
        resultEl.textContent = 'Total Score: — | Estimated Grade: —';
        modal.showModal();
    }

    function openModalForEdit(courseId) {
        const course = plannerCourses.find(c => c.id === courseId);
        if (!course) return;

        modalTitle.textContent = 'Edit Course';
        form.reset(); // Reset first
        courseIdInput.value = course.id;
        form.course_code.value = course.code || '';
        form.course_name.value = course.name || '';
        form.credit.value = course.credit || '';
        form.grading_scale.value = course.gradeScale || 'AF';

        // Populate components
        compZone.innerHTML = ''; // Clear existing
        if (course.components && course.components.length > 0) {
            course.components.forEach(comp => addComponentRow(comp.name, comp.weight, comp.max, comp.score));
        } else {
            ensureOneComponentRow(); // Add one blank row if no components saved
        }

        // Display saved score/grade
        resultEl.textContent = `Total Score: ${course.score !== undefined ? Math.round(course.score) : '—'} | Estimated Grade: ${course.grade || '—'}`;

        modal.showModal();
    }

    function componentRowTemplate() {
        return `
          <div class="comp-row">
            <input class="sm" name="comp_name" placeholder="Midterm, Final, etc." aria-label="Component Name">
            <input class="sm" name="weight_pct" type="number" min="0" max="100" step="0.1" placeholder="Weight %" aria-label="Component Weight Percentage">
            <input class="sm" name="max_score" type="number" min="0" step="0.1" placeholder="Max Score" aria-label="Component Max Score">
            <input class="sm" name="score" type="number" min="0" step="0.1" placeholder="Your Score" aria-label="Component Your Score">
            <button type="button" class="pill-btn remove" aria-label="Remove Component">✕</button>
          </div>`;
    }

    function addComponentRow(name = '', weight = '', max = '', score = '') {
         const newRowHtml = componentRowTemplate();
         compZone.insertAdjacentHTML('beforeend', newRowHtml);
         const newRowElement = compZone.lastElementChild;
         if (newRowElement) {
            newRowElement.querySelector('[name="comp_name"]').value = name;
            newRowElement.querySelector('[name="weight_pct"]').value = weight;
            newRowElement.querySelector('[name="max_score"]').value = max;
            newRowElement.querySelector('[name="score"]').value = score;
         }
    }


    function ensureOneComponentRow() {
        if (compZone.children.length === 0) {
            addComponentRow(); // Add one blank row
        }
    }

    function calculateScoreAndGrade() {
        const scale = form.grading_scale.value || 'AF';
        let totalScore = 0;
        let totalWeight = 0; // To check if weights sum up reasonably
        const componentsData = [];

        compZone.querySelectorAll('.comp-row').forEach(row => {
            const nameInput = row.querySelector('[name="comp_name"]');
            // Skip header row if present (based on lack of input or specific class if added)
            if (!nameInput) return;

            const name = nameInput.value.trim();
            const weight = parseFloat(row.querySelector('[name="weight_pct"]').value) || 0;
            const max = parseFloat(row.querySelector('[name="max_score"]').value) || 0;
            const score = parseFloat(row.querySelector('[name="score"]').value) || 0;

            if (weight > 0 && max > 0) { // Only calculate score for valid components
                totalScore += weight * (score / max);
            }
            totalWeight += weight; // Sum weights regardless for validation check

             // Store component data for saving later
            componentsData.push({ name, weight, max, score });
        });

        // Optional: Warn if weights don't sum near 100
        // if (Math.abs(totalWeight - 100) > 1 && totalWeight > 0) { // Tolerance of 1%
        //     console.warn(`Component weights sum to ${totalWeight.toFixed(1)}%, expected 100%.`);
        //     // Optionally display a warning to the user
        // }

        // Clamp total score between 0 and 100
        totalScore = Math.max(0, Math.min(100, totalScore));

        let grade = "—";
        if (scale === "SU") {
            grade = totalScore >= 60 ? "S" : "U";
        } else { // Standard A-F
            if (totalScore >= 80) grade = "A";
            else if (totalScore >= 75) grade = "B+";
            else if (totalScore >= 70) grade = "B";
            else if (totalScore >= 65) grade = "C+";
            else if (totalScore >= 60) grade = "C";
            else if (totalScore >= 55) grade = "D+";
            else if (totalScore >= 50) grade = "D";
            else grade = "F";
        }

        resultEl.textContent = `Total Score: ${totalScore.toFixed(1)} | Estimated Grade: ${grade}`;
        return { totalScore, grade, componentsData };
    }

    function handleSave() {
        // Perform calculation first to get results
        const { totalScore, grade, componentsData } = calculateScoreAndGrade();

        const courseData = {
            id: courseIdInput.value || null, // Get ID if editing
            code: form.course_code.value.trim().toUpperCase(),
            name: form.course_name.value.trim(),
            credit: parseInt(form.credit.value, 10) || 0,
            gradeScale: form.grading_scale.value,
            score: totalScore,
            grade: grade,
            components: componentsData // Save the component details
        };

        if (!courseData.code || !courseData.name || courseData.credit <= 0) {
            alert("Please fill in Course Code, Course Name, and a valid Credit amount.");
            return;
        }

        if (courseData.id) {
            updateCourse(courseData);
        } else {
            addCourse(courseData);
        }

        modal.close(); // Close modal after successful save
    }

    // --- Action Menu Logic ---
    function showActionMenu(buttonElement, courseId) {
        // Remove any existing menus
        document.querySelectorAll('.context-menu').forEach(menu => menu.remove());

        const course = plannerCourses.find(c => c.id === courseId);
        if (!course) return;

        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.innerHTML = `
            <button class="edit" data-id="${courseId}">✏️ Edit Details</button>
            <button class="delete" data-id="${courseId}">🗑️ Delete Course</button>
        `;
        document.body.appendChild(menu);

        // Position the menu below the button
        const btnRect = buttonElement.getBoundingClientRect();
        menu.style.position = 'absolute'; // Use absolute positioning
        menu.style.top = `${window.scrollY + btnRect.bottom + 2}px`; // Position below button, account for scroll
        menu.style.left = `${window.scrollX + btnRect.left}px`; // Align left edge

         // Prevent menu from going off-screen right
        if (menu.offsetLeft + menu.offsetWidth > window.innerWidth - 10) {
            menu.style.left = `${window.innerWidth - menu.offsetWidth - 10}px`;
        }
        // Prevent menu from going off-screen bottom (less common)
        if (menu.offsetTop + menu.offsetHeight > window.innerHeight - 10) {
            menu.style.top = `${window.scrollY + btnRect.top - menu.offsetHeight - 2}px`; // Position above
        }


        // Add event listeners for menu actions
        menu.querySelector('.edit').addEventListener('click', () => {
            openModalForEdit(courseId);
            menu.remove();
        });
        menu.querySelector('.delete').addEventListener('click', () => {
            if (confirm(`Delete course "${course.name || course.code}"?`)) {
                deleteCourse(courseId);
            }
            menu.remove();
        });

        // Close menu when clicking outside
        // Use setTimeout to allow the current click event to finish
        setTimeout(() => {
            document.addEventListener('click', function closeMenuHandler(e) {
                if (!menu.contains(e.target) && !buttonElement.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', closeMenuHandler); // Clean up listener
                }
            }, { capture: true, once: true }); // Use capture phase and remove after one use
        }, 0);
    }


    // --- Event Listeners ---
    openModalBtn.addEventListener('click', openModalForAdd);
    closeBtn.addEventListener('click', () => modal.close());
    addCompBtn.addEventListener('click', () => addComponentRow()); // Add blank row
    calcBtn.addEventListener('click', calculateScoreAndGrade);
    saveBtn.addEventListener('click', handleSave);

    // Event delegation for removing component rows
    compZone.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove')) {
            e.target.closest('.comp-row').remove();
            ensureOneComponentRow(); // Make sure at least one row remains if all are deleted
        }
    });

    // Event delegation for action menus on course cards
    courseListContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('action')) {
            const card = e.target.closest('.list-card');
            const courseId = card?.dataset.id;
            if (courseId) {
                showActionMenu(e.target, courseId);
            }
        }
    });

    // --- Initial Load ---
    // Load user info for header
    const userData = getCurrentUserData();
     if (userData && userData.info) {
        document.getElementById('student-badge').textContent = `${userData.info.name || 'N/A'} • ${userData.info.id || 'N/A'}`;
        const trackId = userData.info.track_id;
        const trackName = (trackId && trackId !== "N/A" && window.TRACKS_INFO && window.TRACKS_INFO[trackId])
                            ? window.TRACKS_INFO[trackId].full_name
                            : '(No Track Selected)';
        document.getElementById('student-track').textContent = `Track: ${trackName}`;
    }

    // Load courses from local storage
    loadCoursesFromStorage();

}); // End DOMContentLoaded