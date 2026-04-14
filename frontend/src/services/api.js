import axios from 'axios';

const DEFAULT_API_URL = import.meta.env.PROD
  ? 'https://fin-track-zfbr.onrender.com/api'
  : 'http://localhost:5000/api';

const API_URL = import.meta.env.VITE_API_URL || DEFAULT_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fintrack_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('fintrack_token');
      localStorage.removeItem('fintrack_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ──────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// ─── Classes ───────────────────────────────────────────────────────────
export const classAPI = {
  getAll: () => api.get('/classes'),
  create: (data) => api.post('/classes', data),
  update: (id, data) => api.put(`/classes/${id}`, data),
  remove: (id) => api.delete(`/classes/${id}`),
};

// ─── Transactions ──────────────────────────────────────────────────────
export const transactionAPI = {
  getAll: (params) => api.get('/transactions', { params }),
  getMonthlySummary: (year) => api.get('/transactions/monthly-summary', { params: { year } }),
  create: (data) => api.post('/transactions', data),
  remove: (id) => api.delete(`/transactions/${id}`),
};

export default api;
