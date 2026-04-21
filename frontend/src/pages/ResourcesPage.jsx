import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { resourceAPI } from '../services/api';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const ResourcesPage = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ type: '', location: '', minCapacity: '' });
  const navigate = useNavigate();
  
  const { user } = useAuth();
  
  const fetchResources = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.location) params.location = filters.location;
      if (filters.minCapacity) params.minCapacity = filters.minCapacity;
      
      const response = await resourceAPI.getAllResources(params);
      setResources(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', bounce: 0.4 } },
  };

  // Glass style dictionary
  const glassPanel = {
    background: 'rgba(255, 255, 255, 0.65)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.8)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.05)',
  };

  return (
    <div style={{ 
        minHeight: '100vh', 
        padding: '2rem', 
        paddingTop: '100px',
        background: 'radial-gradient(circle at top left, #f3e8ff, transparent 40%), radial-gradient(circle at bottom right, #e0c3fc 0%, #8ec5fc 100%)',
        backgroundAttachment: 'fixed'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{ fontSize: '3rem', color: '#1e1b4b', fontWeight: '900', margin: 0, letterSpacing: '-1px' }}>Campus Resources</h1>
                <p style={{ margin: '8px 0 0', color: '#4338ca', fontWeight: '500' }}>Browse and discover beautiful spaces for your next project.</p>
              </div>
              {user?.role === 'ADMIN' && (
                  <a href="/admin/resources" style={{ padding: '0.8rem 1.8rem', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', color: '#fff', borderRadius: '16px', textDecoration: 'none', fontWeight: '700', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)', transition: 'transform 0.2s', display: 'inline-block' }}>⚙️ Manage Resources</a>
              )}
          </div>

          {/* Filters Glass Container */}
          <div style={{ ...glassPanel, display: 'flex', gap: '1rem', marginBottom: '2.5rem', padding: '1.5rem', borderRadius: '24px', flexWrap: 'wrap' }}>
            <select name="type" value={filters.type} onChange={handleFilterChange} style={{ padding: '0.8rem 1rem', borderRadius: '14px', border: 'none', background: 'rgba(255,255,255,0.7)', flex: 1, fontWeight: '600', color: '#312e81', outline: 'none', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
              <option value="">✨ All Types</option>
              <option value="LECTURE_HALL">📚 Lecture Hall</option>
              <option value="LAB">🔬 Lab</option>
              <option value="MEETING_ROOM">💼 Meeting Room</option>
              <option value="EQUIPMENT">💻 Equipment</option>
            </select>
            
            <input type="text" name="location" placeholder="📍 Search Location..." value={filters.location} onChange={handleFilterChange} style={{ padding: '0.8rem 1rem', borderRadius: '14px', border: 'none', background: 'rgba(255,255,255,0.7)', flex: 1, fontWeight: '600', color: '#312e81', outline: 'none', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }} />
            
            <input type="number" name="minCapacity" placeholder="👥 Min Capacity..." value={filters.minCapacity} onChange={handleFilterChange} style={{ padding: '0.8rem 1rem', borderRadius: '14px', border: 'none', background: 'rgba(255,255,255,0.7)', flex: 1, fontWeight: '600', color: '#312e81', outline: 'none', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }} />
          </div>
        </motion.div>

        {error && <div style={{ color: '#991b1b', background: '#fee2e2', padding: '1rem', borderRadius: '12px', textAlign: 'center', marginBottom: '1rem', fontWeight: 'bold' }}>{error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '6rem', color: '#4f46e5', fontWeight: 'bold', fontSize: '1.2rem' }}>✨ Summoning resources...</div>
        ) : resources.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '6rem', color: '#6366f1', background: 'rgba(255,255,255,0.4)', borderRadius: '24px', fontWeight: '600' }}>
            No resources cast a matching reflection. Try adjusting your filters!
          </motion.div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
            {resources.map((resource) => (
              <motion.div
                key={resource.id}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 400 }}
                style={{
                  ...glassPanel,
                  borderRadius: '24px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ padding: '2rem', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1e1b4b', margin: 0, lineHeight: 1.2 }}>{resource.name}</h3>
                    <span style={{ 
                        padding: '0.4rem 1rem', 
                        borderRadius: '999px', 
                        fontSize: '0.75rem', 
                        fontWeight: '800',
                        letterSpacing: '0.5px',
                        backgroundColor: resource.status === 'ACTIVE' ? 'rgba(167, 243, 208, 0.8)' : 'rgba(254, 202, 202, 0.8)',
                        color: resource.status === 'ACTIVE' ? '#065f46' : '#991b1b',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                    }}>
                      {resource.status}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4338ca', fontSize: '0.95rem', fontWeight: '600' }}>
                      <span>🔖</span> {resource.type}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4338ca', fontSize: '0.95rem', fontWeight: '600' }}>
                      <span>📍</span> {resource.location}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4338ca', fontSize: '0.95rem', fontWeight: '600' }}>
                      <span>👥</span> Up to {resource.capacity} people
                    </div>
                  </div>
                  
                  {resource.description && (
                    <p style={{ marginTop: '0', color: '#4f46e5', fontSize: '0.9rem', lineHeight: '1.6', opacity: 0.8 }}>
                      {resource.description}
                    </p>
                  )}
                </div>
                
                <div style={{ padding: '1.5rem', paddingTop: 0 }}>
                  {(!user || user?.role === 'USER') ? (
                    <button onClick={() => navigate(`/bookings/new?resourceId=${resource.id}`)} style={{ 
                        width: '100%', 
                        padding: '1rem', 
                        border: 'none', 
                        borderRadius: '16px', 
                        background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)', 
                        color: 'white', 
                        fontWeight: '800',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      Reserve Now
                    </button>
                  ) : (
                    <div style={{ 
                        width: '100%', 
                        padding: '1rem', 
                        borderRadius: '16px', 
                        backgroundColor: 'rgba(255, 245, 245, 0.8)', 
                        border: '1px solid rgba(254, 215, 215, 0.5)',
                        color: '#e53e3e', 
                        fontSize: '0.85rem',
                        fontWeight: '700', 
                        textAlign: 'center',
                        boxSizing: 'border-box'
                    }}>
                      ⚠️ Standard Users Only
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ResourcesPage;