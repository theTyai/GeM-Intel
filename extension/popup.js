// GeM-Intel Extension — Popup Logic
// Handles login/logout and stores JWT in chrome.storage

const API_BASE = 'https://gem-intel.onrender.com/api/v1';
// const API_BASE = 'http://localhost:5000/api/v1'; // uncomment for local dev

document.addEventListener('DOMContentLoaded', async () => {
  const loginView = document.getElementById('loginView');
  const loggedInView = document.getElementById('loggedInView');
  const statusMsg = document.getElementById('statusMsg');

  // Check if already logged in
  const stored = await getStorage(['gem_intel_token', 'gem_intel_user']);

  if (stored.gem_intel_token && stored.gem_intel_user) {
    showLoggedIn(stored.gem_intel_user);
  } else {
    showLogin();
  }

  // ─── Login ───
  document.getElementById('loginBtn').addEventListener('click', async () => {
    const email = document.getElementById('emailInput').value.trim();
    const password = document.getElementById('passwordInput').value;

    if (!email || !password) {
      showStatus('Please enter email and password', 'error');
      return;
    }

    const btn = document.getElementById('loginBtn');
    btn.disabled = true;
    btn.textContent = '⏳ Signing in...';

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store token and user info
      await setStorage({
        gem_intel_token: data.token,
        gem_intel_user: data.user,
      });

      showStatus('Signed in successfully!', 'success');
      showLoggedIn(data.user);
    } catch (err) {
      showStatus(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = '🔐 Sign In';
    }
  });

  // ─── Dashboard ───
  document.getElementById('dashBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: API_BASE.replace('/api/v1', '') });
  });

  // ─── Logout ───
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await removeStorage(['gem_intel_token', 'gem_intel_user']);
    showStatus('Signed out', 'success');
    showLogin();
  });

  // ─── Helpers ───
  function showLogin() {
    loginView.style.display = '';
    loggedInView.style.display = 'none';
  }

  function showLoggedIn(user) {
    loginView.style.display = 'none';
    loggedInView.style.display = '';
    document.getElementById('userName').textContent = user.name || user.email;
    document.getElementById('userEmail').textContent = user.email;
    document.getElementById('userRole').textContent = user.role || 'officer';
  }

  function showStatus(msg, type) {
    statusMsg.textContent = msg;
    statusMsg.className = `status-msg status-${type}`;
    setTimeout(() => { statusMsg.style.display = 'none'; statusMsg.className = 'status-msg'; }, 4000);
  }
});

// ─── Chrome Storage Wrappers ───
function getStorage(keys) {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, resolve);
  });
}

function setStorage(items) {
  return new Promise((resolve) => {
    chrome.storage.local.set(items, resolve);
  });
}

function removeStorage(keys) {
  return new Promise((resolve) => {
    chrome.storage.local.remove(keys, resolve);
  });
}
