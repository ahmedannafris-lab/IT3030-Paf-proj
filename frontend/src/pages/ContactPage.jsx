// src/pages/ContactPage.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: '', email: '', message: '' });
  };

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
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ fontSize: '50px' }}>📞</span>
            <h1 style={{ fontSize: '2rem', color: '#333', marginTop: '1rem' }}>Contact Us</h1>
            <p style={{ color: '#666' }}>We'd love to hear from you</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {/* Contact Info */}
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '24px' }}>📍</span>
                <h3 style={{ margin: '10px 0 5px', color: '#333' }}>Address</h3>
                <p style={{ color: '#666' }}>SLIIT, Malabe Campus, Sri Lanka</p>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '24px' }}>📧</span>
                <h3 style={{ margin: '10px 0 5px', color: '#333' }}>Email</h3>
                <p style={{ color: '#666' }}>support@smartcampushub.com</p>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '24px' }}>📱</span>
                <h3 style={{ margin: '10px 0 5px', color: '#333' }}>Phone</h3>
                <p style={{ color: '#666' }}>+94 11 123 4567</p>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              {submitted && (
                <div style={{
                  background: '#e8f5e9',
                  color: '#4caf50',
                  padding: '10px',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  textAlign: 'center',
                }}>
                  Thank you! We'll get back to you soon.
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '15px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '16px',
                  }}
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '15px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '16px',
                  }}
                />
                <textarea
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  required
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '15px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '16px',
                    resize: 'vertical',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactPage;