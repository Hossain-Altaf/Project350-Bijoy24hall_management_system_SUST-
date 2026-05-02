// ==============================
// CONFIG
// ==============================
const STORAGE_KEY = "user";

// ==============================
// INIT
// ==============================
document.addEventListener("DOMContentLoaded", () => {
    const user = getUser();

    if (!user) {
        redirectLogin();
        return;
    }

    if (user.role !== "student") {
        alert("Access denied");
        window.location.href = "dashboard.html";
        return;
    }

    loadSeatAllocation(user);
});

// ==============================
// GET USER SAFE
// ==============================
function getUser() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch {
        return null;
    }
}

// ==============================
// LOAD DATA
// ==============================
function loadSeatAllocation(user) {

    setText("studentNameDisplay", user.name);
    setText("studentRegDisplay", user.regNo);
    setText("studentDeptDisplay", user.department);

    const applications = JSON.parse(localStorage.getItem("applications") || "[]");

    const app = applications.find(a => a.regNumber === user.regNo);

    const status = document.getElementById("allocationStatus");
    const roomCard = document.getElementById("roomDetailsCard");
    const notCard = document.getElementById("notAllocatedCard");

    if (!app) {
        status.innerHTML = "No application found";
        return;
    }

    // Pending
    if (app.status === "Pending") {
        status.innerHTML = "Application Under Review ⏳";
        return;
    }

    // Rejected
    if (app.status === "Rejected") {
        status.innerHTML = "Application Rejected ❌";
        return;
    }

    // Approved but no room
    if (app.status === "Approved" && !app.roomNumber) {
        status.innerHTML = "Approved - Waiting for Seat Allocation ✔";
        return;
    }

    // Allocated
    if (app.status === "Approved" && app.roomNumber) {

        status.style.display = "none";
        roomCard.style.display = "block";

        setText("allocatedRoom", app.roomNumber);
        setText("allocatedFloor", app.floor);
        setText("allocatedBed", app.bedNumber);

        if (app.allocationDate) {
            setText(
                "allocationDate",
                new Date(app.allocationDate).toLocaleDateString()
            );
        }

        return;
    }

    notCard.style.display = "block";
}

// ==============================
// UTIL
// ==============================
function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value || "-";
}

// ==============================
// LOGOUT (GLOBAL FIX)
// ==============================
function logout(e) {
    if (e) e.preventDefault();

    const ok = confirm("Logout?");
    if (!ok) return;

    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("applications");

    window.location.href = "index.html";
}

// expose globally (IMPORTANT)
window.logout = logout;

// ==============================
// REDIRECT
// ==============================
function redirectLogin() {
    window.location.href = "student-login.html";
}