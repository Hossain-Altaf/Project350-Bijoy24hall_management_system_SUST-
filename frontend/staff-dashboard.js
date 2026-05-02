let currentApplication = null;
let currentFilter = 'all';

// Check if staff is logged in
window.addEventListener('DOMContentLoaded', () => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        alert('Please login to access staff dashboard!');
        window.location.href = 'staff-login.html';
        return;
    }
    
    const user = JSON.parse(currentUser);
    if (user.role === 'student') {
        alert('Access denied! This area is for staff only.');
        window.location.href = 'dashboard.html';
        return;
    }
    
    loadStaffDashboard(user);
});

// Load staff dashboard data
function loadStaffDashboard(user) {
    // Set staff name and role
    document.getElementById('staffName').textContent = user.name;
    document.getElementById('staffRole').textContent = getRoleDisplayName(user.role);
    
    // Load statistics
    updateStatistics();
    
    // Load applications by default
    loadApplications();
}

// Get role display name
function getRoleDisplayName(role) {
    const roles = {
        'provost': 'Provost',
        'assistant_provost': 'Assistant Provost',
        'executive_officer': 'Executive Officer',
        'hall_supervisor': 'Hall Supervisor',
        'office_staff': 'Office Staff'
    };
    return roles[role] || role;
}

// Update statistics
function updateStatistics() {
    const applications = JSON.parse(localStorage.getItem('applications') || '[]');
    
    const pending = applications.filter(app => app.status === 'Pending').length;
    const approved = applications.filter(app => app.status === 'Approved').length;
    
    document.getElementById('pendingApplications').textContent = pending;
    document.getElementById('approvedApplications').textContent = approved;
    document.getElementById('occupiedRooms').textContent = Math.floor(approved / 4);
}

// Show sections
function showApplications() {
    hideAllSections();
    document.getElementById('applicationsSection').style.display = 'block';
    loadApplications();
}

function showSeatManagement() {
    hideAllSections();
    document.getElementById('seatAllocationSection').style.display = 'block';
    loadRoomAllocations();
}

function showComplaints() {
    hideAllSections();
    document.getElementById('complaintsSection').style.display = 'block';
    loadComplaints();
}

function showDiningManagement() {
    alert('Dining Management feature coming soon!');
}

function showStaffManagement() {
    alert('Staff Management feature coming soon!');
}

function showNotices() {
    alert('Notice Management feature coming soon!');
}

function hideAllSections() {
    document.getElementById('applicationsSection').style.display = 'none';
    document.getElementById('seatAllocationSection').style.display = 'none';
    document.getElementById('complaintsSection').style.display = 'none';
}

