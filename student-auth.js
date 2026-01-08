// Toggle between Login and Register forms
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

// Handle Student Login
function handleStudentLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('studentLoginEmail').value;
    const password = document.getElementById('studentLoginPassword').value;
    
    // Get registered students
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    
    // Find student
    const student = students.find(s => 
        (s.email === email || s.regNo === email) && s.password === password
    );
    
    if (student) {
        // Save logged in student
        const currentUser = {
            ...student,
            role: 'student',
            loginTime: new Date().toISOString()
        };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Show success message
        alert('Login successful! Welcome ' + student.name);
        
        // Redirect to student dashboard
        window.location.href = 'dashboard.html';
    } else {
        alert('Invalid email/registration number or password!');
    }
}

// Handle Student Registration
function handleStudentRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('studentRegName').value;
    const regNo = document.getElementById('studentRegNo').value;
    const email = document.getElementById('studentRegEmail').value;
    const department = document.getElementById('studentRegDepartment').value;
    const session = document.getElementById('studentRegSession').value;
    const phone = document.getElementById('studentRegPhone').value;
    const password = document.getElementById('studentRegPassword').value;
    const confirmPassword = document.getElementById('studentRegConfirmPassword').value;
    
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
    
    // Validate phone number
    const phoneRegex = /^01[0-9]{9}$/;
    if (!phoneRegex.test(phone)) {
        alert('Please enter a valid Bangladeshi phone number (01XXXXXXXXX)');
        return;
    }
    
    // Get existing students
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    
    // Check if student already exists
    if (students.find(s => s.email === email || s.regNo === regNo)) {
        alert('Student with this email or registration number already exists!');
        return;
    }
    
    // Create new student object
    const newStudent = {
        id: 'STU' + Date.now(),
        name,
        regNo,
        email,
        department,
        session,
        phone,
        password,
        registeredAt: new Date().toISOString(),
        isAdmitted: false,
        role: 'student'
    };
    
    // Add to students array
    students.push(newStudent);
    localStorage.setItem('students', JSON.stringify(students));
    
    // Show success message
    alert('Registration successful! Please login to continue.');
    
    // Switch to login form
    showStudentLogin();
    
    // Clear form
    document.getElementById('studentRegisterForm').querySelector('form').reset();
}

// Check if student is already logged in
window.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.role === 'student') {
        // Student is already logged in, redirect to dashboard
        if (confirm('You are already logged in. Go to dashboard?')) {
            window.location.href = 'dashboard.html';
        }
    }
});