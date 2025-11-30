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
function handleLogin(userType) {
    const studentId = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    // Validation
    if (!studentId) {
        alert('Bitte geben Sie Ihre Student ID ein.');
        usernameInput.focus();
        return;
    }

    if (!password) {
        alert('Bitte geben Sie Ihr Passwort ein.');
        passwordInput.focus();
        return;
    }

    // Simulate login process
    console.log(`Login-Versuch - Typ: ${userType}, Student ID: ${studentId}`);

    // Redirect based on user type
    if (userType === 'student') {
        // Redirect to student portal
        window.location.href = 'student.html';
    } else if (userType === 'employee') {
        // Redirect to employee portal
        window.location.href = 'employee.html';
    }

    // TODO: Backend-Integration für Authentifizierung mit Admin-verwalteten Credentials
}

// Initialize - Clear password field on page load
window.addEventListener('load', function() {
    passwordInput.value = '';
});
