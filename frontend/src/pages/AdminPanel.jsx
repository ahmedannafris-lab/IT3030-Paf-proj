// src/pages/AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { userAPI } from '../services/api';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getAllUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error:', error);
      // Mock data for testing
      setUsers([
        { email: 'admin@test.com', name: 'Admin User', role: 'ADMIN', isActive: true, createdAt: new Date().toISOString() },
        { email: 'user@test.com', name: 'Normal User', role: 'USER', isActive: true, createdAt: new Date().toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (email, newRole) => {
    try {
      await userAPI.updateRole(email, newRole);
      alert(`✅ Role updated to ${newRole}`);
      fetchUsers();
    } catch (error) {
      alert('⚠️ Backend not connected. Mock mode only.');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px', color: 'white' }}>Loading...</div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' }}>
      <h1 style={{ color: 'white', marginBottom: '20px' }}>👑 Admin Panel - User Management</h1>
      <div style={{ background: 'white', borderRadius: '15px', padding: '1.5rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Role</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.email} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}><strong>{user.name}</strong></td>
                <td style={{ padding: '12px' }}>{user.email}</td>
                <td style={{ padding: '12px' }}>
                  <select value={user.role} onChange={(e) => handleRoleChange(user.email, e.target.value)} style={{ padding: '5px', borderRadius: '5px' }}>
                    <option value="USER">USER</option>
                    <option value="TECHNICIAN">TECHNICIAN</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{ padding: '4px 12px', borderRadius: '20px', background: user.isActive ? '#e8f5e9' : '#ffebee', color: user.isActive ? '#4caf50' : '#f44336' }}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  <button style={{ padding: '5px 10px', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default AdminPanel;