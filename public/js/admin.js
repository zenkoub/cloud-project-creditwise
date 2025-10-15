// admin.js

(function(global){
    const KEY_STU = 'cw_students';
    
    let courseList = []; 
    let nextId = 1;

    // Helper: สร้าง List Course จาก MASTER_CURRICULUM (รันครั้งเดียว)
    function initializeMasterCourses() {
        if (!global.MASTER_CURRICULUM) {
             // ถ้าเรียกใช้เร็วเกินไป
             return [];
        }
        
        let tempCourseList = [];
        let currentId = 1;
        
        const masterData = global.MASTER_CURRICULUM;
        const allTracks = ['CORE', ...Object.keys(masterData).filter(k => k !== 'CORE')];

        for (const trackId of allTracks) {
            const trackData = masterData[trackId];
            if (!trackData) continue;

            for (const yearKey in trackData) {
                for (const semesterKey in trackData[yearKey]) {
                    const courses = trackData[yearKey][semesterKey];
                    
                    courses.forEach(c => {
                        const uniqueIdentifier = `${c.code}-${yearKey}-${semesterKey}-${trackId}`;
                        
                        const isDuplicate = tempCourseList.some(existing => existing.identifier === uniqueIdentifier);
                        if (trackId !== 'CORE' && isDuplicate) return;

                        const yearNum = parseInt(yearKey.replace('Year ', ''));
                        let semMatch = semesterKey.match(/\d/);
                        const semesterNum = semMatch ? parseInt(semMatch[0]) : 0; 

                        tempCourseList.push({
                            id: currentId++,
                            identifier: uniqueIdentifier, 
                            year: yearNum,
                            semester: semesterNum,
                            code: c.code,
                            name: c.name,
                            credit: c.credit,
                            capacity: c.capacity || 80, 
                            enroll: c.enroll || 0,
                            type: c.type || 'N/A',
                            track: trackId, 
                            semester_key: semesterKey 
                        });
                    });
                }
            }
        }
        courseList = tempCourseList;
        nextId = currentId;
    }

    // Logic Seeding Student (ใช้ localStorage)
    function seed() {
        if (!localStorage.getItem(KEY_STU)){
            const students = [
                { id: 1, name:'Peerapat', surname:'Meesangngoen', email:'66070138@kmitl.ac.th', credit:33, gpa:3.10, status:'Normal', statusCls:'pass' },
                { id: 2, name:'Thanakorn', surname:'W.', email:'66070xxx@kmitl.ac.th', credit:28, gpa:2.85, status:'Normal', statusCls:'pass' },
                { id: 3, name:'Jirapat', surname:'K.', email:'66070yyy@kmitl.ac.th', credit:18, gpa:1.95, status:'Probation', statusCls:'fail' },
            ];
            localStorage.setItem(KEY_STU, JSON.stringify(students));
        }
        
        // 🚀 เรียกใช้ initialization Master Courses ทันทีถ้าข้อมูล Master พร้อม
        if (global.MASTER_CURRICULUM) {
             initializeMasterCourses();
        }
    }
    
    document.addEventListener('DOMContentLoaded', seed);

    function getCourses(){
        // 🚀 บังคับ initialize ถ้า courseList ยังว่าง (แก้ปัญหา Timing)
        if (courseList.length === 0 && global.MASTER_CURRICULUM) {
             initializeMasterCourses();
        }
        return courseList.sort((a,b)=> a.year-b.year || a.semester-b.semester || a.code.localeCompare(b.code));
    }
    
    // ... (ส่วน CRUD อื่นๆ และ getStudents ยังคงเดิม) ...

    global.cwAdmin = {
        getStudents: () => JSON.parse(localStorage.getItem(KEY_STU) || '[]'),
        getCourses,
        addCourse: (c) => {
            c.id = nextId++;
            courseList.push(c); 
        },
        updateCourse: (c) => {
            const i = courseList.findIndex(x=>x.id===c.id);
            if(i>=0){ courseList[i]={...courseList[i], ...c}; }
        },
        deleteCourse: (id) => {
            courseList = courseList.filter(x=>x.id!==id);
        }
    };
})(window);