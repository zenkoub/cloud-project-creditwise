-- 2. DDL: สร้างตารางหลักสูตร (courses)
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    credit INT NOT NULL,
    credit_format VARCHAR(20),
    type VARCHAR(50),
    track_id VARCHAR(10),
    year INT,
    semester INT
);

-- 3. DDL: สร้างตารางผู้ใช้ (users)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    role VARCHAR(10) NOT NULL DEFAULT 'student',
    track_id VARCHAR(10),
    study_plan VARCHAR(20),
    current_year INT,
    current_semester VARCHAR(10)
);

-- 4. DDL: สร้างตารางเกรด (user_grades)
CREATE TABLE user_grades (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_code VARCHAR(20) NOT NULL REFERENCES courses(code) ON DELETE CASCADE,
    grade VARCHAR(5),
    credit INT,
    status VARCHAR(20),
    UNIQUE(user_id, course_code)
);

-- 5. DDL: สร้างตารางประวัติการศึกษา (academic_history)
CREATE TABLE academic_history (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    term VARCHAR(20) NOT NULL,
    term_gpa DECIMAL(3, 2),
    gpax DECIMAL(3, 2)
);

-- 6. DDL: สร้าง Index
CREATE INDEX idx_user_grades_user_id ON user_grades(user_id);
CREATE INDEX idx_academic_history_user_id ON academic_history(user_id);