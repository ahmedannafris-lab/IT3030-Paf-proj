import React, { useState, useEffect } from 'react';
import { resourceAPI } from '../services/api';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const ResourcesPage = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ type: '', location: '', minCapacity: '' });
  
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

  return (
    <div style={{ minHeight: '100vh', padding: '2rem', background: '#f8fafc' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2.5rem', color: '#1a202c', fontWeight: 'bold' }}>Campus Resources</h1>
            {user?.role === 'ADMIN' && (
                <a href="/admin/resources" style={{ padding: '0.75rem 1.5rem', backgroundColor: '#4f46e5', color: '#fff', borderRadius: '12px', textDecoration: 'none', fontWeight: '600' }}>Manage Resources</a>
            )}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <select name="type" value={filters.type} onChange={handleFilterChange} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', flex: 1 }}>
            <option value="">All Types</option>
            <option value="LECTURE_HALL">Lecture Hall</option>
            <option value="LAB">Lab</option>
            <option value="MEETING_ROOM">Meeting Room</option>
            <option value="EQUIPMENT">Equipment</option>
          </select>
          
          <input type="text" name="location" placeholder="Location..." value={filters.location} onChange={handleFilterChange} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', flex: 1 }} />
          
          <input type="number" name="minCapacity" placeholder="Min Capacity..." value={filters.minCapacity} onChange={handleFilterChange} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', flex: 1 }} />
        </div>

        {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>Loading resources...</div>
        ) : resources.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#718096' }}>No resources found matching your criteria.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {resources.map((resource) => (
              <motion.div
                key={resource.id}
                whileHover={{ y: -5 }}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  border: '1px solid #edf2f7'
                }}
              >
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2d3748', margin: 0 }}>{resource.name}</h3>
                    <span style={{ 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '999px', 
                        fontSize: '0.75rem', 
                        fontWeight: 'bold',
                        backgroundColor: resource.status === 'ACTIVE' ? '#c6f6d5' : '#fed7d7',
                        color: resource.status === 'ACTIVE' ? '#22543d' : '#822727'
                    }}>
                      {resource.status}
                    </span>
                  </div>
                  
                  <div style={{ color: '#4a5568', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    <strong>Type:</strong> {resource.type}
                  </div>
                  <div style={{ color: '#4a5568', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    <strong>Location:</strong> {resource.location}
                  </div>
                  <div style={{ color: '#4a5568', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    <strong>Capacity:</strong> {resource.capacity} people
                  </div>
                  
                  {resource.description && (
                    <p style={{ marginTop: '1rem', color: '#718096', fontSize: '0.875rem', lineHeight: '1.5' }}>
                      {resource.description}
                    </p>
                  )}
                  
                  <button style={{ 
                      marginTop: '1.5rem', 
                      width: '100%', 
                      padding: '0.75rem', 
                      border: 'none', 
                      borderRadius: '8px', 
                      backgroundColor: '#ebdfff', 
                      color: '#553c9a', 
                      fontWeight: 'bold', 
                      cursor: 'pointer' 
                  }}>
                    Book Resource
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourcesPage;