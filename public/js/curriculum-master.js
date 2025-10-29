//js/curriculum-master.js
window.TRACKS_INFO = {
    "SD": { "name": "Software Development", "full_name": "Software Development" },
    "ITI": { "name": "IT Infrastructure", "full_name": "Information Technology Infrastructure" },
    "MM": { "name": "Multimedia & Game", "full_name": "Multimedia for Interactive Media, Web and Game Development" }
};

// ----------------------------------------------------
// โครงสร้างหลักสูตร Master
// ----------------------------------------------------
window.MASTER_CURRICULUM = {
    // ----------------------------------------------------
    // CORE: วิชาแกน (สีเหลือง)
    // ----------------------------------------------------
    "CORE": {
        "Year 1": {
            "Semester 1": [
                { "code": "06016402", "name": "INFORMATION TECHNOLOGY FUNDAMENTALS", "credit": 3, "credit_format": "3(2-2-5)", "type": "Core" },
                { "code": "06066303", "name": "PROBLEM SOLVING AND COMPUTER PROGRAMMING", "credit": 3, "credit_format": "3(2-2-5)", "type": "Core" },
                { "code": "06016411", "name": "INTRODUCTION TO COMPUTER SYSTEMS", "credit": 3, "credit_format": "3(2-2-5)", "type": "Core" },
                { "code": "90641001", "name": "CHARM SCHOOL", "credit": 3, "credit_format": "3(3-0-6)", "type": "Gen" },
                { "code": "90644007", "name": "FOUNDATION ENGLISH 1", "credit": 3, "credit_format": "3(3-0-6)", "type": "Gen" },
            ],
            "Semester 2": [
                { "code": "06016408", "name": "OBJECT-ORIENTED PROGRAMMING", "credit": 3, "credit_format": "3(2-2-5)", "type": "Core" },
                { "code": "06066001", "name": "PROBABILITY AND STATISTICS", "credit": 3, "credit_format": "3(3-0-6)", "type": "Core" },
                { "code": "06066101", "name": "BUSINESS FUNDAMENTALS FOR INFORMATION", "credit": 3, "credit_format": "3(3-0-6)", "type": "Core" },
                { "code": "06066301", "name": "DATA STRUCTURES AND ALGORITHMS", "credit": 3, "credit_format": "3(2-2-5)", "type": "Core" },
                { "code": "90641002", "name": "DIGITAL INTELLIGENCE QUOTIENT", "credit": 3, "credit_format": "3(3-0-6)", "type": "Gen" },
                { "code": "90644008", "name": "FOUNDATION ENGLISH 2", "credit": 3, "credit_format": "3(3-0-6)", "type": "Gen" },
            ]
        },
        "Year 2": {
            "Semester 1": [
                { "code": "06066000", "name": "DISCRETE MATHEMATICS", "credit": 3, "credit_format": "3(3-0-6)", "type": "Core" },
                { "code": "06066304", "name": "INFORMATION SYSTEM ANALYSIS AND DESIGN", "credit": 3, "credit_format": "3(3-0-6)", "type": "Core" },
                { "code": "06066300", "name": "DATABASE SYSTEM CONCEPTS", "credit": 3, "credit_format": "3(2-2-5)", "type": "Core" },
                { "code": "06016413", "name": "INTRODUCTION TO NETWORK SYSTEMS", "credit": 3, "credit_format": "3(2-2-5)", "type": "Core" },
                { "code": "06016409", "name": "PHYSICAL COMPUTING", "credit": 3, "credit_format": "3(2-2-5)", "type": "Core" },
                { "code": "06016403", "name": "MULTIMEDIA TECHNOLOGY", "credit": 3, "credit_format": "3(2-2-5)", "type": "Core" },
            ]
        }
    },
    
    // ----------------------------------------------------
    // SD: Software Development (ใช้เป็น Master Template สำหรับ Year 3, 4)
    // ----------------------------------------------------
    "SD": {
        "Year 2": {
            "Semester 2": [
                { "code": "06016405", "name": "CYBERSECURITY FUNDAMENTAL", "credit": 3, "credit_format": "3(3-0-6)", "type": "Core" },
                { "code": "06016410", "name": "SOFTWARE ENGINEERING", "credit": 3, "credit_format": "3(3-0-6)", "type": "Core" },
                { "code": "06016412", "name": "COMPUTER ORGANIZATION AND OPERATING SYSTEM", "credit": 3, "credit_format": "3(2-2-5)", "type": "Core" },
                { "code": "06066302", "name": "FUNDAMENTAL WEB PROGRAMMING", "credit": 3, "credit_format": "3(2-2-5)", "type": "Core" },
                { "code": "06016414", "name": "NOSQL DATABASE SYSTEMS", "credit": 3, "credit_format": "3(2-2-5)", "type": "Major" },
                { "code": "06016415", "name": "FUNCTIONAL PROGRAMMING", "credit": 3, "credit_format": "3(2-2-5)", "type": "Major" },
            ]
        },
        "Year 3": {
            "Semester 1": [
                { "code": "06016404", "name": "CLOUD COMPUTING", "credit": 3, "credit_format": "3(3-0-6)", "type": "Core" },
                { "code": "06066102", "name": "MANAGEMENT INFORMATION SYSTEMS", "credit": 3, "credit_format": "3(3-0-6)", "type": "Core" },
                { "code": "06016416", "name": "REQUIREMENT ENGINEERING", "credit": 3, "credit_format": "3(3-0-6)", "type": "Major" },
                { "code": "06016417", "name": "SOFTWARE DEVELOPMENT TOOLS AND ENVIRONMENTS", "credit": 3, "credit_format": "3(2-2-5)", "type": "Major" },
                { "code": "06016418", "name": "SERVER-SIDE WEB DEVELOPMENT", "credit": 3, "credit_format": "3(2-2-5)", "type": "Major" }, 
                { "code": "90644xxx", "name": "Elective - Language and Communication", "credit": 3, "credit_format": "3(x-x-x)", "type": "Gen_LNC_Elective", "is_user_entry_slot": true, "slot_id": "LNC_ELEC_1" }, 
            ],
            "Semester 2 (Non-Co-op)": [
                { "code": "06066100", "name": "INFORMATION TECHNOLOGY PROJECT MANAGEMENT", "credit": 3, "credit_format": "3(3-0-6)", "type": "Core" },
                { "code": "060164xx", "name": "Elective Course in Information Technology 1", "credit": 3, "credit_format": "3(x-x-x)", "type": "IT_Elective", "is_user_entry_slot": true, "slot_id": "IT_ELEC_1" }, 
                { "code": "060164xx", "name": "Elective Course in Information Technology 2", "credit": 3, "credit_format": "3(x-x-x)", "type": "IT_Elective", "is_user_entry_slot": true, "slot_id": "IT_ELEC_2" }, 
            ],
            "Semester 2 (Co-op)": [
                { "code": "06016481", "name": "COOPERATIVE EDUCATION", "credit": 6, "credit_format": "6(X-X-X)", "type": "Coop" },
            ]
        },
        "Year 4": {
            "Semester 1 (Non-Co-op)": [
                { "code": "06016406", "name": "PROJECT 1", "credit": 3, "credit_format": "3(0-9-0)", "type": "Major" }, 
                { "code": "90643021", "name": "MODERN ENTREPRENEURS", "credit": 3, "credit_format": "3(3-0-6)", "type": "Gen" },
                { "code": "060164xx", "name": "Elective Course in Information Technology 3", "credit": 3, "credit_format": "3(x-x-x)", "type": "IT_Elective", "is_user_entry_slot": true, "slot_id": "IT_ELEC_3" },
                { "code": "9064xxxx", "name": "Elective - General 1", "credit": 3, "credit_format": "3(x-x-x)", "type": "Gen_Elective", "is_user_entry_slot": true, "slot_id": "GEN_ELEC_1" },
                { "code": "xxxxxxxx", "name": "Free Elective 1", "credit": 3, "credit_format": "3(x-x-x)", "type": "Free_Elective", "is_user_entry_slot": true, "slot_id": "FREE_ELEC_1" },
            ],
            "Semester 2 (Non-Co-op)": [
                { "code": "06016407", "name": "PROJECT 2", "credit": 3, "credit_format": "3(2-2-5)", "type": "Major" },
                { "code": "9064xxxx", "name": "Elective - General 2", "credit": 3, "credit_format": "3(x-x-x)", "type": "Gen_Elective", "is_user_entry_slot": true, "slot_id": "GEN_ELEC_2" },
                { "code": "xxxxxxxx", "name": "Free Elective 2", "credit": 3, "credit_format": "3(x-x-x)", "type": "Free_Elective", "is_user_entry_slot": true, "slot_id": "FREE_ELEC_2" },
            ],
            "Semester 2 (Co-op)": [
                { "code": "06016407", "name": "PROJECT 2", "credit": 3, "credit_format": "3(2-2-5)", "type": "Major" },
                { "code": "06066100", "name": "INFORMATION TECHNOLOGY PROJECT MANAGEMENT", "credit": 3, "credit_format": "3(3-0-6)", "type": "Major" },
                { "code": "90642033", "name": "LAW FOR NEW GENERATION", "credit": 3, "credit_format": "3(3-0-6)", "type": "Gen" },
                { "code": "90644042", "name": "PROFESSIONAL COMMUNICATION AND PRESENTATION", "credit": 3, "credit_format": "3(3-0-6)", "type": "Gen" },
                { "code": "9064xxxx", "name": "Elective - General 2", "credit": 3, "credit_format": "3(x-x-x)", "type": "Gen_Elective", "is_user_entry_slot": true, "slot_id": "GEN_ELEC_2_COOP" },
            ]
        }
    },

    // ----------------------------------------------------
    // ITI: Information Technology Infrastructure
    // ----------------------------------------------------
    "ITI": {
        "Year 2": {
            "Semester 2": [
                { "code": "06016405", "name": "CYBERSECURITY FUNDAMENTAL", "credit": 3, "credit_format": "3(3-0-6)", "type": "Core" },
                { "code": "06016410", "name": "SOFTWARE ENGINEERING", "credit": 3, "credit_format": "3(3-0-6)", "type": "Core" },
                { "code": "06016412", "name": "COMPUTER ORGANIZATION AND OPERATING SYSTEM", "credit": 3, "credit_format": "3(2-2-5)", "type": "Core" },
                { "code": "06066302", "name": "FUNDAMENTAL WEB PROGRAMMING", "credit": 3, "credit_format": "3(2-2-5)", "type": "Core" },
                { "code": "06016419", "name": "COMMUNICATION NETWORK INFRASTRUCTURE", "credit": 3, "credit_format": "3(2-2-5)", "type": "Major" },
                { "code": "06016420", "name": "INFRASTRUCTURE SYSTEMS AND SERVICES", "credit": 3, "credit_format": "3(2-2-5)", "type": "Major" },
            ]
        },
        "Year 3": {
            "Semester 1": [
                { "code": "06016404", "name": "CLOUD COMPUTING", "credit": 3, "credit_format": "3(3-0-6)", "type": "Core" },
                { "code": "06066102", "name": "MANAGEMENT INFORMATION SYSTEMS", "credit": 3, "credit_format": "3(3-0-6)", "type": "Core" },
                { "code": "06016423", "name": "INFRASTRUCTURE PROGRAMMABILITY AND AUTOMATION", "credit": 3, "credit_format": "3(2-2-5)", "type": "Major" },
                { "code": "06016421", "name": "INFORMATION TECHNOLOGY INFRASTRUCTURE SECURITY", "credit": 3, "credit_format": "3(3-0-6)", "type": "Major" },
                { "code": "06016422", "name": "INTERNET OF THINGS", "credit": 3, "credit_format": "3(2-2-5)", "type": "Major" },
                { "code": "90644xxx", "name": "Elective - Language and Communication", "credit": 3, "credit_format": "3(x-x-x)", "type": "Gen_LNC_Elective", "is_user_entry_slot": true, "slot_id": "LNC_ELEC_1" }, 
            ],
            "Semester 2 (Non-Co-op)": [],
            "Semester 2 (Co-op)": [],
        },
        "Year 4": {
            "Semester 1 (Non-Co-op)": [],
            "Semester 2 (Non-Co-op)": [],
            "Semester 2 (Co-op)": [],
        }
    },
    
    // ----------------------------------------------------
    // MM: Multimedia & Game
    // ----------------------------------------------------
    "MM": {
        "Year 2": {
            "Semester 2": [
                { "code": "06016405", "name": "CYBERSECURITY FUNDAMENTAL", "credit": 3, "credit_format": "3(3-0-6)", "type": "Core" },
                { "code": "06016410", "name": "SOFTWARE ENGINEERING", "credit": 3, "credit_format": "3(3-0-6)", "type": "Core" },
                { "code": "06016412", "name": "COMPUTER ORGANIZATION AND OPERATING SYSTEM", "credit": 3, "credit_format": "3(2-2-5)", "type": "Core" },
                { "code": "06066302", "name": "FUNDAMENTAL WEB PROGRAMMING", "credit": 3, "credit_format": "3(2-2-5)", "type": "Core" },
                { "code": "06016424", "name": "HUMAN INTERFACE DESIGN", "credit": 3, "credit_format": "3(3-0-6)", "type": "Major" },
                { "code": "06016425", "name": "VISUAL DESIGN FUNDAMENTALS FOR INTERACTIVE MEDIA", "credit": 3, "credit_format": "3(2-2-5)", "type": "Major" },
            ]
        },
        "Year 3": {
            "Semester 1": [
                { "code": "06016404", "name": "CLOUD COMPUTING", "credit": 3, "credit_format": "3(3-0-6)", "type": "Core" },
                { "code": "06066102", "name": "MANAGEMENT INFORMATION SYSTEMS", "credit": 3, "credit_format": "3(3-0-6)", "type": "Core" },
                { "code": "06016426", "name": "COMPUTER GRAPHICS AND ANIMATION", "credit": 3, "credit_format": "3(2-2-5)", "type": "Major" },
                { "code": "06016427", "name": "INTRODUCTION TO GAME DESIGN AND DEVELOPMENT", "credit": 3, "credit_format": "3(2-2-5)", "type": "Major" },
                { "code": "06016428", "name": "VISUAL DESIGN FUNDAMENTALS FOR INTERACTIVE MEDIA", "credit": 3, "credit_format": "3(2-2-5)", "type": "Major" }, 
                { "code": "06016429", "name": "SERVER-SIDE WEB DEVELOPMENT", "credit": 3, "credit_format": "3(2-2-5)", "type": "Major" },
                { "code": "90644xxx", "name": "Elective - Language and Communication", "credit": 3, "credit_format": "3(x-x-x)", "type": "Gen_LNC_Elective", "is_user_entry_slot": true, "slot_id": "LNC_ELEC_1" }, 
            ],
            "Semester 2 (Non-Co-op)": [],
            "Semester 2 (Co-op)": [],
        },
        "Year 4": {
            "Semester 1 (Non-Co-op)": [],
            "Semester 2 (Non-Co-op)": [],
            "Semester 2 (Co-op)": [],
        }
    }
};