// Load applications
function loadApplications() {
    const applications = JSON.parse(localStorage.getItem('applications') || '[]');
    const tbody = document.getElementById('applicationsTableBody');
    
    // Filter applications
    let filteredApps = applications;
    if (currentFilter !== 'all') {
        filteredApps = applications.filter(app => 
            app.status.toLowerCase() === currentFilter
        );
    }
    
    if (filteredApps.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="no-data">No applications found</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredApps.map(app => `
        <tr>
            <td>${app.applicationId}</td>
            <td>${app.studentName}</td>
            <td>${app.regNumber}</td>
            <td>${app.department}</td>
            <td>${app.cgpa}</td>
            <td>${app.quotas.join(', ')}</td>
            <td><span class="status-badge status-${app.status.toLowerCase()}">${app.status}</span></td>
            <td>
                <button class="btn-small btn-info" onclick='viewApplication(${JSON.stringify(app).replace(/'/g, "&#39;")})'>View</button>
            </td>
        </tr>
    `).join('');
}

// Filter applications
function filterApplications(filter) {
    currentFilter = filter;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    loadApplications();
}

// View application details
function viewApplication(app) {
    currentApplication = app;
    
    const modal = document.getElementById('applicationModal');
    const details = document.getElementById('applicationDetails');
    
    details.innerHTML = `
        <div class="application-detail-grid">
            <div class="detail-section">
                <h3>Personal Information</h3>
                <p><strong>Name:</strong> ${app.studentName}</p>
                <p><strong>Father's Name:</strong> ${app.fatherName}</p>
                <p><strong>Mother's Name:</strong> ${app.motherName}</p>
                <p><strong>Date of Birth:</strong> ${app.dob}</p>
                <p><strong>Blood Group:</strong> ${app.bloodGroup}</p>
                <p><strong>NID:</strong> ${app.nid}</p>
            </div>
            
            <div class="detail-section">
                <h3>Academic Information</h3>
                <p><strong>Registration No:</strong> ${app.regNumber}</p>
                <p><strong>Roll:</strong> ${app.roll}</p>
                <p><strong>Department:</strong> ${app.department}</p>
                <p><strong>Session:</strong> ${app.session}</p>
                <p><strong>Semester:</strong> ${app.semester}</p>
                <p><strong>CGPA:</strong> ${app.cgpa}</p>
            </div>
            
            <div class="detail-section">
                <h3>Contact Information</h3>
                <p><strong>Phone:</strong> ${app.phone}</p>
                <p><strong>Email:</strong> ${app.email}</p>
                <p><strong>Present Address:</strong> ${app.presentAddress}</p>
                <p><strong>Permanent Address:</strong> ${app.permanentAddress}</p>
                <p><strong>Distance from Home:</strong> ${app.distanceFromHome} km</p>
            </div>
            
            <div class="detail-section">
                <h3>Guardian Information</h3>
                <p><strong>Name:</strong> ${app.guardianName}</p>
                <p><strong>Relation:</strong> ${app.guardianRelation}</p>
                <p><strong>Phone:</strong> ${app.guardianPhone}</p>
                <p><strong>Occupation:</strong> ${app.guardianOccupation}</p>
            </div>
            
            <div class="detail-section">
                <h3>Application Details</h3>
                <p><strong>Quotas:</strong> ${app.quotas.join(', ')}</p>
                <p><strong>Application Date:</strong> ${new Date(app.applicationDate).toLocaleDateString()}</p>
                <p><strong>Status:</strong> <span class="status-badge status-${app.status.toLowerCase()}">${app.status}</span></p>
            </div>
            
            <div class="detail-section">
                <h3>Bank Payment</h3>
                <p><strong>Bank:</strong> ${app.bankName}</p>
                <p><strong>Branch:</strong> ${app.branchName}</p>
                <p><strong>Account No:</strong> ${app.accountNumber}</p>
                <p><strong>Receipt No:</strong> ${app.receiptNumber}</p>
                <p><strong>Payment Date:</strong> ${app.paymentDate}</p>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Close modal
function closeModal() {
    document.getElementById('applicationModal').style.display = 'none';
    currentApplication = null;
}

// Approve application
function approveApplication() {
    if (!currentApplication) return;
    
    const applications = JSON.parse(localStorage.getItem('applications') || '[]');
    const index = applications.findIndex(app => app.applicationId === currentApplication.applicationId);
    
    if (index !== -1) {
        applications[index].status = 'Approved';
        applications[index].approvedDate = new Date().toISOString();
        
        localStorage.setItem('applications', JSON.stringify(applications));
        
        alert('Application approved successfully!');
        closeModal();
        loadApplications();
        updateStatistics();
    }
}

// Reject application
function rejectApplication() {
    if (!currentApplication) return;
    
    const reason = prompt('Please enter reason for rejection:');
    if (!reason) return;
    
    const applications = JSON.parse(localStorage.getItem('applications') || '[]');
    const index = applications.findIndex(app => app.applicationId === currentApplication.applicationId);
    
    if (index !== -1) {
        applications[index].status = 'Rejected';
        applications[index].rejectionReason = reason;
        applications[index].rejectedDate = new Date().toISOString();
        
        localStorage.setItem('applications', JSON.stringify(applications));
        
        alert('Application rejected!');
        closeModal();
        loadApplications();
        updateStatistics();
    }
}

// Allocate seat
function allocateSeat(event) {
    event.preventDefault();
    
    const regNo = document.getElementById('allocateStudentReg').value;
    const roomNo = document.getElementById('allocateRoomNo').value;
    const bedNo = document.getElementById('allocateBedNo').value;
    const floor = document.getElementById('allocateFloor').value;
    
    // Check if student has approved application
    const applications = JSON.parse(localStorage.getItem('applications') || '[]');
    const application = applications.find(app => app.regNumber === regNo && app.status === 'Approved');
    
    if (!application) {
        alert('Student not found or application not approved!');
        return;
    }
    
    // Update application with room details
    const index = applications.indexOf(application);
    applications[index].roomNumber = roomNo;
    applications[index].bedNumber = bedNo;
    applications[index].floor = floor;
    applications[index].allocationDate = new Date().toISOString();
    
    localStorage.setItem('applications', JSON.stringify(applications));
    
    alert(`Seat allocated successfully!\nRoom: ${roomNo}, Bed: ${bedNo}, Floor: ${floor}`);
    
    // Clear form
    event.target.reset();
    
    // Reload allocations
    loadRoomAllocations();
}

// Load room allocations
function loadRoomAllocations() {
    const applications = JSON.parse(localStorage.getItem('applications') || '[]');
    const allocatedStudents = applications.filter(app => app.roomNumber);
    
    // Group by room
    const rooms = {};
    allocatedStudents.forEach(student => {
        if (!rooms[student.roomNumber]) {
            rooms[student.roomNumber] = {
                roomNo: student.roomNumber,
                floor: student.floor,
                beds: {}
            };
        }
        rooms[student.roomNumber].beds[student.bedNumber] = student.studentName;
    });
    
    const tbody = document.getElementById('roomAllocationTableBody');
    
    if (Object.keys(rooms).length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="no-data">No allocations found</td></tr>';
        return;
    }
    
    tbody.innerHTML = Object.values(rooms).map(room => `
        <tr>
            <td>${room.roomNo}</td>
            <td>${room.floor}</td>
            <td>${room.beds['1'] || '-'}</td>
            <td>${room.beds['2'] || '-'}</td>
            <td>${room.beds['3'] || '-'}</td>
            <td>${room.beds['4'] || '-'}</td>
            <td>${Object.keys(room.beds).length}/4</td>
        </tr>
    `).join('');
}

// Load complaints (dummy data for now)
function loadComplaints() {
    const tbody = document.getElementById('complaintsTableBody');
    tbody.innerHTML = '<tr><td colspan="8" class="no-data">No complaints found</td></tr>';
}

// Logout
function staffLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentUser');
        alert('Logged out successfully!');
        window.location.href = 'index.html';
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('applicationModal');
    if (event.target == modal) {
        closeModal();
    }
}