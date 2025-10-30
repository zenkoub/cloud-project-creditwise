// public/js/user.js

/**
 * ฟังก์ชันหลักที่ใช้ดึงข้อมูล User ปัจจุบันจาก Backend API
 * นี่คือตัวที่มาแทนที่การอ่าน USER_DATA โดยสิ้นเชิง
 * @returns {Promise<object|null>} ข้อมูลผู้ใช้, หรือ null หากเกิดข้อผิดพลาด
 */
async function getCurrentUserData() {
  const token = localStorage.getItem('cw_token');
  if (!token) {
    console.warn('No token found. Redirecting to login.');
    localStorage.clear();
    window.location.href = 'index.html';
    return null;
  }

  try {
    const response = await fetch('/api/users/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}` // ส่ง Token ไปใน Header
      }
    });

    if (response.status === 401 || response.status === 403) {
      // Token หมดอายุ หรือไม่ถูกต้อง
      throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch user data from server.');
    }

    const userData = await response.json();
    return userData; // ข้อมูลที่ได้จาก API มีโครงสร้างคล้ายของเก่า { info, grades, academic_history, ... }

  } catch (err) {
    console.error('Error fetching user data:', err);
    alert('An error occurred: ' + err.message);
    localStorage.clear();
    window.location.href = 'index.html';
    return null;
  }
}

/**
 * ฟังก์ชันเกรด -> แต้ม ยังคงใช้ได้
 */
function gradeToPoint(grade) {
    const map = { "A": 4.0, "B+": 3.5, "B": 3.0, "C+": 2.5, "C": 2.0, "D+": 1.5, "D": 1.0, "F": 0.0, "W": 0.0, "S": 0.0, "U": 0.0, "—": 0.0 };
    return map[grade] || 0.0;
}

// Global functions (เพื่อให้ไฟล์อื่นเรียกใช้ได้)
window.getCurrentUserData = getCurrentUserData;
window.gradeToPoint = gradeToPoint;

// *** หมายเหตุ: ไฟล์นี้เดิมมี USER_DATA ซึ่งถูกลบทิ้งไปแล้ว ***