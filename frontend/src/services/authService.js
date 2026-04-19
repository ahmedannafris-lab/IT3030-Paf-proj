// src/services/authService.js

// User storage key
const USERS_KEY = 'campus_users';
const CURRENT_USER_KEY = 'current_user';

// Get all registered users
const getUsers = () => {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
};

// Save users to localStorage
const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// Register new user
export const register = (userData) => {
  const users = getUsers();
  
  // Check if email already exists
  const existingUser = users.find(u => u.email === userData.email);
  if (existingUser) {
    return { success: false, message: 'Email already registered!' };
  }
  
  // Create new user
  const newUser = {
    id: Date.now(),
    name: userData.name,
    email: userData.email,
    password: userData.password, // In real app, hash this!
    role: userData.role || 'USER',
    picture: `https://ui-avatars.com/api/?name=${userData.name}&background=667eea&color=fff`,
    createdAt: new Date().toISOString(),
    isActive: true
  };
  
  users.push(newUser);
  saveUsers(users);
  
  return { success: true, message: 'Registration successful! Please login.' };
};

// Login user
export const login = (email, password) => {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return { success: false, message: 'Invalid email or password!' };
  }
  
  if (!user.isActive) {
    return { success: false, message: 'Account is deactivated. Contact admin.' };
  }
  
  // Store current user
  const currentUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    picture: user.picture
  };
  
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
  localStorage.setItem('userRole', user.role);
  localStorage.setItem('isAuthenticated', 'true');
  
  return { success: true, user: currentUser, message: 'Login successful!' };
};

// Logout user
export const logout = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
  localStorage.removeItem('userRole');
  localStorage.removeItem('isAuthenticated');
  return { success: true };
};

// Get current logged in user
export const getCurrentUser = () => {
  const user = localStorage.getItem(CURRENT_USER_KEY);
  return user ? JSON.parse(user) : null;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return localStorage.getItem('isAuthenticated') === 'true';
};

// Update user role (Admin only)
export const updateUserRole = (email, newRole) => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.email === email);
  
  if (userIndex === -1) {
    return { success: false, message: 'User not found' };
  }
  
  users[userIndex].role = newRole;
  saveUsers(users);
  
  return { success: true, message: 'Role updated successfully' };
};

// Get all users (Admin only)
export const getAllUsers = () => {
  return getUsers();
};

// Delete user (Admin only)
export const deleteUser = (email) => {
  let users = getUsers();
  users = users.filter(u => u.email !== email);
  saveUsers(users);
  return { success: true };
};