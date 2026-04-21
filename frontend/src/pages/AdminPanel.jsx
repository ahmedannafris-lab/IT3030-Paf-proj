// src/pages/AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminUserAPI } from '../services/api';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await adminUserAPI.getAllUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setErrorMsg('Failed to load users from the server.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      await adminUserAPI.changeUserRole(id, newRole);
      fetchUsers();
    } catch (error) {
      alert('Error updating role: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await adminUserAPI.toggleUserStatus(id, !currentStatus);
      fetchUsers();
    } catch (error) {
      alert('Error toggling status: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminUserAPI.deleteUser(id);
        fetchUsers();
      } catch (error) {
        alert('Error deleting user: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px', color: 'white' }}>Loading...</div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' }}>
      <h1 style={{ color: 'white', marginBottom: '20px' }}>👑 Admin Panel - User Management</h1>
      
      {errorMsg && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '12px', marginBottom: '1.5rem', textAlign: 'center' }}>
          {errorMsg}
        </div>
      )}

      <div style={{ background: 'white', borderRadius: '15px', padding: '1.5rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Role</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>#{user.id}</td>
                <td style={{ padding: '12px' }}><strong>{user.name}</strong></td>
                <td style={{ padding: '12px' }}>{user.email}</td>
                <td style={{ padding: '12px' }}>
                  <select 
                    value={user.role} 
                    onChange={(e) => handleRoleChange(user.id, e.target.value)} 
                    style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}
                  >
                    <option value="USER">USER</option>
                    <option value="TECHNICIAN">TECHNICIAN</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td style={{ padding: '12px' }}>
                  <button 
                    onClick={() => handleToggleStatus(user.id, user.enabled)}
                    style={{ 
                      padding: '6px 12px', 
                      borderRadius: '20px', 
                      background: user.enabled ? '#e8f5e9' : '#ffebee', 
                      color: user.enabled ? '#4caf50' : '#f44336',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      minWidth: '90px'
                    }}
                  >
                    {user.enabled ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td style={{ padding: '12px', display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => handleDeleteUser(user.id)}
                    style={{ padding: '8px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            
            {users.length === 0 && (
              <tr>
                <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#666' }}>No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default AdminPanel;