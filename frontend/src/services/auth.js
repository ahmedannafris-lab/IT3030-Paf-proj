// src/services/auth.js
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};

export const setCurrentUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const removeCurrentUser = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('access_token');
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('access_token');
};

export const hasRole = (role) => {
  const user = getCurrentUser();
  return user && user.role === role;
};