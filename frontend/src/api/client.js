import axios from 'axios';

let base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
if (base.includes('onrender.com') && !base.endsWith('/api/v1')) {
  base = base.replace(/\/$/, '') + '/api/v1';
}

const api = axios.create({
  baseURL: base,
  headers: { 'Content-Type': 'application/json' },
});

export default api;
