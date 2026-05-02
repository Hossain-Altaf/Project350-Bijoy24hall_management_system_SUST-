// ==============================
// AUTH CHECK (FIXED)
// ==============================
window.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (!token || !user) {
        alert('Please login to access dashboard!');
        window.location.href = 'student-login.html';
        return;
    }

    if (user.role !== 'student') {
        alert('Access denied! This is a student dashboard.');
        window.location.href = 'login.html';
        return;
    }

    loadDashboardData(user);
    animateCounters();
    checkNotifications();
});


// ==============================
// LOAD DASHBOARD DATA (BACKEND)
// ==============================
async function loadDashboardData(user) {

    const setText = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value ?? '-';
    };

    setText('userName', user.name);
    setText('studentNameNav', user.name);
    setText('regNoDisplay', 'Reg: ' + (user.studentId || user.regNo || 'N/A'));
    setText('deptDisplay', 'Department: ' + (user.department || 'N/A'));
    setText('sessionDisplay', 'Session: ' + (user.session || 'N/A'));

    const initialEl = document.getElementById('userInitial');
    if (initialEl) initialEl.textContent = user.name?.charAt(0)?.toUpperCase() || '';

    const token = localStorage.getItem('token');

    try {
        // ==========================
        // ADMISSION DATA (BACKEND)
        // ==========================
        const res = await fetch('http://localhost:5500/api/admission/my', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await res.json();

        if (!data.success || !data.data) return;

        const app = data.data;

        const set = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val ?? '-';
        };

        // Application info
        set('appId', app._id);
        set('appRegNo', app.studentId);
        set('appDept', app.department);
        set('appSession', app.session);
        set('appCGPA', app.cgpa);
        set('appQuota', (app.quotas || []).join(', '));

        const appDateEl = document.getElementById('appDate');
        if (appDateEl) {
            appDateEl.textContent = new Date(app.admissionDate).toLocaleDateString();
        }

        const statusBadge = document.getElementById('appStatusDetail');
        if (statusBadge) {
            statusBadge.textContent = app.admissionStatus;
            statusBadge.className = 'status-badge status-' + app.admissionStatus.toLowerCase();
        }

        // ==========================
        // ROOM / SEAT INFO
        // ==========================
        if (app.admissionStatus === 'approved') {

            if (app.seatNumber || app.roomNumber) {

                set('roomNumber', 'Room ' + (app.roomNumber || app.seatNumber));
                set('feeStatus', 'Paid ✓');

                const roomSection = document.getElementById('roomSection');
                if (roomSection) roomSection.style.display = 'block';

                set('roomNo', app.roomNumber || app.seatNumber);
                set('floorInfo', (app.floor || '') + ' Floor');
                set('bedNo', 'Bed ' + (app.bedNumber || '-'));
            } else {
                set('roomNumber', 'Pending Allocation');
                set('feeStatus', 'Paid ✓');
            }

        } else if (app.admissionStatus === 'rejected') {
            set('applicationStatus', 'Rejected ✗');
            set('roomNumber', 'N/A');
            set('feeStatus', 'Refund Process');
        }

        updateApplicationStatus(app);

    } catch (err) {
        console.error('Dashboard load error:', err);
    }
}


// ==============================
// STATUS UPDATE
// ==============================
function updateApplicationStatus(app) {
    const el = document.getElementById('applicationStatus');
    if (!el) return;

    if (app.admissionStatus === 'pending') el.textContent = 'Under Review ⏳';
    else if (app.admissionStatus === 'approved') el.textContent = 'Approved ✓';
    else if (app.admissionStatus === 'rejected') el.textContent = 'Rejected ✗';
}


// ==============================
// LOGOUT
// ==============================
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }
}


// ==============================
// COUNTERS
// ==============================
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');

    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        if (!target) return;

        let current = 0;
        const step = target / 50;

        const update = () => {
            current += step;
            if (current < target) {
                counter.textContent = Math.ceil(current);
                setTimeout(update, 20);
            } else {
                counter.textContent = target;
            }
        };

        update();
    });
}


// ==============================
// NOTIFICATIONS
// ==============================
async function checkNotifications() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    const token = localStorage.getItem('token');

    try {
        const res = await fetch('http://localhost:5500/api/admission/my', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await res.json();
        if (!data.success || !data.data) return;

        const app = data.data;

        const key = 'lastSeen_' + (user.studentId || user.regNo);
        const last = localStorage.getItem(key);

        if (app.admissionStatus !== last) {
            showNotification(
                'Application Update',
                'Status changed to: ' + app.admissionStatus
            );

            localStorage.setItem(key, app.admissionStatus);
        }

    } catch (err) {
        console.error(err);
    }
}


// ==============================
// NOTIFICATION UI
// ==============================
function showNotification(title, message) {
    const n = document.createElement('div');
    n.className = 'notification-toast';
    n.innerHTML = `
        <div class="notification-header">
            <strong>${title}</strong>
            <span onclick="this.parentElement.parentElement.remove()">×</span>
        </div>
        <p>${message}</p>
    `;

    document.body.appendChild(n);

    setTimeout(() => n.classList.add('show'), 100);

    setTimeout(() => {
        n.classList.remove('show');
        setTimeout(() => n.remove(), 300);
    }, 4000);
}


// ==============================
// SAFE DOM EVENTS
// ==============================
document.addEventListener('DOMContentLoaded', () => {

    const profile = document.querySelector('.profile-badge');
    if (profile) {
        profile.addEventListener('click', () => {
            alert('Profile page coming soon!');
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const target = document.querySelector(a.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});


// ==============================
// INIT
// ==============================
setInterval(checkNotifications, 60000);

window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});