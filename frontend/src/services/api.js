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
  getCurrentUser: (id) => api.get(`/users/${id}`),
  updateMyProfile: (id, data) => api.put(`/users/${id}`, data),
};

export const adminUserAPI = {
  getAllUsers: () => api.get('/admin/users'),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  changeUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  toggleUserStatus: (id, enabled) => api.patch(`/admin/users/${id}/status?enabled=${enabled}`),
};

export const resourceAPI = {
  getAllResources: (params) => api.get('/resources', { params }),
  getResourceById: (id) => api.get(`/resources/${id}`),
};

export const adminResourceAPI = {
  createResource: (data) => api.post('/admin/resources', data),
  updateResource: (id, data) => api.put(`/admin/resources/${id}`, data),
  changeResourceStatus: (id, status) => api.patch(`/admin/resources/${id}/status`, { status }),
  deleteResource: (id) => api.delete(`/admin/resources/${id}`),
  uploadImage: (id, formData) => api.post(`/admin/resources/${id}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

export default api;