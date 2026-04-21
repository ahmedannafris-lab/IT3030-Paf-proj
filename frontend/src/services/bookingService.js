import api from './api';

const getAuthHeaders = () => {
  const currentUserRaw = localStorage.getItem('current_user');

  if (!currentUserRaw) {
    return {};
  }

  try {
    const currentUser = JSON.parse(currentUserRaw);
    return {
      'X-User-Id': currentUser.id,
      'X-User-Role': currentUser.role,
    };
  } catch (error) {
    return {};
  }
};

const authConfig = (extraConfig = {}) => ({
  ...extraConfig,
  headers: {
    ...(extraConfig.headers || {}),
    ...getAuthHeaders(),
  },
});

export const bookingAPI = {
  createBooking: (data) => api.post('/bookings', data, authConfig()),
  getMyBookings: () => api.get('/bookings/my', authConfig()),
  getBookingById: (id) => api.get(`/bookings/${id}`, authConfig()),
  cancelBooking: (id) => api.patch(`/bookings/${id}/cancel`, {}, authConfig()),
  deleteBooking: (id) => api.delete(`/bookings/${id}`, authConfig()),
  getAllBookings: () => api.get('/bookings', authConfig()),
  approveBooking: (id, adminNote) => api.patch(`/bookings/${id}/approve`, { adminNote }, authConfig()),
  rejectBooking: (id, adminNote) => api.patch(`/bookings/${id}/reject`, { adminNote }, authConfig()),
  adminCancelBooking: (id) => api.patch(`/bookings/${id}/admin-cancel`, {}, authConfig()),
  getResourceBookings: (resourceId, date) => api.get(`/bookings/resource/${resourceId}`, {
    params: { date },
    ...authConfig(),
  }),
};
