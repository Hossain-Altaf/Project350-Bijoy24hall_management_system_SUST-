const API_BASE = "http://localhost:5500/api/auth";

// ==============================
// LOGIN
// ==============================
async function handleLogin(event) {
    event.preventDefault();

    const role = document.getElementById("loginRole").value;
    const loginId = document.getElementById("loginId").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!loginId || !password) {
        alert("Please fill all fields");
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: loginId,   // ✅ FIX (IMPORTANT)
                password,
                role
            })
        });

        const data = await res.json();

        if (!data.success) {
            alert(data.message || "Login failed");
            return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // ROUTING FIX
        if (data.user.role === "admin") {
            window.location.href = "staff-dashboard.html";
        } else {
            window.location.href = "dashboard.html";
        }

    } catch (err) {
        console.error(err);
        alert("Server error");
    }
}

// ==============================
// REGISTER
// ==============================
async function handleRegister(event) {
    event.preventDefault();

    const role = document.getElementById("registerRole").value;

    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const phone = document.getElementById("regPhone").value.trim();
    const password = document.getElementById("regPassword").value;
    const confirmPassword = document.getElementById("regConfirmPassword").value;

    const studentIdInput = document.getElementById("regStudentId");
    const studentId = studentIdInput ? studentIdInput.value.trim() : "";

    if (!name || !email || !password || !phone) {
        alert("Fill required fields");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    const payload = {
        name,
        email,
        password,
        role,
        phone
    };

    // only student gets studentId
    if (role === "student") {
        payload.studentId = studentId;
    }

    try {
        const res = await fetch(`${API_BASE}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (!data.success) {
            alert(data.message || "Registration failed");
            return;
        }

        alert("Registration successful. Please login.");

        showLogin();
        document.querySelector("#registerForm form").reset();

    } catch (err) {
        console.error(err);
        alert("Server error");
    }
}

// ==============================
// UI TOGGLE
// ==============================
function showLogin() {
    document.getElementById("loginForm").classList.add("active");
    document.getElementById("registerForm").classList.remove("active");
}

function showRegister() {
    document.getElementById("registerForm").classList.add("active");
    document.getElementById("loginForm").classList.remove("active");
}

// ==============================
// GLOBAL EXPORT
// ==============================
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.showLogin = showLogin;
window.showRegister = showRegister;