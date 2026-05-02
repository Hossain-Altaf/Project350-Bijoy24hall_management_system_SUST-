const API_BASE = 'http://localhost:5500/api/auth';

// ==============================
// TOGGLE FORMS
// ==============================
function showStudentLogin() {
    document.getElementById('studentLoginForm').classList.add('active');
    document.getElementById('studentRegisterForm').classList.remove('active');

    document.querySelectorAll('.auth-tab')[0].classList.add('active');
    document.querySelectorAll('.auth-tab')[1].classList.remove('active');
}

function showStudentRegister() {
    document.getElementById('studentRegisterForm').classList.add('active');
    document.getElementById('studentLoginForm').classList.remove('active');

    document.querySelectorAll('.auth-tab')[1].classList.add('active');
    document.querySelectorAll('.auth-tab')[0].classList.remove('active');
}

// ==============================
// STUDENT LOGIN (BACKEND)
// ==============================
async function handleStudentLogin(event) {
    event.preventDefault();

    const email = document.getElementById('studentLoginEmail').value;
    const password = document.getElementById('studentLoginPassword').value;

    try {
        const res = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!data.success) {
            alert(data.message || 'Login failed');
            return;
        }

        // Save JWT + user
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        alert('Login successful! Welcome ' + data.user.name);

        window.location.href = 'dashboard.html';

    } catch (err) {
        alert('Server error');
    }
}

// ==============================
// STUDENT REGISTER (BACKEND)
// ==============================
async function handleStudentRegister(event) {
    event.preventDefault();

    const name = document.getElementById('studentRegName').value;
    const studentId = document.getElementById('studentRegNo').value;
    const email = document.getElementById('studentRegEmail').value;
    const department = document.getElementById('studentRegDepartment').value;
    const phone = document.getElementById('studentRegPhone').value;
    const password = document.getElementById('studentRegPassword').value;
    const confirmPassword = document.getElementById('studentRegConfirmPassword').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    if (password.length < 6) {
        alert('Password must be at least 6 characters long!');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                email,
                password,
                role: 'student',
                studentId,
                department,
                phone
            })
        });

        const data = await res.json();

        if (!data.success) {
            alert(data.message || 'Registration failed');
            return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        alert('Registration successful! Please login.');

        showStudentLogin();

        document.getElementById('studentRegisterForm').querySelector('form').reset();

    } catch (err) {
        alert('Server error');
    }
}

// ==============================
// AUTO LOGIN CHECK (JWT BASED)
// ==============================
window.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (user && user.role === 'student') {
        if (confirm('You are already logged in. Go to dashboard?')) {
            window.location.href = 'dashboard.html';
        }
    }
});