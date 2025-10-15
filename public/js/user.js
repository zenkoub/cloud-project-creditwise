// NOTE: ข้อมูลใน USER_DATA จะใช้เป็น Mock Database 
// Key หลักคือ รหัสนักศึกษา (Student ID) หรือ "admin"

const USER_DATA = {
    // ----------------------------------------------------
    // 1. เจ้าหน้าที่ (Admin)
    // ----------------------------------------------------
    "admin": {
        "info": {
            "name": "Admin Officer",
            "id": "ADMIN",
            "track_id": "N/A",
            "study_plan": "N/A",
            "current_year": 0,
            "current_semester": "1"
        }
    },

    // ----------------------------------------------------
    // 2. นักศึกษาปี 3 - ITI (User ที่ใช้ในตัวอย่างก่อนหน้า)
    // ----------------------------------------------------
    "66070138": {
        "info": {
            "name": "Peerapat Meesangngoen",
            "id": "66070138",
            "track_id": "ITI",
            "study_plan": "Non-Co-op",
            "current_year": 3, 
            "current_semester": "1"
        },
        // รหัสผ่าน: 11111111 (จำลอง)
        "grades": {
            // 🚀 เพิ่ม status ที่สอดคล้องกับเกรด
            "06016402": { "grade": "A", "credit": 3, "status": "Passed" },
            "06066303": { "grade": "B+", "credit": 3, "status": "Passed" },
            "06016411": { "grade": "F", "credit": 3, "status": "Failed" }, 
            "90641001": { "grade": "A", "credit": 3, "status": "Passed" },
            "90644007": { "grade": "B+", "credit": 3, "status": "Passed" },
            "06016408": { "grade": "B", "credit": 3, "status": "Passed" },
            "06066001": { "grade": "C+", "credit": 3, "status": "Passed" },
            "06066301": { "grade": "W", "credit": 3, "status": "Withdrawn" }, 
        },
        "user_electives": {
            "LNC_ELEC_1": { "code": "90644050", "name": "BUSINESS ENGLISH", "credit": 3, "grade": "B", "status": "Passed", "type": "Gen_LNC_Elective", "slot_id": "LNC_ELEC_1", "is_user_entry_slot": true },
        },
        "free_electives": [],
        "academic_history": [
             { term: '1/68', term_gpa: 3.40, gpax: 3.40 },
             { term: '2/68', term_gpa: 2.75, gpax: 3.10 },
        ]
    },
    
    // ----------------------------------------------------
    // 3. นักศึกษาปี 2 - SD
    // ----------------------------------------------------
    "67070001": {
        "info": {
            "name": "Somsak Digital",
            "id": "67070001",
            "track_id": "SD",
            "study_plan": "Non-Co-op",
            "current_year": 2, 
            "current_semester": "1"
        },
        "grades": {
            "06016402": { "grade": "B", "credit": 3, "status": "Passed" },
            "06066303": { "grade": "A", "credit": 3, "status": "Passed" },
            "06016411": { "grade": "B+", "credit": 3, "status": "Passed" },
            "90641001": { "grade": "C", "credit": 3, "status": "Passed" },
            "90644007": { "grade": "C+", "credit": 3, "status": "Passed" },
        },
        "user_electives": {},
        "free_electives": [],
        "academic_history": [{ term: '1/68', term_gpa: 3.10, gpax: 3.10 }]
    },

    // ----------------------------------------------------
    // 4. นักศึกษาปี 2 - ITI
    // ----------------------------------------------------
    "67070002": {
        "info": {
            "name": "Saranya Cloud",
            "id": "67070002",
            "track_id": "ITI",
            "study_plan": "Co-op", 
            "current_year": 2, 
            "current_semester": "1"
        },
        "grades": {
            "06016402": { "grade": "A", "credit": 3, "status": "Passed" },
            "06066303": { "grade": "A", "credit": 3, "status": "Passed" },
            "06016411": { "grade": "A", "credit": 3, "status": "Passed" },
            "90641001": { "grade": "A", "credit": 3, "status": "Passed" },
        },
        "user_electives": {},
        "free_electives": [],
        "academic_history": [{ term: '1/68', term_gpa: 4.00, gpax: 4.00 }]
    },

    // ----------------------------------------------------
    // 5. นักศึกษาปี 2 - MM
    // ----------------------------------------------------
    "67070003": {
        "info": {
            "name": "Prayut Media",
            "id": "67070003",
            "track_id": "MM",
            "study_plan": "Non-Co-op",
            "current_year": 2, 
            "current_semester": "1"
        },
        "grades": {
            "06016402": { "grade": "D+", "credit": 3, "status": "Passed" },
            "06066303": { "grade": "C", "credit": 3, "status": "Passed" },
            "06016411": { "grade": "C", "credit": 3, "status": "Passed" },
            "90641001": { "grade": "B", "credit": 3, "status": "Passed" },
            "90644007": { "grade": "B+", "credit": 3, "status": "Passed" },
            "06066301": { "grade": "F", "credit": 3, "status": "Failed" }, 
        },
        "user_electives": {},
        "free_electives": [],
        "academic_history": [{ term: '1/68', term_gpa: 2.50, gpax: 2.50 }]
    }
};

function getCurrentUserData(userId = null) {
    if (!userId) {
        userId = localStorage.getItem('cw_user');
    }
    
    // Fallback: หาก Local Storage ว่าง ให้ใช้ 66070138 เป็น default
    if (!userId) {
         userId = "66070138";
    }

    const data = USER_DATA[userId] || USER_DATA["66070138"]; 
    
    return data;
}