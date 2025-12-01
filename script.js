// API Base URL
const API_BASE = 'http://localhost/Projekt/api';

// DOM Elements
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const studentBtn = document.querySelector('.btn-student');
const employeeBtn = document.querySelector('.btn-employee');

// Clear placeholder password on focus
passwordInput.addEventListener('focus', function() {
    if (this.value === '') {
        this.value = '';
    }
});

// Restore placeholder if empty
passwordInput.addEventListener('blur', function() {
    if (this.value === '') {
        this.value = '';
    }
});

// Login as Student
studentBtn.addEventListener('click', function(e) {
    e.preventDefault();
    handleLogin('student');
});

// Login as Employee
employeeBtn.addEventListener('click', function(e) {
    e.preventDefault();
    handleLogin('employee');
});

// Handle Enter key press
usernameInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        handleLogin('student');
    }
});

passwordInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        handleLogin('student');
    }
});

// Login Handler Function
async function handleLogin(userType) {
    const email = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    // Validation
    if (!email) {
        alert('Please enter your email.');
        usernameInput.focus();
        return;
    }

    if (!password) {
        alert('Please enter your password.');
        passwordInput.focus();
        return;
    }

    try {
        // Show loading state
        const button = userType === 'student' ? studentBtn : employeeBtn;
        const originalText = button.textContent;
        button.textContent = 'Logging in...';
        button.disabled = true;

        // Call authentication API
        const response = await fetch(`${API_BASE}/auth.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        // Reset button
        button.textContent = originalText;
        button.disabled = false;

        if (data.success) {
            const user = data.user;

            // Check user role matches login type
            if (userType === 'student' && user.role !== 'student') {
                alert('Invalid credentials for student login.');
                return;
            }

            if (userType === 'employee' && (user.role !== 'admin' && user.role !== 'employee')) {
                alert('Invalid credentials for employee login.');
                return;
            }

            // Store user data in localStorage
            localStorage.setItem('currentStudent', JSON.stringify({
                id: user.id,
                studentId: user.studentId,
                name: user.name,
                email: user.email,
                role: user.role
            }));

            // Redirect based on user type
            if (user.role === 'student') {
                window.location.href = 'student.html';
            } else if (user.role === 'admin' || user.role === 'employee') {
                window.location.href = 'employee.html';
            }
        } else {
            alert(data.message || 'Invalid email or password');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Error connecting to server. Please try again.');

        // Reset button state
        const button = userType === 'student' ? studentBtn : employeeBtn;
        button.textContent = userType === 'student' ? 'Student' : 'Employee';
        button.disabled = false;
    }
}

// Initialize - Clear password field on page load
window.addEventListener('load', function() {
    passwordInput.value = '';
    // Clear any stored user data on login page
    localStorage.removeItem('currentStudent');
});
