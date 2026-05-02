// Check if user is logged in
window.addEventListener('DOMContentLoaded', () => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        alert('Please login to access this page!');
        window.location.href = 'student-login.html';
        return;
    }

    const user = JSON.parse(currentUser);
    if (user.role !== 'student') {
        alert('Access denied! This page is for students only.');
        window.location.href = 'staff-dashboard.html';
        return;
    }

    loadComplaintForm(user);
    loadUserComplaints(user);
});

// Load complaint form with user data
function loadComplaintForm(user) {
    document.getElementById('studentName').value = user.name;
    document.getElementById('studentReg').value = user.regNo;
    document.getElementById('contactPhone').value = user.phone || '';

    // Get user's room number from application
    const applications = JSON.parse(localStorage.getItem('applications') || '[]');
    const userApplication = applications.find(app => app.regNumber === user.regNo);

    if (userApplication && userApplication.roomNumber) {
        document.getElementById('studentRoom').value = userApplication.roomNumber;
    }
}

// Load user's previous complaints
function loadUserComplaints(user) {
    const complaints = JSON.parse(localStorage.getItem('complaints') || '[]');
    const userComplaints = complaints.filter(c => c.regNo === user.regNo);

    const complaintsList = document.getElementById('complaintsList');

    if (userComplaints.length === 0) {
        complaintsList.innerHTML = `
            <div class="empty-state-small">
                <p>No complaints submitted yet</p>
            </div>
        `;
        return;
    }

    complaintsList.innerHTML = userComplaints.map(complaint => `
        <div class="complaint-item">
            <div class="complaint-header">
                <h4>${complaint.title}</h4>
                <span class="status-badge status-${complaint.status.toLowerCase()}">${complaint.status}</span>
            </div>
            <div class="complaint-meta">
                <span class="complaint-id">#${complaint.id}</span>
                <span class="complaint-category">${complaint.category}</span>
                <span class="complaint-priority priority-${complaint.priority.toLowerCase()}">${complaint.priority}</span>
            </div>
            <p class="complaint-desc">${complaint.description}</p>
            <div class="complaint-footer">
                <span class="complaint-date">📅 ${new Date(complaint.submittedDate).toLocaleDateString()}</span>
                <span class="complaint-room">🏠 Room ${complaint.roomNumber}</span>
            </div>
        </div>
    `).join('');
}

// Submit complaint
function submitComplaint(event) {
    event.preventDefault();

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('Session expired. Please login again.');
        window.location.href = 'student-login.html';
        return;
    }

    // Get form data
    const complaintData = {
        id: 'CMP' + Date.now(),
        name: document.getElementById('studentName').value,
        regNo: document.getElementById('studentReg').value,
        roomNumber: document.getElementById('studentRoom').value,
        category: document.getElementById('complaintCategory').value,
        priority: document.getElementById('priority').value,
        title: document.getElementById('complaintTitle').value,
        description: document.getElementById('complaintDetails').value,
        location: document.getElementById('location').value,
        contactPhone: document.getElementById('contactPhone').value,
        status: 'Pending',
        submittedDate: new Date().toISOString(),
        resolvedDate: null
    };

    // Validate priority-based fields
    if (complaintData.priority === 'Critical' || complaintData.priority === 'High') {
        if (!complaintData.location) {
            alert('Please provide the specific location for urgent complaints!');
            return;
        }
    }

    // Get existing complaints
    const complaints = JSON.parse(localStorage.getItem('complaints') || '[]');
    
    // Add new complaint
    complaints.push(complaintData);
    localStorage.setItem('complaints', JSON.stringify(complaints));

    // Show success message
    alert(`Complaint submitted successfully!\n\nComplaint ID: ${complaintData.id}\nPriority: ${complaintData.priority}\n\nYou will receive updates on your registered phone number.`);

    // Reset form
    document.getElementById('complaintForm').reset();
    
    // Reload form with user data
    loadComplaintForm(currentUser);
    
    // Reload complaints list
    loadUserComplaints(currentUser);

    // Send notification email (simulated)
    console.log('Complaint notification sent to hall office:', complaintData);
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentUser');
        alert('Logged out successfully!');
        window.location.href = 'index.html';
    }
}

// File upload preview
document.getElementById('complaintPhoto').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB!');
            this.value = '';
            return;
        }
        console.log('Photo attached:', file.name);
    }
});

// Auto-update location based on category
document.getElementById('complaintCategory').addEventListener('change', function() {
    const category = this.value;
    const locationField = document.getElementById('location');
    const roomNumber = document.getElementById('studentRoom').value;

    if (category && roomNumber) {
        // Suggest location based on category
        const suggestions = {
            'Electrical': `Room ${roomNumber}`,
            'Plumbing': `Room ${roomNumber} - Bathroom`,
            'Furniture': `Room ${roomNumber}`,
            'Cleanliness': `Room ${roomNumber} - Corridor`,
            'Internet': `Room ${roomNumber}`,
            'Security': 'Main Gate / Corridor',
            'Noise': `Room ${roomNumber} - Adjacent`,
            'Dining': 'Dining Hall / Cafeteria'
        };

        if (suggestions[category] && !locationField.value) {
            locationField.placeholder = suggestions[category];
        }
    }
});