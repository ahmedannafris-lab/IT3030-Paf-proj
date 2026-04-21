// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Notification APIs
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  getUnread: () => api.get('/notifications/unread'),
  getUnreadCount: () => api.get('/notifications/unread/count'),
  markAsRead: (ids) => api.put('/notifications/read', { notificationIds: ids }),
  markAllAsRead: () => api.put('/notifications/read/all'),
  markSingleAsRead: (id) => api.put(`/notifications/${id}/read`),
  deleteSingle: (id) => api.delete(`/notifications/${id}`),
  create: (data) => api.post('/notifications', data),
};

// User APIs
export const userAPI = {
  login: (credentials) => api.post('/users/login', credentials),
  register: (userData) => api.post('/users/register', userData),
  getCurrentUser: () => api.get('/users/me'),
  getAllUsers: () => api.get('/users'),
  updateRole: (email, role) => api.put('/users/role', { email, role }),
};

export default api;