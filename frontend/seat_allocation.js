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

    loadSeatAllocation(user);
});

// Load seat allocation details
function loadSeatAllocation(user) {
    // Display student info
    document.getElementById('studentNameDisplay').textContent = user.name;
    document.getElementById('studentRegDisplay').textContent = user.regNo;
    document.getElementById('studentDeptDisplay').textContent = user.department;

    // Get user's application
    const applications = JSON.parse(localStorage.getItem('applications') || '[]');
    const userApplication = applications.find(app => app.regNumber === user.regNo);

    const statusCard = document.getElementById('allocationStatus');
    const roomDetailsCard = document.getElementById('roomDetailsCard');
    const notAllocatedCard = document.getElementById('notAllocatedCard');

    if (!userApplication) {
        // No application found
        statusCard.innerHTML = `
            <div class="status-icon">❌</div>
            <h2>No Application Found</h2>
            <p>You haven't applied for hall admission yet. Please submit your application first.</p>
            <a href="admission.html" class="btn btn-primary" style="margin-top: 1rem;">Apply for Admission</a>
        `;
        return;
    }

    if (userApplication.status === 'Pending') {
        // Application pending
        statusCard.innerHTML = `
            <div class="status-icon">⏳</div>
            <h2>Application Under Review</h2>
            <p>Your admission application is currently being reviewed by the hall authorities. 
            Seat allocation will be done after approval.</p>
            <p class="text-muted">Application ID: ${userApplication.applicationId}</p>
        `;
        return;
    }

    if (userApplication.status === 'Rejected') {
        // Application rejected
        statusCard.innerHTML = `
            <div class="status-icon">❌</div>
            <h2>Application Not Approved</h2>
            <p>Unfortunately, your admission application was not approved. 
            Please contact the hall office for more information.</p>
            <p class="text-muted">Application ID: ${userApplication.applicationId}</p>
        `;
        return;
    }

    if (userApplication.status === 'Approved' && !userApplication.roomNumber) {
        // Approved but not allocated
        statusCard.innerHTML = `
            <div class="status-icon">✅</div>
            <h2>Application Approved!</h2>
            <p>Congratulations! Your application has been approved. 
            Seat allocation is in progress and will be completed soon.</p>
            <p class="text-muted">You will receive a notification once your seat is allocated.</p>
        `;
        return;
    }

    if (userApplication.status === 'Approved' && userApplication.roomNumber) {
        // Allocated - show details
        statusCard.style.display = 'none';
        roomDetailsCard.style.display = 'block';

        // Fill room details
        document.getElementById('allocatedRoom').textContent = userApplication.roomNumber;
        document.getElementById('allocatedFloor').textContent = userApplication.floor;
        document.getElementById('allocatedBed').textContent = 'Bed ' + userApplication.bedNumber;

        if (userApplication.allocationDate) {
            const allocDate = new Date(userApplication.allocationDate);
            document.getElementById('allocationDate').textContent = allocDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        // Load roommates (if any)
        loadRoommates(userApplication.roomNumber, user.regNo);
    } else {
        // Not allocated
        notAllocatedCard.style.display = 'block';
        statusCard.style.display = 'none';
    }
}

// Load roommates information
function loadRoommates(roomNumber, currentRegNo) {
    const applications = JSON.parse(localStorage.getItem('applications') || '[]');
    const roommates = applications.filter(app => 
        app.roomNumber === roomNumber && 
        app.regNumber !== currentRegNo &&
        app.status === 'Approved'
    );

    const roommatesList = document.getElementById('roommatesList');

    if (roommates.length === 0) {
        roommatesList.innerHTML = '<p class="text-muted">No other roommates assigned yet.</p>';
        return;
    }

    roommatesList.innerHTML = roommates.map(roommate => `
        <div class="roommate-card">
            <div class="roommate-avatar">${roommate.studentName.charAt(0)}</div>
            <div class="roommate-info">
                <h4>${roommate.studentName}</h4>
                <p>Reg: ${roommate.regNumber}</p>
                <p>${roommate.department} - ${roommate.session}</p>
                <p>Bed ${roommate.bedNumber}</p>
            </div>
        </div>
    `).join('');
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentUser');
        alert('Logged out successfully!');
        window.location.href = 'index.html';
    }
}