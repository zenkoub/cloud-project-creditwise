//js/user.js

// ✅ NOTE: ข้อมูลใน USER_DATA จะใช้เป็น Mock Database
// Key หลักคือ รหัสนักศึกษา (Student ID) หรือ "admin"

const USER_DATA = {
    // ----------------------------------------------------
    // 1. เจ้าหน้าที่ (Admin)
    // ----------------------------------------------------
    "peerapat_admin": {
        "info": {
            "name": "Peerapat (Admin)",
            "id": "peerapat_admin",
            "role": "admin",
            "password": "11111111",
            "track_id": "N/A",
            "study_plan": "N/A",
            "current_year": 0,
            "current_semester": "1"
        }
    },
    "kubun_admin": {
        "info": {
            "name": "Kubun (Admin)",
            "id": "kubun_admin",
            "role": "admin",
            "password": "11111111",
            "track_id": "N/A",
            "study_plan": "N/A",
            "current_year": 0,
            "current_semester": "1"
        }
    },
    "teerati_admin": {
        "info": {
            "name": "Teerati (Admin)",
            "id": "teerati_admin",
            "role": "admin",
            "password": "11111111",
            "track_id": "N/A",
            "study_plan": "N/A",
            "current_year": 0,
            "current_semester": "1"
        }
    },

    // ----------------------------------------------------
    // 2. นักศึกษา (ตัวอย่างผู้ใช้)
    // ----------------------------------------------------
    "66070138": {
        "info": {
            "name": "Peerapat Meesangngoen",
            "id": "66070138",
            "role": "student",
            "password": "11111111",
            "track_id": "ITI",
            "study_plan": "Non-Co-op",
            "current_year": 3,
            "current_semester": "1"
        },
        "grades": {
            "06016402": { "grade": "A", "credit": 3, "status": "Passed" }, "06066303": { "grade": "B+", "credit": 3, "status": "Passed" },
            "06016411": { "grade": "F", "credit": 3, "status": "Failed" }, "90641001": { "grade": "A", "credit": 3, "status": "Passed" },
            "90644007": { "grade": "B+", "credit": 3, "status": "Passed" }, "06016408": { "grade": "B", "credit": 3, "status": "Passed" },
            "06066001": { "grade": "C+", "credit": 3, "status": "Passed" }
        },
        "academic_history": [{ term: '1/68', term_gpa: 3.40, gpax: 3.40 }, { term: '2/68', term_gpa: 2.75, gpax: 3.10 }]
    },

    // ----------------------------------------------------
    // SET 1: เคสรีไทร์ทันที (GPAX < 1.00) - (ปี 1)
    // ----------------------------------------------------
    "67072001": {
        "info": { "name": "Anucha Failfast", "id": "67072001", "role": "student", "password": "11111111", "track_id": "N/A", "study_plan": "Non-Co-op", "current_year": 1, "current_semester": "1" },
        "grades": { "06016402": { "grade": "F", "credit": 3, "status": "Failed" }, "06066303": { "grade": "F", "credit": 3, "status": "Failed" }, "06016411": { "grade": "D", "credit": 3, "status": "Passed" } },
        "academic_history": [{ term: '1/68', term_gpa: 0.33, gpax: 0.33 }]
    },
    "67072002": {
        "info": { "name": "Benjawan Gone", "id": "67072002", "role": "student", "password": "11111111", "track_id": "N/A", "study_plan": "Non-Co-op", "current_year": 1, "current_semester": "1" },
        "grades": { "06016402": { "grade": "F", "credit": 3, "status": "Failed" }, "06066303": { "grade": "F", "credit": 3, "status": "Failed" }, "06016411": { "grade": "F", "credit": 3, "status": "Failed" } },
        "academic_history": [{ term: '1/68', term_gpa: 0.00, gpax: 0.00 }]
    },

    // ----------------------------------------------------
    // SET 2: เคสติดโปร (1.00 <= GPAX < 2.00) - (ปี 1)
    // ----------------------------------------------------
    "67072003": {
        "info": { "name": "Chalerm Trying", "id": "67072003", "role": "student", "password": "11111111", "track_id": "N/A", "study_plan": "Non-Co-op", "current_year": 1, "current_semester": "2" },
        "grades": { "06016402": { "grade": "C", "credit": 3, "status": "Passed" }, "06066303": { "grade": "D", "credit": 3, "status": "Passed" }, "06016411": { "grade": "D+", "credit": 3, "status": "Passed" } },
        "academic_history": [{ term: '1/68', term_gpa: 1.50, gpax: 1.50 }]
    },
    "67072004": {
        "info": { "name": "Darunee OnEdge", "id": "67072004", "role": "student", "password": "11111111", "track_id": "N/A", "study_plan": "Co-op", "current_year": 1, "current_semester": "2" },
        "grades": { "06016402": { "grade": "B", "credit": 3, "status": "Passed" }, "06066303": { "grade": "F", "credit": 3, "status": "Failed" }, "06016411": { "grade": "C", "credit": 3, "status": "Passed" } },
        "academic_history": [{ term: '1/68', term_gpa: 1.67, gpax: 1.67 }]
    },

    // ----------------------------------------------------
    // SET 3: เคสลากโปร (GPAX < 2.00 แต่ Term GPA >= 2.00)
    // ----------------------------------------------------
    "66072005": {
        "info": { "name": "Ekkachai Prolong", "id": "66072005", "role": "student", "password": "11111111", "track_id": "MM", "study_plan": "Non-Co-op", "current_year": 2, "current_semester": "2" },
        "academic_history": [
            { term: '1/67', term_gpa: 1.80, gpax: 1.80 },
            { term: '2/67', term_gpa: 2.10, gpax: 1.95 },
            { term: '1/68', term_gpa: 2.00, gpax: 1.97 }
        ]
    },
    "65072006": {
        "info": { "name": "Fonthip Survivor", "id": "65072006", "role": "student", "password": "11111111", "track_id": "ITI", "study_plan": "Non-Co-op", "current_year": 3, "current_semester": "2" },
        "academic_history": [
            { term: '1/66', term_gpa: 1.75, gpax: 1.75 },
            { term: '2/66', term_gpa: 2.20, gpax: 1.98 },
            { term: '1/67', term_gpa: 2.10, gpax: 1.99 },
            { term: '2/67', term_gpa: 2.05, gpax: 1.99 },
            { term: '1/68', term_gpa: 2.00, gpax: 1.99 }
        ]
    },

    // ----------------------------------------------------
    // SET 4: เคสรีไทร์จากโปร (Term GPA < 2.00)
    // ----------------------------------------------------
    "66072007": {
        "info": { "name": "Giat Failagain", "id": "66072007", "role": "student", "password": "11111111", "track_id": "SD", "study_plan": "Non-Co-op", "current_year": 2, "current_semester": "1" },
        "academic_history": [
            { term: '1/67', term_gpa: 1.90, gpax: 1.90 },
            { term: '2/67', term_gpa: 1.50, gpax: 1.70 }
        ]
    },
    "66072008": {
        "info": { "name": "Hataichanok Dropped", "id": "66072008", "role": "student", "password": "11111111", "track_id": "MM", "study_plan": "Non-Co-op", "current_year": 2, "current_semester": "2" },
        "academic_history": [
            { term: '1/67', term_gpa: 1.60, gpax: 1.60 },
            { term: '2/67', term_gpa: 2.10, gpax: 1.85 },
            { term: '1/68', term_gpa: 1.90, gpax: 1.87 }
        ]
    },

    // ----------------------------------------------------
    // SET 5: เคสพ้นโปร (GPAX >= 2.00)
    // ----------------------------------------------------
    "66072009": {
        "info": { "name": "Ittipon Climber", "id": "66072009", "role": "student", "password": "11111111", "track_id": "ITI", "study_plan": "Co-op", "current_year": 2, "current_semester": "2" },
        "academic_history": [
            { term: '1/67', term_gpa: 1.85, gpax: 1.85 },
            { term: '2/67', term_gpa: 2.20, gpax: 2.03 }
        ]
    },
    "65072010": {
        "info": { "name": "Jintara Recovered", "id": "65072010", "role": "student", "password": "11111111", "track_id": "SD", "study_plan": "Non-Co-op", "current_year": 3, "current_semester": "1" },
        "academic_history": [
            { term: '1/66', term_gpa: 1.90, gpax: 1.90 },
            { term: '2/66', term_gpa: 2.00, gpax: 1.95 },
            { term: '1/67', term_gpa: 2.10, gpax: 2.00 }
        ]
    },

    // ----------------------------------------------------
    // SET 6: เคสปกติ (GPAX >= 2.00 ตลอด)
    // ----------------------------------------------------
    "67072011": {
        "info": { "name": "Kiattisak Normal", "id": "67072011", "role": "student", "password": "11111111", "track_id": "N/A", "study_plan": "Non-Co-op", "current_year": 1, "current_semester": "2" },
        "academic_history": [{ term: '1/68', term_gpa: 2.50, gpax: 2.50 }]
    },
    "66072012": {
        "info": { "name": "Ladda Steady", "id": "66072012", "role": "student", "password": "11111111", "track_id": "MM", "study_plan": "Co-op", "current_year": 2, "current_semester": "2" },
        "academic_history": [
            { term: '1/67', term_gpa: 2.80, gpax: 2.80 },
            { term: '2/67', term_gpa: 2.70, gpax: 2.75 }
        ]
    },
    "65072013": {
        "info": { "name": "Mana Goodstudent", "id": "65072013", "role": "student", "password": "11111111", "track_id": "ITI", "study_plan": "Co-op", "current_year": 3, "current_semester": "1" },
        "grades": { "06016404": { "grade": "A", "credit": 3, "status": "Passed" }, "06066102": { "grade": "B+", "credit": 3, "status": "Passed" } },
        "academic_history": [
            { term: '1/66', term_gpa: 3.50, gpax: 3.50 }, { term: '2/66', term_gpa: 3.20, gpax: 3.35 },
            { term: '1/67', term_gpa: 3.00, gpax: 3.23 }, { term: '2/67', term_gpa: 3.40, gpax: 3.27 }
        ]
    },
    "64072014": {
        "info": { "name": "Nipa Senior", "id": "64072014", "role": "student", "password": "11111111", "track_id": "SD", "study_plan": "Non-Co-op", "current_year": 4, "current_semester": "1" },
        "academic_history": [
            { term: '1/65', term_gpa: 2.20, gpax: 2.20 }, { term: '2/65', term_gpa: 2.30, gpax: 2.25 },
            { term: '1/66', term_gpa: 2.50, gpax: 2.33 }, { term: '2/66', term_gpa: 2.40, gpax: 2.35 },
            { term: '1/67', term_gpa: 2.60, gpax: 2.40 }, { term: '2/67', term_gpa: 2.70, gpax: 2.45 }
        ]
    },

    // ----------------------------------------------------
    // SET 7: เคสพิเศษ (ปีสูง, Co-op, จบแล้ว)
    // ----------------------------------------------------
    "64072015": {
        "info": { "name": "Olan Co-op", "id": "64072015", "role": "student", "password": "11111111", "track_id": "ITI", "study_plan": "Co-op", "current_year": 4, "current_semester": "1" },
        "grades": { "06016481": { "grade": "S", "credit": 6, "status": "Passed" } },
        "academic_history": [
            { term: '1/65', term_gpa: 3.00, gpax: 3.00 }, { term: '2/65', term_gpa: 3.10, gpax: 3.05 },
            { term: '1/66', term_gpa: 2.90, gpax: 3.00 }, { term: '2/66 (Co-op)', term_gpa: 0.00, gpax: 3.00 },
            { term: '1/67', term_gpa: 3.20, gpax: 3.03 }, { term: '2/67', term_gpa: 3.00, gpax: 3.02 }
        ]
    },
    "63072016": {
        "info": { "name": "Pranee SuperSenior", "id": "63072016", "role": "student", "password": "11111111", "track_id": "MM", "study_plan": "Non-Co-op", "current_year": 5, "current_semester": "1" },
        "grades": { "06016407": { "grade": "F", "credit": 3, "status": "Failed" } },
        "academic_history": [
            { term: '1/64', term_gpa: 2.10, gpax: 2.10 }, { term: '2/64', term_gpa: 1.90, gpax: 2.00 },
            { term: '1/65', term_gpa: 2.00, gpax: 2.00 }, { term: '2/65', term_gpa: 2.20, gpax: 2.05 },
            { term: '1/66', term_gpa: 2.30, gpax: 2.10 }, { term: '2/66', term_gpa: 2.10, gpax: 2.10 },
            { term: '1/67', term_gpa: 2.00, gpax: 2.08 }, { term: '2/67', term_gpa: 1.80, gpax: 2.05 }
        ]
    },

    // ----------------------------------------------------
    // SET 8: เคสผสม (มี F, มี W, แต่ยังรอด)
    // ----------------------------------------------------
    "65072018": {
        "info": { "name": "Sunee Fighter", "id": "65072018", "role": "student", "password": "11111111", "track_id": "ITI", "study_plan": "Non-Co-op", "current_year": 3, "current_semester": "1" },
        "grades": {
            "06066000": { "grade": "F", "credit": 3, "status": "Failed" },
            "06016413": { "grade": "W", "credit": 3, "status": "Withdrawn" }
        },
        "academic_history": [
            { term: '1/66', term_gpa: 2.80, gpax: 2.80 }, { term: '2/66', term_gpa: 2.50, gpax: 2.65 },
            { term: '1/67', term_gpa: 1.90, gpax: 2.40 },
            { term: '2/67', term_gpa: 2.30, gpax: 2.38 }
        ]
    },
    "64072019": {
        "info": { "name": "Tanawat HighGPA", "id": "64072019", "role": "student", "password": "11111111", "track_id": "SD", "study_plan": "Co-op", "current_year": 4, "current_semester": "1" },
        "academic_history": [
            { term: '1/65', term_gpa: 3.80, gpax: 3.80 }, { term: '2/65', term_gpa: 3.70, gpax: 3.75 },
            { term: '1/66', term_gpa: 3.90, gpax: 3.80 }, { term: '2/66 (Co-op)', term_gpa: 0.00, gpax: 3.80 },
            { term: '1/67', term_gpa: 3.60, gpax: 3.77 }, { term: '2/67', term_gpa: 3.80, gpax: 3.77 }
        ]
    },
    "65072020": {
        "info": { "name": "Ubonwan Average", "id": "65072020", "role": "student", "password": "11111111", "track_id": "MM", "study_plan": "Non-Co-op", "current_year": 3, "current_semester": "1" },
        "academic_history": [
            { term: '1/66', term_gpa: 2.20, gpax: 2.20 }, { term: '2/66', term_gpa: 2.30, gpax: 2.25 },
            { term: '1/67', term_gpa: 2.10, gpax: 2.20 }, { term: '2/67', term_gpa: 2.00, gpax: 2.15 }
        ]
    }
};

function getCurrentUserData(userId = null) {
  if (!userId) userId = localStorage.getItem('cw_user');
  const data = USER_DATA[userId];
  return data;
}