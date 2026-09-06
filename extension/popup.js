// GeM-Intel Extension — Popup Logic

const API_BASE = 'https://gem-intel.onrender.com/api/v1';
// const API_BASE = 'http://localhost:5000/api/v1'; // uncomment for local dev

document.addEventListener('DOMContentLoaded', () => {
  // ─── Dashboard ───
  document.getElementById('dashBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: API_BASE.replace('/api/v1', '') });
  });
});