// ----------------------------------------------------
// ฟังก์ชัน Grade Point และ Cross-Reference Logic
// ----------------------------------------------------

/**
 * 🚀 ฟังก์ชันคำนวณแต้มเกรด (Grade Point)
 * @param {string} grade - เกรดตัวอักษร
 * @returns {number} แต้มเกรด
 */
function gradeToPoint(grade) {
    const map = { "A": 4.0, "B+": 3.5, "B": 3.0, "C+": 2.5, "C": 2.0, "D+": 1.5, "D": 1.0, "F": 0.0, "W": 0.0, "S": 0.0, "U": 0.0, "—": 0.0 };
    return map[grade] || 0.0;
}


// -----------------------------------------------------------------------------------------------------
// 🚀 ขั้นตอนที่ 2: การคัดลอกข้อมูลที่มีการอ้างอิงข้าม (Cross-Reference) หลังจากการ Initialization 
// -----------------------------------------------------------------------------------------------------

// 1. คัดลอกข้อมูล Year 3 Semester 2 (Non-Co-op)
MASTER_CURRICULUM["ITI"]["Year 3"]["Semester 2 (Non-Co-op)"] = MASTER_CURRICULUM["SD"]["Year 3"]["Semester 2 (Non-Co-op)"];
MASTER_CURRICULUM["MM"]["Year 3"]["Semester 2 (Non-Co-op)"] = MASTER_CURRICULUM["SD"]["Year 3"]["Semester 2 (Non-Co-op)"];

// 2. คัดลอกข้อมูล Year 3 Semester 2 (Co-op)
MASTER_CURRICULUM["ITI"]["Year 3"]["Semester 2 (Co-op)"] = MASTER_CURRICULUM["SD"]["Year 3"]["Semester 2 (Co-op)"];
MASTER_CURRICULUM["MM"]["Year 3"]["Semester 2 (Co-op)"] = MASTER_CURRICULUM["SD"]["Year 3"]["Semester 2 (Co-op)"];

// 3. คัดลอกข้อมูล Year 4 (ทุกแผน)
if (MASTER_CURRICULUM["SD"]["Year 4"]) {
    MASTER_CURRICULUM["ITI"]["Year 4"] = MASTER_CURRICULUM["SD"]["Year 4"];
    MASTER_CURRICULUM["MM"]["Year 4"] = MASTER_CURRICULUM["SD"]["Year 4"];
}