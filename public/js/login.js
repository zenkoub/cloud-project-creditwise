document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const userInput = document.getElementById('user');
  const passInput = document.getElementById('pass');
  const toggleButton = document.getElementById('togglePassword');

  // Clear any previous session on login page load
  localStorage.removeItem('cw_user');
  localStorage.removeItem('cw_role');

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent default form submission

    const userId = userInput.value.trim();
    const password = passInput.value.trim();

    // Basic validation (optional, HTML5 'required' handles most)
    if (!userId || !password) {
      alert('Please enter both User ID and Password.');
      return;
    }

    // --- Authentication Logic ---
    const userData = USER_DATA[userId]; // Access global USER_DATA from user.js

    if (userData?.info?.password === password) {
      // Successful Login
      const userRole = userData.info.role;

      // Store user ID and role in localStorage
      localStorage.setItem('cw_user', userData.info.id);
      localStorage.setItem('cw_role', userRole);

      // Redirect based on role
      if (userRole === 'admin') {
        window.location.href = 'admin-curriculum.html'; // Or admin-students.html
      } else if (userRole === 'student') {
        window.location.href = 'dashboard.html';
      } else {
        // Fallback for unexpected roles (shouldn't happen with good data)
        alert('Login successful, but user role is undefined. Redirecting to login.');
        localStorage.removeItem('cw_user'); // Clear invalid login
        localStorage.removeItem('cw_role');
        window.location.href = 'index.html';
      }

    } else {
      // Failed Login
      alert('Invalid User ID or Password.');
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