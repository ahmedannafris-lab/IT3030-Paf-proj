// src/pages/Dashboard.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';

const Dashboard = () => {
  const { user, refreshUser } = useAuth();
  
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMsg('');
    setErrorMsg('');
    
    try {
      const payload = {
        name,
        email,
        password: password ? password : null
      };
      
      const res = await userAPI.updateMyProfile(user.id, payload);
      setMsg('Profile updated successfully!');
      
      if (refreshUser) {
        refreshUser(res.data);
      }
      
      setEditing(false);
      setPassword('');
      
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to update profile!');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      padding: '2rem',
      paddingTop: '100px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      }}>
        <h1 style={{ color: '#333' }}>Welcome to your Dashboard!</h1>
        <p style={{ color: '#666' }}>You are successfully logged in.</p>
        <hr style={{ margin: '20px 0' }} />
        
        {msg && <div style={{background:'#dcfce7', color:'#166534', padding:'10px', borderRadius:'8px', marginBottom:'15px'}}>{msg}</div>}
        {errorMsg && <div style={{background:'#fee2e2', color:'#dc2626', padding:'10px', borderRadius:'8px', marginBottom:'15px'}}>{errorMsg}</div>}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>User Info:</h3>
          {!editing && (
            <button 
              onClick={() => setEditing(true)}
              style={{ padding: '8px 16px', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            >
              Edit Profile
            </button>
          )}
        </div>

        {!editing ? (
          <div style={{ marginTop: '15px' }}>
            <p><strong>ID:</strong> #{user?.id}</p>
            <p><strong>Name:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Role:</strong> <span style={{ padding: '4px 10px', background: '#e0e7ff', color: '#166534', borderRadius: '15px', fontSize: '0.85em', fontWeight: 'bold' }}>{user?.role}</span></p>
          </div>
        ) : (
          <form style={{ marginTop: '20px', border: '1px solid #eee', padding: '20px', borderRadius: '12px', background: '#fafafa' }} onSubmit={handleUpdate}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                required
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                required
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>New Password (Optional)</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Save Changes</button>
              <button type="button" onClick={() => { setEditing(false); setName(user?.name); setEmail(user?.email); setPassword(''); }} style={{ padding: '10px 20px', background: '#9ca3af', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Dashboard;