// Toggle between Login and Register forms
function showLogin() {
    document.getElementById('loginForm').classList.add('active');
    document.getElementById('registerForm').classList.remove('active');
    document.querySelectorAll('.auth-tab')[0].classList.add('active');
    document.querySelectorAll('.auth-tab')[1].classList.remove('active');
}

function showRegister() {
    document.getElementById('registerForm').classList.add('active');
    document.getElementById('loginForm').classList.remove('active');
    document.querySelectorAll('.auth-tab')[1].classList.add('active');
    document.querySelectorAll('.auth-tab')[0].classList.remove('active');
}

// Handle Login
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Get registered users
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Find user
    const user = users.find(u => 
        (u.email === email || u.regNo === email) && u.password === password
    );
    
    if (user) {
        // Save logged in user
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Show success message
        alert('Login successful! Welcome ' + user.name);
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    } else {
        alert('Invalid email/registration number or password!');
    }
}

// Handle Registration
function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('regName').value;
    const regNo = document.getElementById('regNo').value;
    const email = document.getElementById('regEmail').value;
    const department = document.getElementById('regDepartment').value;
    const session = document.getElementById('regSession').value;
    const phone = document.getElementById('regPhone').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    
    // Validate password match
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    // Validate password strength
    if (password.length < 6) {
        alert('Password must be at least 6 characters long!');
        return;
    }
    
    // Get existing users
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if user already exists
    if (users.find(u => u.email === email || u.regNo === regNo)) {
        alert('User with this email or registration number already exists!');
        return;
    }
    
    // Create new user object
    const newUser = {
        name,
        regNo,
        email,
        department,
        session,
        phone,
        password,
        registeredAt: new Date().toISOString(),
        isAdmitted: false
    };
    
    // Add to users array
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Show success message
    alert('Registration successful! Please login to continue.');
    
    // Switch to login form
    showLogin();
    
    // Clear form
    document.getElementById('registerForm').querySelector('form').reset();
}

// Check if user is already logged in
window.addEventListener('DOMContentLoaded', () => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser && window.location.pathname.includes('login.html')) {
        // User is already logged in, redirect to dashboard
        if (confirm('You are already logged in. Go to dashboard?')) {
            window.location.href = 'dashboard.html';
        }
    }
});