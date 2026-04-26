// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Storage keys
const USERS_KEY = 'campus_users';
const CURRENT_USER_KEY = 'current_user';

const getRoleDefaultBackendId = (role) => {
  if (role === 'ADMIN') return 1;
  if (role === 'TECHNICIAN') return 3;
  return 2;
};

// Initialize demo users if not exists
const initializeDemoUsers = () => {
  const users = localStorage.getItem(USERS_KEY);
  if (!users) {
    const demoUsers = [
      {
        id: 1,
        backendUserId: 1,
        name: 'Admin User',
        email: 'admin@campus.com',
        password: 'admin123',
        role: 'ADMIN',
        picture: 'https://ui-avatars.com/api/?name=Admin&background=ff9800&color=fff',
        createdAt: new Date().toISOString(),
        isActive: true,
        provider: 'local',
      },
      {
        id: 2,
        backendUserId: 2,
        name: 'John User',
        email: 'user@campus.com',
        password: 'user123',
        role: 'USER',
        picture: 'https://ui-avatars.com/api/?name=John&background=4caf50&color=fff',
        createdAt: new Date().toISOString(),
        isActive: true,
        provider: 'local',
      },
      {
        id: 3,
        backendUserId: 3,
        name: 'Tech Support',
        email: 'tech@campus.com',
        password: 'tech123',
        role: 'TECHNICIAN',
        picture: 'https://ui-avatars.com/api/?name=Tech&background=2196f3&color=fff',
        createdAt: new Date().toISOString(),
        isActive: true,
        provider: 'local',
      },
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(demoUsers));
  }
};

const getUsers = () => {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
};

const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeDemoUsers();

    const currentUser = localStorage.getItem(CURRENT_USER_KEY);
    if (currentUser) {
      const parsedUser = JSON.parse(currentUser);
      const userData = {
        ...parsedUser,
        backendUserId:
          parsedUser.backendUserId ||
          (parsedUser.id > 0 && parsedUser.id <= 3
            ? parsedUser.id
            : getRoleDefaultBackendId(parsedUser.role)),
      };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  // ─── Email/password login ──────────────────────────────────────────────────
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

    if (!foundUser.backendUserId) {
      foundUser.backendUserId =
        foundUser.id > 0 && foundUser.id <= 3
          ? foundUser.id
          : getRoleDefaultBackendId(foundUser.role);
      saveUsers(users);
    }

    const currentUser = {
      id: foundUser.id,
      backendUserId: foundUser.backendUserId,
      name: foundUser.name,
      email: foundUser.email,
      role: foundUser.role,
      picture: foundUser.picture,
      provider: foundUser.provider || 'local',
    };

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    localStorage.setItem('userRole', foundUser.role);
    localStorage.setItem('isAuthenticated', 'true');
    setUser(currentUser);
    setIsAuthenticated(true);
    return { success: true, user: currentUser };
  };

  // ─── Google OAuth login ────────────────────────────────────────────────────
  const loginWithGoogle = (credentialResponse) => {
    setError(null);
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const { email, name, picture, sub: googleId } = decoded;

      const users = getUsers();
      let foundUser = users.find(u => u.email === email);

      if (!foundUser) {
        // Auto-register the Google user as a regular USER
        foundUser = {
          id: Date.now(),
          backendUserId: getRoleDefaultBackendId('USER'),
          googleId,
          name,
          email,
          password: null,
          role: 'USER',
          picture,
          createdAt: new Date().toISOString(),
          isActive: true,
          provider: 'google',
        };
        users.push(foundUser);
        saveUsers(users);
      }

      if (!foundUser.isActive) {
        setError('Account is deactivated. Contact admin.');
        return { success: false, message: 'Account is deactivated.' };
      }

      const currentUser = {
        id: foundUser.id,
        backendUserId: foundUser.backendUserId,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
        picture: foundUser.picture,
        provider: 'google',
      };

      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
      localStorage.setItem('userRole', foundUser.role);
      localStorage.setItem('isAuthenticated', 'true');
      setUser(currentUser);
      setIsAuthenticated(true);
      return { success: true, user: currentUser };
    } catch (err) {
      setError('Google sign-in failed. Please try again.');
      return { success: false, message: 'Google sign-in failed.' };
    }
  };

  // ─── Register ──────────────────────────────────────────────────────────────
  const register = async (userData) => {
    setError(null);
    const users = getUsers();
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      setError('Email already registered!');
      return { success: false, message: 'Email already registered!' };
    }

    const newUser = {
      id: Date.now(),
      backendUserId: getRoleDefaultBackendId(userData.role || 'USER'),
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role || 'USER',
      picture: `https://ui-avatars.com/api/?name=${userData.name}&background=667eea&color=fff`,
      createdAt: new Date().toISOString(),
      isActive: true,
      provider: 'local',
    };

    users.push(newUser);
    saveUsers(users);
    return { success: true, message: 'Registration successful! Please login.' };
  };

  // ─── Logout ────────────────────────────────────────────────────────────────
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
    if (userIndex === -1) return { success: false, message: 'User not found' };
    users[userIndex].role = newRole;
    saveUsers(users);
    return { success: true, message: 'Role updated successfully' };
  };

  const getAllUsers = () => getUsers();

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      loading,
      error,
      login,
      loginWithGoogle,
      register,
      logout,
      updateUserRole,
      getAllUsers,
    }}>
      {children}
    </AuthContext.Provider>
  );
};