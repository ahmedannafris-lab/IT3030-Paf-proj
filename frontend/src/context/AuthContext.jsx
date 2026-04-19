// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// User storage key
const USERS_KEY = 'campus_users';
const CURRENT_USER_KEY = 'current_user';

// Initialize demo users if not exists
const initializeDemoUsers = () => {
  const users = localStorage.getItem(USERS_KEY);
  if (!users) {
    const demoUsers = [
      {
        id: 1,
        name: 'Admin User',
        email: 'admin@campus.com',
        password: 'admin123',
        role: 'ADMIN',
        picture: 'https://ui-avatars.com/api/?name=Admin&background=ff9800&color=fff',
        createdAt: new Date().toISOString(),
        isActive: true
      },
      {
        id: 2,
        name: 'John User',
        email: 'user@campus.com',
        password: 'user123',
        role: 'USER',
        picture: 'https://ui-avatars.com/api/?name=John&background=4caf50&color=fff',
        createdAt: new Date().toISOString(),
        isActive: true
      },
      {
        id: 3,
        name: 'Tech Support',
        email: 'tech@campus.com',
        password: 'tech123',
        role: 'TECHNICIAN',
        picture: 'https://ui-avatars.com/api/?name=Tech&background=2196f3&color=fff',
        createdAt: new Date().toISOString(),
        isActive: true
      }
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(demoUsers));
  }
};

// Get all registered users
const getUsers = () => {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
};

// Save users to localStorage
const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initialize demo users
    initializeDemoUsers();
    
    // Check if user is logged in on app start
    const currentUser = localStorage.getItem(CURRENT_USER_KEY);
    
    if (currentUser) {
      const userData = JSON.parse(currentUser);
      setUser(userData);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setError(null);
    const users = getUsers();
    const foundUser = users.find(u => u.email === email && u.password === password);
    
    if (!foundUser) {
      setError('Invalid email or password!');
      return { success: false, message: 'Invalid email or password!' };
    }
    
    if (!foundUser.isActive) {
      setError('Account is deactivated. Contact admin.');
      return { success: false, message: 'Account is deactivated.' };
    }
    
    // Store current user (without password)
    const currentUser = {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      role: foundUser.role,
      picture: foundUser.picture
    };
    
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    localStorage.setItem('userRole', foundUser.role);
    localStorage.setItem('isAuthenticated', 'true');
    
    setUser(currentUser);
    setIsAuthenticated(true);
    
    return { success: true, user: currentUser };
  };

  const register = async (userData) => {
    setError(null);
    const users = getUsers();
    
    // Check if email already exists
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      setError('Email already registered!');
      return { success: false, message: 'Email already registered!' };
    }
    
    // Create new user
    const newUser = {
      id: Date.now(),
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role || 'USER',
      picture: `https://ui-avatars.com/api/?name=${userData.name}&background=667eea&color=fff`,
      createdAt: new Date().toISOString(),
      isActive: true
    };
    
    users.push(newUser);
    saveUsers(users);
    
    return { success: true, message: 'Registration successful! Please login.' };
  };

  const logout = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem('userRole');
    localStorage.removeItem('isAuthenticated');
    setUser(null);
    setIsAuthenticated(false);
    return { success: true };
  };

  const updateUserRole = (email, newRole) => {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex === -1) {
      return { success: false, message: 'User not found' };
    }
    
    users[userIndex].role = newRole;
    saveUsers(users);
    
    return { success: true, message: 'Role updated successfully' };
  };

  const getAllUsers = () => {
    return getUsers();
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      loading,
      error,
      login,
      register,
      logout,
      updateUserRole,
      getAllUsers
    }}>
      {children}
    </AuthContext.Provider>
  );
};