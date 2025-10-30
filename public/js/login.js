// public/js/login.js

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const userInput = document.getElementById('user');
  const passInput = document.getElementById('pass');
  const toggleButton = document.getElementById('togglePassword');

  // Clear any previous session on login page load
  localStorage.removeItem('cw_user');
  localStorage.removeItem('cw_role');
  localStorage.removeItem('cw_token'); // ล้าง token

  loginForm.addEventListener('submit', async (e) => { // เปลี่ยนเป็น async
    e.preventDefault();

    const username = userInput.value.trim();
    const password = passInput.value.trim();

    if (!username || !password) {
      alert('Please enter both User ID and Password.');
      return;
    }

    try {
      // --- Authentication Logic: Call API ---
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Invalid User ID or Password.');
      }

      const data = await response.json();

      // Store user ID, role, and most importantly, the TOKEN
      localStorage.setItem('cw_token', data.token);
      localStorage.setItem('cw_user', data.user.username);
      localStorage.setItem('cw_role', data.user.role);

      // Redirect based on role
      if (data.user.role === 'admin') {
        window.location.href = 'admin-curriculum.html';
      } else if (data.user.role === 'student') {
        window.location.href = 'dashboard.html';
      } else {
        alert('Login successful, but user role is undefined. Redirecting to login.');
        localStorage.clear();
        window.location.href = 'index.html';
      }

    } catch (err) {
      alert(err.message);
      passInput.value = ''; // Clear password field after failed attempt
      userInput.select(); // Focus back on user ID field
    }
  });

  // --- Toggle Password Visibility ---
  toggleButton.addEventListener('click', function () {
    const isPassword = passInput.type === 'password';
    passInput.type = isPassword ? 'text' : 'password';
    this.textContent = isPassword ? 'Hide' : 'Show';
  });

});