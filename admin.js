// ข้อมูลตัวอย่าง + ฟังก์ชันเก็บ/อ่านจาก localStorage
(function(global){
  const KEY_STU = 'cw_students';
  const KEY_CRS = 'cw_courses';

  function seed(){
    if(!localStorage.getItem(KEY_STU)){
      const students = [
        { name:'Peerapat', surname:'Meesangngoen', email:'66070138@kmitl.ac.th', credit:33, gpa:3.10, status:'Normal', statusCls:'pass' },
        { name:'Thanakorn', surname:'W.', email:'66070xxx@kmitl.ac.th', credit:28, gpa:2.85, status:'Normal', statusCls:'pass' },
        { name:'Jirapat', surname:'K.', email:'66070yyy@kmitl.ac.th', credit:18, gpa:1.95, status:'Probation', statusCls:'fail' },
      ];
      localStorage.setItem(KEY_STU, JSON.stringify(students));
    }
    if(!localStorage.getItem(KEY_CRS)){
      const courses = [
        { id:1, year:1, semester:1, code:'06016401', name:'MATHEMATICS FOR INFORMATION TECHNOLOGY', credit:3, capacity:80, enroll:27 },
        { id:2, year:1, semester:1, code:'06016402', name:'INFORMATION TECHNOLOGY FUNDAMENTALS', credit:3, capacity:80, enroll:25 },
        { id:3, year:1, semester:1, code:'06016411', name:'INTRODUCTION TO COMPUTER SYSTEMS', credit:3, capacity:75, enroll:39 },
        { id:4, year:1, semester:1, code:'06086303', name:'PROBLEM SOLVING AND COMPUTER PROGRAMMING', credit:3, capacity:120, enroll:60 },
        { id:5, year:1, semester:1, code:'90641001', name:'CHARM SCHOOL', credit:1, capacity:80, enroll:75 },
        { id:6, year:1, semester:1, code:'90644007', name:'FOUNDATION ENGLISH I', credit:3, capacity:80, enroll:70 },
        { id:7, year:1, semester:2, code:'06016401', name:'MATHEMATICS FOR INFORMATION TECHNOLOGY', credit:3, capacity:80, enroll:27 },
        { id:8, year:1, semester:2, code:'06016402', name:'INFORMATION TECHNOLOGY FUNDAMENTALS', credit:3, capacity:80, enroll:66 },
        { id:9, year:1, semester:2, code:'9064XXXX', name:'ELECTIVE COURSE IN GENERAL EDUCATION I', credit:3, capacity:80, enroll:70 },
      ];
      localStorage.setItem(KEY_CRS, JSON.stringify(courses));
    }
  }
  seed();

  function getStudents(){
    return JSON.parse(localStorage.getItem(KEY_STU) || '[]');
  }

  function getCourses(){
    const arr = JSON.parse(localStorage.getItem(KEY_CRS) || '[]');
    // เรียง Year, Semester, Code
    return arr.sort((a,b)=> a.year-b.year || a.semester-b.semester || a.code.localeCompare(b.code));
  }
  function saveCourses(arr){ localStorage.setItem(KEY_CRS, JSON.stringify(arr)); }
  function nextId(arr){ return arr.length? Math.max(...arr.map(x=>x.id))+1 : 1; }

  function addCourse(c){
    const arr = getCourses();
    c.id = nextId(arr);
    arr.push(c); saveCourses(arr);
  }
  function updateCourse(c){
    const arr = getCourses();
    const i = arr.findIndex(x=>x.id===c.id);
    if(i>=0){ arr[i]=c; saveCourses(arr); }
  }
  function deleteCourse(id){
    const arr = getCourses().filter(x=>x.id!==id);
    saveCourses(arr);
  }

  global.cwAdmin = {
    getStudents,
    getCourses,
    addCourse,
    updateCourse,
    deleteCourse
  };
})(window);
