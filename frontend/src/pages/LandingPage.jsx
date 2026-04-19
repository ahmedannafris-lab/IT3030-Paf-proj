// src/pages/LandingPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    { icon: '🏢', title: 'Facility Management', desc: 'Book lecture halls, labs, and meeting rooms with ease' },
    { icon: '🛠️', title: 'Maintenance Tickets', desc: 'Report issues and track resolution status' },
    { icon: '🔔', title: 'Smart Notifications', desc: 'Real-time updates on bookings and tickets' },
    { icon: '👑', title: 'Role-Based Access', desc: 'USER, TECHNICIAN, MANAGER, ADMIN roles' },
    { icon: '📊', title: 'Analytics Dashboard', desc: 'Track usage patterns and optimize resources' },
    { icon: '🔒', title: 'Secure Authentication', desc: 'OAuth 2.0 Google login with role management' },
  ];

  return (
    <div>
      {/* Hero Section with Background Image */}
      <section style={{
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
        backgroundImage: 'url("https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}>
        {/* Purple Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(102,126,234,0.85), rgba(118,75,162,0.85))',
          zIndex: 1,
        }} />
        
        {/* Content */}
        <div style={{ maxWidth: '800px', position: 'relative', zIndex: 2, color: 'white' }}>
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 1 }}
            style={{ fontSize: '80px', marginBottom: '20px' }}
          >
            🏫
          </motion.div>
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ fontSize: '3.5rem', marginBottom: '20px', fontWeight: 'bold' }}
          >
            Smart Campus Operations Hub
          </motion.h1>
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{ fontSize: '1.2rem', marginBottom: '30px', opacity: 0.9, lineHeight: '1.6' }}
          >
            Streamline facility bookings, maintenance requests, and campus operations
            with our intelligent management system.
          </motion.p>
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
              style={{
                background: 'white',
                color: '#667eea',
                border: 'none',
                padding: '15px 35px',
                fontSize: '1.1rem',
                borderRadius: '50px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              }}
            >
              🚀 Get Started
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              style={{
                background: 'transparent',
                color: 'white',
                border: '2px solid white',
                padding: '15px 35px',
                fontSize: '1.1rem',
                borderRadius: '50px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Login
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '5rem 2rem', background: '#f8f9fa' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '15px', color: '#333' }}>Powerful Features</h2>
          <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '50px' }}>Everything you need to manage campus operations</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                style={{ background: 'white', borderRadius: '15px', padding: '2rem', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', cursor: 'pointer' }}
              >
                <div style={{ fontSize: '50px', marginBottom: '15px' }}>{feature.icon}</div>
                <h3 style={{ marginBottom: '10px', color: '#333' }}>{feature.title}</h3>
                <p style={{ color: '#666' }}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: '5rem 2rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', textAlign: 'center' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' }}>
          <div>
            <div style={{ fontSize: '48px', fontWeight: 'bold' }}>5000+</div>
            <p>Active Users</p>
          </div>
          <div>
            <div style={{ fontSize: '48px', fontWeight: 'bold' }}>1000+</div>
            <p>Daily Bookings</p>
          </div>
          <div>
            <div style={{ fontSize: '48px', fontWeight: 'bold' }}>98%</div>
            <p>Satisfaction Rate</p>
          </div>
          <div>
            <div style={{ fontSize: '48px', fontWeight: 'bold' }}>24/7</div>
            <p>Support Available</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '5rem 2rem', background: 'white', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '20px', color: '#333' }}>Ready to Transform Your Campus?</h2>
          <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '30px' }}>Join thousands of students and staff using Smart Campus Hub</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate('/register')}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '15px 40px',
              fontSize: '1.1rem',
              borderRadius: '50px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            }}
          >
            Get Started Now 🚀
          </motion.button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;