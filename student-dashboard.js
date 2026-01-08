// Check if user is logged in
window.addEventListener('DOMContentLoaded', () => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        alert('Please login to access dashboard!');
        window.location.href = 'student-login.html';
        return;
    }
    
    const user = JSON.parse(currentUser);
    
    // Check if user is a student
    if (user.role !== 'student') {
        alert('Access denied! This is a student dashboard.');
        window.location.href = 'staff-dashboard.html';
        return;
    }
    
    loadDashboardData(user);
    animateCounters();
});

// Load dashboard data
function loadDashboardData(user) {
    // Set user name and details
    document.getElementById('userName').textContent = user.name;
    document.getElementById('studentNameNav').textContent = user.name;
    document.getElementById('regNoDisplay').textContent = 'Reg: ' + user.regNo;
    document.getElementById('deptDisplay').textContent = 'Department: ' + user.department;
    document.getElementById('sessionDisplay').textContent = 'Session: ' + user.session;
    
    // Set user initial
    const initial = user.name.charAt(0).toUpperCase();
    document.getElementById('userInitial').textContent = initial;
    
    // Get user's application
    const applications = JSON.parse(localStorage.getItem('applications') || '[]');
    const userApplication = applications.find(app => app.regNumber === user.regNo);
    
    if (userApplication) {
        // Update application status
        updateApplicationStatus(userApplication);
        
        // Show application section
        document.getElementById('applicationSection').style.display = 'block';
        
        // Fill application details
        document.getElementById('appId').textContent = userApplication.applicationId;
        document.getElementById('appRegNo').textContent = userApplication.regNumber;
        document.getElementById('appDept').textContent = userApplication.department;
        document.getElementById('appSession').textContent = userApplication.session;
        document.getElementById('appCGPA').textContent = userApplication.cgpa;
        document.getElementById('appQuota').textContent = userApplication.quotas.join(', ');
        
        const appDate = new Date(userApplication.applicationDate);
        document.getElementById('appDate').textContent = appDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const statusBadge = document.getElementById('appStatusDetail');
        statusBadge.textContent = userApplication.status;
        statusBadge.className = 'status-badge status-' + userApplication.status.toLowerCase();
        
        // Update room allocation if approved and allocated
        if (userApplication.status === 'Approved' && userApplication.roomNumber) {
            document.getElementById('roomNumber').textContent = 'Room ' + userApplication.roomNumber;
            document.getElementById('hallCard').textContent = 'Issued ✓';
            document.getElementById('feeStatus').textContent = 'Paid ✓';
            
            // Show room details section
            document.getElementById('roomSection').style.display = 'block';
            document.getElementById('roomNo').textContent = userApplication.roomNumber;
            document.getElementById('floorInfo').textContent = userApplication.floor + ' Floor';
            document.getElementById('bedNo').textContent = 'Bed ' + userApplication.bedNumber;
            
            if (userApplication.allocationDate) {
                const allocDate = new Date(userApplication.allocationDate);
                document.getElementById('allocationDate').textContent = allocDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }
        } else if (userApplication.status === 'Approved') {
            document.getElementById('roomNumber').textContent = 'Pending Allocation';
            document.getElementById('feeStatus').textContent = 'Paid ✓';
        } else if (userApplication.status === 'Rejected') {
            document.getElementById('applicationStatus').textContent = 'Rejected ✗';
            document.getElementById('roomNumber').textContent = 'N/A';
            document.getElementById('feeStatus').textContent = 'Refund Process';
        }
    }
}

// Update application status display
function updateApplicationStatus(application) {
    const statusElement = document.getElementById('applicationStatus');
    const status = application.status;
    
    if (status === 'Pending') {
        statusElement.textContent = 'Under Review ⏳';
    } else if (status === 'Approved') {
        statusElement.textContent = 'Approved ✓';
    } else if (status === 'Rejected') {
        statusElement.textContent = 'Rejected ✗';
    }
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentUser');
        alert('Logged out successfully!');
        window.location.href = 'index.html';
    }
}

// Animate counters (for future use with dynamic data)
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        if (!target) return;
        
        const updateCount = () => {
            const current = parseInt(counter.textContent);
            const increment = target / 50;
            
            if (current < target) {
                counter.textContent = Math.ceil(current + increment);
                setTimeout(updateCount, 20);
            } else {
                counter.textContent = target;
            }
        };
        
        updateCount();
    });
}

// Check for notifications
function checkNotifications() {
    const applications = JSON.parse(localStorage.getItem('applications') || '[]');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) return;
    
    const userApplication = applications.find(app => app.regNumber === currentUser.regNo);
    
    // Check if status changed
    const lastSeenStatus = localStorage.getItem('lastSeenStatus_' + currentUser.regNo);
    
    if (userApplication && userApplication.status !== lastSeenStatus) {
        // Show notification
        showNotification('Application Update', 'Your application status has been updated to: ' + userApplication.status);
        localStorage.setItem('lastSeenStatus_' + currentUser.regNo, userApplication.status);
    }
}

// Show notification
function showNotification(title, message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification-toast';
    notification.innerHTML = `
        <div class="notification-header">
            <strong>${title}</strong>
            <span class="notification-close" onclick="this.parentElement.parentElement.remove()">×</span>
        </div>
        <p>${message}</p>
    `;
    
    document.body.appendChild(notification);
    
    // Show notification with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Hide after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// Check notifications when page loads and periodically
checkNotifications();
setInterval(checkNotifications, 60000); // Every minute

// Add smooth scroll for internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Profile badge click (for future profile page)
document.querySelector('.profile-badge').addEventListener('click', function() {
    alert('Profile page coming soon!');
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Refresh data button (for future use)
function refreshDashboard() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        loadDashboardData(currentUser);
        showNotification('Dashboard Refreshed', 'Your dashboard data has been updated.');
    }
}

// Service item click tracking
document.querySelectorAll('.service-item, .quick-action-item').forEach(item => {
    item.addEventListener('click', function(e) {
        const serviceName = this.querySelector('h4').textContent;
        console.log('Service accessed:', serviceName);
        // Track user activity (can be sent to backend in real implementation)
    });
});

// Add welcome animation
setTimeout(() => {
    const welcomeHeader = document.querySelector('.dashboard-header');
    if (welcomeHeader) {
        welcomeHeader.style.animation = 'fadeInUp 0.8s ease';
    }
}, 100);