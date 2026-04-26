// src/pages/Dashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div style={{
      minHeight: '100vh',
      padding: '2rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      }}>
        <h1 style={{ color: '#333' }}>Welcome to Dashboard!</h1>
        <p style={{ color: '#666' }}>You are successfully logged in.</p>
        <hr style={{ margin: '20px 0' }} />
        <h3>User Info:</h3>
        <p><strong>Name:</strong> {user?.name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Role:</strong> {user?.role}</p>

        <div
          style={{
            marginTop: '28px',
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <Link
            to="/incidents"
            style={{
              textDecoration: 'none',
              padding: '10px 16px',
              borderRadius: '10px',
              color: 'white',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontWeight: '600',
            }}
          >
            Open Incident Ticketing
          </Link>

          <Link
            to="/notifications"
            style={{
              textDecoration: 'none',
              padding: '10px 16px',
              borderRadius: '10px',
              color: '#334155',
              background: '#e2e8f0',
              fontWeight: '600',
            }}
          >
            Open Notifications
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;