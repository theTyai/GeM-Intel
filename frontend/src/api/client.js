import axios from 'axios';

let base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
if (base.includes('onrender.com') && !base.endsWith('/api/v1')) {
  base = base.replace(/\/$/, '') + '/api/v1';
}

const api = axios.create({
  baseURL: base,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gem_intel_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('gem_intel_token');
      localStorage.removeItem('gem_intel_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
