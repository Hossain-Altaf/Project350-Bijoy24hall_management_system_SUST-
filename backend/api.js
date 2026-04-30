// ============================================================
//  api.js  — Frontend API helper for Bijoy '24 Hall System
//  Include this in all HTML pages: <script src="api.js"></script>
// ============================================================

const API_BASE = 'http://localhost:5000/api'; // Change to your deployed URL in production

// ─── Token Helpers ────────────────────────────────────────────────────────────
const getToken = () => localStorage.getItem('token');
const getUser  = () => JSON.parse(localStorage.getItem('user') || 'null');

const setSession = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// ─── Base fetch wrapper ───────────────────────────────────────────────────────
async function apiRequest(endpoint, method = 'GET', body = null, auth = true) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) headers['Authorization'] = `Bearer ${getToken()}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${endpoint}`, options);
  const data = await res.json();

  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// ─── Auth API ─────────────────────────────────────────────────────────────────
const Auth = {
  async login(email, password) {
    const data = await apiRequest('/auth/login', 'POST', { email, password }, false);
    setSession(data.token, data.user);
    return data;
  },

  async register(name, email, password, role = 'student', extras = {}) {
    const data = await apiRequest('/auth/register', 'POST', { name, email, password, role, ...extras }, false);
    setSession(data.token, data.user);
    return data;
  },

  async logout() {
    try { await apiRequest('/auth/logout', 'POST'); } catch (_) {}
    clearSession();
    window.location.href = 'login.html';
  },

  async getMe() {
    return await apiRequest('/auth/me');
  },

  isLoggedIn() { return !!getToken(); },
  getUser,

  // Redirect to login if not authenticated
  requireAuth(allowedRoles = []) {
    if (!this.isLoggedIn()) {
      window.location.href = 'login.html';
      return false;
    }
    const user = getUser();
    if (allowedRoles.length && !allowedRoles.includes(user.role)) {
      alert('Access denied.');
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }
};

// ─── Admission API ────────────────────────────────────────────────────────────
const Admission = {
  apply: (data) => apiRequest('/admission/apply', 'POST', data),
  getMyApplication: () => apiRequest('/admission/my-application'),
  getAllApplications: (status = '') => apiRequest(`/admission/all${status ? '?status=' + status : ''}`),
  updateStatus: (id, status) => apiRequest(`/admission/${id}/status`, 'PUT', { status })
};

// ─── Seat API ─────────────────────────────────────────────────────────────────
const Seats = {
  getAll: () => apiRequest('/seats'),
  getAvailable: () => apiRequest('/seats/available'),
  allocate: (studentId, seatNumber) => apiRequest(`/seats/allocate/${studentId}`, 'PUT', { seatNumber }),
  deallocate: (studentId) => apiRequest(`/seats/deallocate/${studentId}`, 'PUT'),
  seedSeats: (config = {}) => apiRequest('/seats/seed', 'POST', config)
};

// ─── Complaints API ───────────────────────────────────────────────────────────
const Complaints = {
  submit: (data) => apiRequest('/complaints', 'POST', data),
  getMy: () => apiRequest('/complaints/my'),
  getAll: (filters = {}) => {
    const q = new URLSearchParams(filters).toString();
    return apiRequest(`/complaints${q ? '?' + q : ''}`);
  },
  updateStatus: (id, status, adminNote = '') => apiRequest(`/complaints/${id}/status`, 'PUT', { status, adminNote }),
  delete: (id) => apiRequest(`/complaints/${id}`, 'DELETE')
};

// ─── Dashboard API ────────────────────────────────────────────────────────────
const Dashboard = {
  admin: () => apiRequest('/dashboard/admin'),
  staff: () => apiRequest('/dashboard/staff'),
  student: () => apiRequest('/dashboard/student')
};

// ─── UI Helpers ───────────────────────────────────────────────────────────────
function showError(message, elementId = 'error-msg') {
  const el = document.getElementById(elementId);
  if (el) { el.textContent = message; el.style.display = 'block'; }
  else alert('Error: ' + message);
}

function showSuccess(message, elementId = 'success-msg') {
  const el = document.getElementById(elementId);
  if (el) { el.textContent = message; el.style.display = 'block'; }
  else alert(message);
}