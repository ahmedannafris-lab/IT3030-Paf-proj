import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleGoogleSuccess = (credentialResponse) => {
    const result = loginWithGoogle(credentialResponse);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  const handleGoogleError = () => {
    setError('Google sign-in was cancelled or failed. Please try again.');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem',
        paddingTop: '120px',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: 'white',
          borderRadius: '24px',
          padding: '3rem',
          maxWidth: '480px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 10px 20px -5px rgba(102,126,234,0.4)',
            }}
          >
            <span style={{ fontSize: '32px' }}>🏫</span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '0.5rem' }}>
            Smart Campus Hub
          </h1>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>
            Welcome Back!{' '}
            <span style={{ fontWeight: 'bold', color: '#667eea' }}>Log in to your Account</span>
          </p>
        </div>

        {/* Error */}
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
              fontSize: '0.875rem',
              textAlign: 'center',
            }}
          >
            {error}
          </motion.div>
        )}

        {/* Google Sign-In */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
            theme="outline"
            size="large"
            width="400"
            text="signin_with"
            shape="rectangular"
          />
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
          <span style={{ color: '#9ca3af', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>or continue with email</span>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333', fontSize: '0.9rem' }}>
              Enter Email <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@campus.com"
              required
              style={{ width: '100%', padding: '14px 16px', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '1rem', transition: 'all 0.3s', outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }}
              onFocus={(e) => { e.target.style.border = '2px solid #667eea'; e.target.style.background = 'white'; }}
              onBlur={(e) => { e.target.style.border = '2px solid #e5e7eb'; e.target.style.background = '#f9fafb'; }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333', fontSize: '0.9rem' }}>
              Enter Password <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ width: '100%', padding: '14px 45px 14px 16px', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '1rem', transition: 'all 0.3s', outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }}
                onFocus={(e) => { e.target.style.border = '2px solid #667eea'; e.target.style.background = 'white'; }}
                onBlur={(e) => { e.target.style.border = '2px solid #e5e7eb'; e.target.style.background = '#f9fafb'; }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#9ca3af' }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginBottom: '1.5rem', transition: 'all 0.3s' }}
          >
            {loading ? 'Logging in...' : 'Continue'}
          </motion.button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
            <Link to="/forgot-password" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '500' }}>
              Forgot Password?
            </Link>
            <Link to="/register" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '500' }}>
              Sign up for an Account →
            </Link>
          </div>
        </form>

        {/* Demo Accounts */}
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.5rem' }}>Demo Accounts</p>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { label: 'Admin', email: 'admin@campus.com', pass: 'admin123' },
              { label: 'User', email: 'user@campus.com', pass: 'user123' },
              { label: 'Technician', email: 'tech@campus.com', pass: 'tech123' },
            ].map(({ label, email: demoEmail, pass }) => (
              <button
                key={label}
                type="button"
                onClick={() => { setEmail(demoEmail); setPassword(pass); }}
                style={{ padding: '4px 12px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '20px', fontSize: '0.7rem', cursor: 'pointer', color: '#4b5563' }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;