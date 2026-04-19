// src/pages/AboutPage.jsx
import React from 'react';
import { motion } from 'framer-motion';

const AboutPage = () => {
  return (
    <div style={{
      minHeight: '100vh',
      padding: '4rem 2rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'white',
            borderRadius: '20px',
            padding: '3rem',
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: '60px' }}>🏫</span>
          <h1 style={{ fontSize: '2.5rem', color: '#333', marginBottom: '1rem', marginTop: '1rem' }}>
            About Smart Campus Hub
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#666', lineHeight: '1.8', marginBottom: '2rem' }}>
            Smart Campus Hub is a comprehensive platform designed to modernize university operations.
            We help educational institutions manage facility bookings, maintenance requests, and
            campus communications efficiently.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
            <div>
              <h3 style={{ color: '#667eea' }}>Our Mission</h3>
              <p style={{ color: '#666' }}>To simplify campus operations through innovative technology</p>
            </div>
            <div>
              <h3 style={{ color: '#667eea' }}>Our Vision</h3>
              <p style={{ color: '#666' }}>Smart, connected, and efficient campuses worldwide</p>
            </div>
            <div>
              <h3 style={{ color: '#667eea' }}>Founded</h3>
              <p style={{ color: '#666' }}>2024 · SLIIT, Sri Lanka</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutPage;