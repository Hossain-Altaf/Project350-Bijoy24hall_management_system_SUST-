// Check if user is logged in
window.addEventListener('DOMContentLoaded', () => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        alert('Please login first to apply for admission!');
        window.location.href = 'login.html';
    } else {
        // Pre-fill form with user data
        const user = JSON.parse(currentUser);
        prefillUserData(user);
    }
});

// Pre-fill user data in the form
function prefillUserData(user) {
    if (user.regNo) document.getElementById('regNumber').value = user.regNo;
    if (user.email) document.getElementById('email').value = user.email;
    if (user.department) document.getElementById('department').value = user.department;
    if (user.session) document.getElementById('session').value = user.session;
    if (user.phone) document.getElementById('phone').value = user.phone;
    if (user.name) document.getElementById('studentName').value = user.name;
}

// Handle Admission Form Submission
function handleAdmission(event) {
    event.preventDefault();
    
    // Get current user
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('Session expired. Please login again.');
        window.location.href = 'login.html';
        return;
    }
    
    // Collect form data
    const formData = {
        // Personal Information
        studentName: document.getElementById('studentName').value,
        fatherName: document.getElementById('fatherName').value,
        motherName: document.getElementById('motherName').value,
        dob: document.getElementById('dob').value,
        nid: document.getElementById('nid').value,
        bloodGroup: document.getElementById('bloodGroup').value,
        
        // Academic Information
        regNumber: document.getElementById('regNumber').value,
        roll: document.getElementById('roll').value,
        department: document.getElementById('department').value,
        session: document.getElementById('session').value,
        semester: document.getElementById('semester').value,
        cgpa: document.getElementById('cgpa').value,
        
        // Contact Information
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        presentAddress: document.getElementById('presentAddress').value,
        permanentAddress: document.getElementById('permanentAddress').value,
        distanceFromHome: document.getElementById('distanceFromHome').value,
        
        // Guardian Information
        guardianName: document.getElementById('guardianName').value,
        guardianRelation: document.getElementById('guardianRelation').value,
        guardianPhone: document.getElementById('guardianPhone').value,
        guardianOccupation: document.getElementById('guardianOccupation').value,
        
        // Quota Selection
        quotas: Array.from(document.querySelectorAll('input[name="quota"]:checked'))
                     .map(cb => cb.value),
        
        // Bank Information
        bankName: document.getElementById('bankName').value,
        branchName: document.getElementById('branchName').value,
        accountNumber: document.getElementById('accountNumber').value,
        receiptNumber: document.getElementById('receiptNumber').value,
        paymentDate: document.getElementById('paymentDate').value,
        
        // Application metadata
        applicationDate: new Date().toISOString(),
        status: 'Pending',
        applicationId: 'APP' + Date.now()
    };
    
    // Validate quota selection
    if (formData.quotas.length === 0) {
        alert('Please select at least one quota option!');
        return;
    }
    
    // Get existing applications
    const applications = JSON.parse(localStorage.getItem('applications') || '[]');
    
    // Check if user already applied
    const existingApp = applications.find(app => app.regNumber === formData.regNumber);
    if (existingApp) {
        if (confirm('You have already submitted an application. Do you want to update it?')) {
            // Update existing application
            const index = applications.indexOf(existingApp);
            applications[index] = formData;
            localStorage.setItem('applications', JSON.stringify(applications));
            
            alert('Application updated successfully!\nApplication ID: ' + formData.applicationId);
        }
    } else {
        // Add new application
        applications.push(formData);
        localStorage.setItem('applications', JSON.stringify(applications));
        
        alert('Application submitted successfully!\nApplication ID: ' + formData.applicationId + '\n\nYou will be notified once your application is reviewed.');
    }
    
    // Redirect to dashboard
    window.location.href = 'dashboard.html';
}

// Auto-save form data (every 30 seconds)
let autoSaveInterval;

window.addEventListener('DOMContentLoaded', () => {
    // Load saved draft if exists
    loadDraft();
    
    // Set up auto-save
    autoSaveInterval = setInterval(() => {
        saveDraft();
    }, 30000); // 30 seconds
});

function saveDraft() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    const draftData = {
        studentName: document.getElementById('studentName').value,
        fatherName: document.getElementById('fatherName').value,
        motherName: document.getElementById('motherName').value,
        // Add other fields as needed
    };
    
    localStorage.setItem('admissionDraft_' + currentUser.regNo, JSON.stringify(draftData));
    console.log('Draft saved automatically');
}

function loadDraft() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    const draft = localStorage.getItem('admissionDraft_' + currentUser.regNo);
    if (draft) {
        const draftData = JSON.parse(draft);
        // Populate form fields with draft data
        if (draftData.studentName) document.getElementById('studentName').value = draftData.studentName;
        if (draftData.fatherName) document.getElementById('fatherName').value = draftData.fatherName;
        if (draftData.motherName) document.getElementById('motherName').value = draftData.motherName;
        // Add other fields as needed
        
        console.log('Draft loaded');
    }
}

// File upload preview
document.querySelectorAll('input[type="file"]').forEach(input => {
    input.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            console.log('File selected:', file.name, file.size, 'bytes');
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB!');
                this.value = '';
                return;
            }
        }
    });
});