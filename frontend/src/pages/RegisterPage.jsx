// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    fullname: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'USER'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.username || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    
    const result = await register({
      name: formData.fullname || formData.username,
      email: formData.email,
      password: formData.password,
      role: formData.role
    });
    
    if (result.success) {
      setSuccess(result.message);
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: 'white',
          borderRadius: '24px',
          padding: '2.5rem',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 10px 20px -5px rgba(102,126,234,0.4)',
          }}>
            <span style={{ fontSize: '32px' }}>📝</span>
          </div>
          <h1 style={{
            fontSize: '1.8rem',
            fontWeight: 'bold',
            color: '#1a1a2e',
            marginBottom: '0.5rem',
          }}>
            Create an account
          </h1>
          <p style={{ color: '#666', fontSize: '0.875rem' }}>
            Register to access facilities and report issues.
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: '#e8f5e9',
              color: '#4caf50',
              padding: '12px',
              borderRadius: '12px',
              marginBottom: '1.5rem',
              textAlign: 'center',
              fontSize: '0.875rem',
            }}
          >
            ✓ {success}
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: '#fee2e2',
              color: '#dc2626',
              padding: '12px',
              borderRadius: '12px',
              marginBottom: '1.5rem',
              textAlign: 'center',
              fontSize: '0.875rem',
            }}
          >
            ⚠ {error}
          </motion.div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit}>
          {/* Username Field */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#333',
              fontSize: '0.9rem',
            }}>
              Username <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="e.g., student1"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '0.95rem',
                transition: 'all 0.3s',
                outline: 'none',
                background: '#f9fafb',
              }}
              onFocus={(e) => {
                e.target.style.border = '2px solid #667eea';
                e.target.style.background = 'white';
              }}
              onBlur={(e) => {
                e.target.style.border = '2px solid #e5e7eb';
                e.target.style.background = '#f9fafb';
              }}
            />
            <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.25rem' }}>
              This will be your login ID
            </p>
          </div>

          {/* Full Name Field */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#333',
              fontSize: '0.9rem',
            }}>
              Full name <span style={{ color: '#9ca3af', fontWeight: 'normal' }}>(Optional)</span>
            </label>
            <input
              type="text"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              placeholder="Optional display name"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '0.95rem',
                transition: 'all 0.3s',
                outline: 'none',
                background: '#f9fafb',
              }}
              onFocus={(e) => {
                e.target.style.border = '2px solid #667eea';
                e.target.style.background = 'white';
              }}
              onBlur={(e) => {
                e.target.style.border = '2px solid #e5e7eb';
                e.target.style.background = '#f9fafb';
              }}
            />
          </div>

          {/* Email Field */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#333',
              fontSize: '0.9rem',
            }}>
              Email <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@campus.edu"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '0.95rem',
                transition: 'all 0.3s',
                outline: 'none',
                background: '#f9fafb',
              }}
              onFocus={(e) => {
                e.target.style.border = '2px solid #667eea';
                e.target.style.background = 'white';
              }}
              onBlur={(e) => {
                e.target.style.border = '2px solid #e5e7eb';
                e.target.style.background = '#f9fafb';
              }}
            />
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#333',
              fontSize: '0.9rem',
            }}>
              Password <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Choose a secure password"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  transition: 'all 0.3s',
                  outline: 'none',
                  background: '#f9fafb',
                  paddingRight: '45px',
                }}
                onFocus={(e) => {
                  e.target.style.border = '2px solid #667eea';
                  e.target.style.background = 'white';
                }}
                onBlur={(e) => {
                  e.target.style.border = '2px solid #e5e7eb';
                  e.target.style.background = '#f9fafb';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px',
                  color: '#9ca3af',
                }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.25rem' }}>
              Minimum 6 characters
            </p>
          </div>

          {/* Confirm Password Field */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#333',
              fontSize: '0.9rem',
            }}>
              Confirm Password <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  transition: 'all 0.3s',
                  outline: 'none',
                  background: '#f9fafb',
                  paddingRight: '45px',
                }}
                onFocus={(e) => {
                  e.target.style.border = '2px solid #667eea';
                  e.target.style.background = 'white';
                }}
                onBlur={(e) => {
                  e.target.style.border = '2px solid #e5e7eb';
                  e.target.style.background = '#f9fafb';
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px',
                  color: '#9ca3af',
                }}
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* Role Selection (Hidden but included) */}
          <input type="hidden" name="role" value={formData.role} />

          {/* Register Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginBottom: '1.5rem',
              transition: 'all 0.3s',
            }}
          >
            {loading ? 'Creating account...' : 'Register'}
          </motion.button>

          {/* Login Link */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#666', fontSize: '0.875rem' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '600' }}>
                Login
              </Link>
            </p>
          </div>
        </form>

        {/* Demo Info */}
        <div style={{
          marginTop: '1.5rem',
          paddingTop: '1rem',
          borderTop: '1px solid #e5e7eb',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
            By registering, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;