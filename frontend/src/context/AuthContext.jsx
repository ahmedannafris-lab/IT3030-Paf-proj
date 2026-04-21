// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { userAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const CURRENT_USER_KEY = 'current_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
    try {
      const response = await userAPI.login({ email, password });
      const foundUser = response.data;
      
      if (foundUser.enabled === false) {
        setError('Account is deactivated. Contact admin.');
        return { success: false, message: 'Account is deactivated.' };
      }
      
      // Store current user
      const currentUser = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
        picture: `https://ui-avatars.com/api/?name=${foundUser.name}&background=random&color=fff`
      };
      
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
      localStorage.setItem('userRole', foundUser.role);
      localStorage.setItem('isAuthenticated', 'true');
      
      setUser(currentUser);
      setIsAuthenticated(true);
      
      return { success: true, user: currentUser };
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data || 'Invalid email or password!';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      await userAPI.register({
        name: userData.fullname || userData.name || userData.username,
        email: userData.email,
        password: userData.password,
        role: userData.role || 'USER'
      });
      return { success: true, message: 'Registration successful! Please login.' };
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data || 'Registration failed!';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem('userRole');
    localStorage.removeItem('isAuthenticated');
    setUser(null);
    setIsAuthenticated(false);
    return { success: true };
  };

  const refreshUser = (updatedData) => {
    const existing = JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || '{}');
    const newUser = { ...existing, ...updatedData };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    setUser(newUser);
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
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};