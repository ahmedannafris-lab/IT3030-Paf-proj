// src/components/MockAuth.jsx
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const MockAuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('mockUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = () => {
    const mockUser = {
      email: 'test@example.com',
      name: 'Test User',
      picture: 'https://ui-avatars.com/api/?name=Test+User&background=667eea&color=fff',
      role: 'ADMIN'
    };
    setUser(mockUser);
    localStorage.setItem('mockUser', JSON.stringify(mockUser));
    localStorage.setItem('userRole', 'ADMIN');
    window.location.href = '/dashboard';
  };

  const logout = () => {
    setUser(null);
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};