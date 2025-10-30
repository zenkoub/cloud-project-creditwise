// js/admin.js
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

(function (global) {
    'use strict'; // Enable strict mode for better error detection

    let courseList = [];
    let nextId = 1;
    let hasInitializedCourses = false; // Flag to prevent multiple initializations

    // --- Course Initialization ---

    /**
     * Initializes the global course list from MASTER_CURRICULUM.
     * Safe to call multiple times (idempotent).
     * Dispatches 'coursesInitialized' event on successful completion.
     */
    function initializeMasterCourses() {
        if (hasInitializedCourses || !global.MASTER_CURRICULUM) {
            if (!global.MASTER_CURRICULUM) {
                console.warn("⚠️ MASTER_CURRICULUM not found when attempting initialization.");
            }
            return; // Exit if already run or master data isn't ready
        }

        console.log("🚀 Initialize Master Course Running...");

        let tempCourseList = [];
        let currentId = 1;
        const masterData = global.MASTER_CURRICULUM;
        // Use CORE first, then other tracks
        const allTracks = ['CORE', ...Object.keys(masterData).filter(k => k !== 'CORE').sort()];

        // Use a Set to efficiently track added identifiers (code-year-sem-track)
        const addedIdentifiers = new Set();

        for (const trackId of allTracks) {
            const trackData = masterData[trackId];
            if (!trackData) continue;

            // Iterate through years (Year 1, Year 2, etc.)
            for (const yearKey in trackData) {
                if (!Object.hasOwnProperty.call(trackData, yearKey)) continue;

                // Iterate through semesters within the year
                for (const semesterKey in trackData[yearKey]) {
                    if (!Object.hasOwnProperty.call(trackData[yearKey], semesterKey)) continue;

                    const courses = trackData[yearKey][semesterKey];
                    // Ensure courses is an array before iterating
                    if (!Array.isArray(courses)) {
                        console.warn(`Expected an array for courses in ${trackId}/${yearKey}/${semesterKey}, but got:`, courses);
                        continue;
                    }

                    courses.forEach(c => {
                        // Basic validation of the course object from MASTER_CURRICULUM
                        if (!c || !c.code || !c.name || typeof c.credit !== 'number') {
                            console.warn(`Skipping invalid course object in ${trackId}/${yearKey}/${semesterKey}:`, c);
                            return; // Skip this invalid course object
                        }

                        // Identifier to prevent adding the exact same course definition multiple times
                        // (e.g., a CORE course listed under both CORE and a specific track for the same semester)
                        const uniqueIdentifier = `${c.code}-${yearKey}-${semesterKey}-${trackId}`;
                        const simpleIdentifier = `${c.code}-${yearKey}-${semesterKey}`; // For checking CORE duplicates

                        // Prevent adding the exact same definition twice
                        if (addedIdentifiers.has(uniqueIdentifier)) {
                            return;
                        }
                        // Prevent adding a track-specific version if the CORE version already exists
                        if (trackId !== 'CORE' && addedIdentifiers.has(`${c.code}-${yearKey}-${semesterKey}-CORE`)) {
                            return;
                        }

                        addedIdentifiers.add(uniqueIdentifier); // Mark this specific definition as added

                        const yearNum = parseInt(yearKey.replace('Year ', ''), 10) || 0;
                        const semMatch = semesterKey.match(/\d/);
                        // Map semester: 1, 2, or 0 (treat Summer as 0 internally for easier sorting/filtering maybe?)
                        const semesterNum = semMatch ? parseInt(semMatch[0], 10) : (semesterKey.toLowerCase().includes('summer') ? 0 : 0);

                        tempCourseList.push({
                            id: currentId++,
                            // identifier: uniqueIdentifier, // Keep if needed for debugging
                            year: yearNum,
                            semester: semesterNum, // Use 0 for Summer
                            code: c.code,
                            name: c.name,
                            credit: c.credit,
                            type: c.type || 'N/A',
                            track: trackId === 'CORE' ? 'Core' : trackId, // Standardize 'Core' label
                            semester_key: semesterKey, // Keep original key for reference if needed
                            credit_format: c.credit_format || null // Add credit format
                        });
                    });
                }
            }
        }

        courseList = tempCourseList;
        nextId = currentId;
        hasInitializedCourses = true; // Set flag
        console.log(`✅ Master course initialized: ${courseList.length} courses`);

        // Notify other scripts that courses are ready
        global.dispatchEvent(new CustomEvent('coursesInitialized'));
    }

    /**
     * Gets the current course list, attempting initialization if needed.
     * Returns a sorted **copy** of the course list.
     */
    function getCourses() {
        // Attempt initialization if not done yet and master data is available
        if (!hasInitializedCourses && global.MASTER_CURRICULUM) {
            initializeMasterCourses();
        }
        // Return a sorted copy
        return [...courseList].sort((a, b) =>
            a.year - b.year ||
            a.semester - b.semester ||
            (a.track === 'Core' ? -1 : (b.track === 'Core' ? 1 : a.track.localeCompare(b.track))) || // Core first, then sort tracks
            a.code.localeCompare(b.code)
        );
    }

    // --- Admin Name Loading ---

    /** Loads and displays the logged-in admin's name. */
    function loadAdminName() {
        try {
            if (typeof getCurrentUserData !== 'function') {
                throw new Error('getCurrentUserData function not found. Ensure user.js is loaded before admin.js.');
            }
            const userData = getCurrentUserData(); // Assumes user.js provides this based on localStorage
            const adminNameElement = document.getElementById('admin-name');

            if (adminNameElement) { // Only proceed if the element exists
                if (userData && userData.info && userData.info.role === 'admin') {
                    const nameParts = userData.info.name.split('(');
                    adminNameElement.textContent = `(${nameParts[0].trim()})`;
                } else {
                    // Could happen if localStorage is cleared or role is wrong
                    console.warn("Could not find valid admin user data.");
                    adminNameElement.textContent = '(Admin)'; // Default fallback
                }
            }
        } catch (error) {
            console.error("Error loading admin name:", error);
            const adminNameElement = document.getElementById('admin-name');
            if (adminNameElement) {
                adminNameElement.textContent = '(Error)';
            }
        }
    }

    // --- Initialization ---

    /** Main initialization function called when DOM is ready. */
    function initializeAdmin() {
        // 1. Try to initialize courses immediately if MASTER_CURRICULUM is already loaded
        initializeMasterCourses();

        // 2. Load admin name (requires DOM element 'admin-name')
        loadAdminName();

        // 3. Fallback: If courses weren't initialized yet (MASTER_CURRICULUM loaded late),
        //    listen for the 'load' event as a final attempt.
        if (!hasInitializedCourses) {
            global.addEventListener('load', () => {
                initializeMasterCourses(); // Try again on window load
            }, { once: true }); // Ensure listener runs only once
        }
    }

    // Run initialization when the DOM is fully loaded and parsed
    document.addEventListener('DOMContentLoaded', initializeAdmin);


    // --- Public API ---
    global.cwAdmin = {
        // getStudents: () => JSON.parse(localStorage.getItem(KEY_STU) || '[]'), // Removed student data logic
        getCourses, // Provides a sorted copy

        addCourse: (courseData) => {
            if (!courseData || !courseData.code || !courseData.name || typeof courseData.credit !== 'number' || typeof courseData.year !== 'number' || typeof courseData.semester !== 'number') {
                console.error("Invalid course data for add:", courseData);
                return false; // Indicate failure
            }
            courseData.id = nextId++;
            courseData.track = courseData.track || "Core"; // Ensure track defaults to 'Core'
            courseList.push(courseData);
            console.log("Added course:", courseData.id, courseData.code);
            // Optional: Dispatch an event to notify UI about the change
            // global.dispatchEvent(new CustomEvent('coursesUpdated'));
            return true; // Indicate success
        },

        updateCourse: (courseData) => {
            if (!courseData || typeof courseData.id !== 'number' || !courseData.code || !courseData.name || typeof courseData.credit !== 'number' || typeof courseData.year !== 'number' || typeof courseData.semester !== 'number') {
                 console.error("Invalid course data for update:", courseData);
                 return false; // Indicate failure
            }
            const index = courseList.findIndex(x => x.id === courseData.id);
            if (index !== -1) {
                // Merge new data onto existing data, ensuring required fields are present
                courseList[index] = { ...courseList[index], ...courseData };
                console.log("Updated course:", courseData.id, courseData.code);
                // Optional: Dispatch an event to notify UI about the change
                // global.dispatchEvent(new CustomEvent('coursesUpdated'));
                return true; // Indicate success
            }
            console.warn("Course not found for update:", courseData.id);
            return false; // Indicate failure
        },

        deleteCourse: (id) => {
            const initialLength = courseList.length;
            courseList = courseList.filter(x => x.id !== id);
            const success = courseList.length < initialLength;
            if (success) {
                console.log("Deleted course:", id);
                // Optional: Dispatch an event to notify UI about the change
                // global.dispatchEvent(new CustomEvent('coursesUpdated'));
            } else {
                 console.warn("Course not found for delete:", id);
            }
            return success; // Indicate success/failure
        }
    };

})(window); // Pass window explicitly