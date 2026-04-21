import React, { useState, useEffect } from 'react';
import { resourceAPI, adminResourceAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminResources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'LECTURE_HALL',
    capacity: 0,
    location: '',
    description: '',
    contactPerson: '',
    notes: ''
  });
  const [error, setError] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await resourceAPI.getAllResources({});
      setResources(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'capacity' ? parseInt(value) || 0 : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await adminResourceAPI.createResource(formData);
      setShowModal(false);
      setFormData({ name: '', type: 'LECTURE_HALL', capacity: 0, location: '', description: '', contactPerson: '', notes: '' });
      fetchResources();
    } catch (err) {
      setError(err.response?.data || 'Failed to create resource.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await adminResourceAPI.deleteResource(id);
        fetchResources();
      } catch (err) {
        alert('Failed to delete');
      }
    }
  };

  if (user?.role !== 'ADMIN') {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Access Denied</div>;
  }

  // Premium UI Styling Dictionary
  const glassPanel = {
    background: 'rgba(255, 255, 255, 0.65)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.8)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.05)',
  };

  const inputStyle = {
    width: '100%',
    padding: '16px',
    borderRadius: '16px',
    border: 'none',
    background: 'rgba(255, 255, 255, 0.7)',
    color: '#312e81',
    fontWeight: '600',
    outline: 'none',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02), 0 2px 5px rgba(0,0,0,0.02)',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease',
  };

  const inputFocusStyle = "0 0 0 3px rgba(99, 102, 241, 0.3)";

  return (
    <div style={{ 
        minHeight: '100vh', 
        padding: '120px 20px 48px', 
        background: 'radial-gradient(circle at bottom right, #f3e8ff, transparent 40%), radial-gradient(circle at top left, #e0f2fe 0%, #e0c3fc 100%)',
        backgroundAttachment: 'fixed',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '900', margin: 0, color: '#1e1b4b', letterSpacing: '-1px' }}>Resource Management</h1>
            <p style={{ margin: '8px 0 0', color: '#4338ca', fontWeight: '600' }}>Administer campus facilities and equipment.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)} 
            style={{ padding: '14px 24px', background: 'linear-gradient(135deg, #a855f7, #6366f1)', color: 'white', border: 'none', borderRadius: '16px', cursor: 'pointer', fontWeight: '800', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)', transition: 'transform 0.2s' }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            ✨ Create New Resource
          </button>
        </div>

        <div style={{ ...glassPanel, borderRadius: '24px', overflowX: 'auto', padding: '10px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.7)', textAlign: 'left' }}>
                <th style={{ padding: '20px', color: '#312e81', fontWeight: '800', borderRadius: '16px 0 0 16px' }}>Name</th>
                <th style={{ padding: '20px', color: '#312e81', fontWeight: '800' }}>Type</th>
                <th style={{ padding: '20px', color: '#312e81', fontWeight: '800' }}>Location</th>
                <th style={{ padding: '20px', color: '#312e81', fontWeight: '800' }}>Capacity</th>
                <th style={{ padding: '20px', color: '#312e81', fontWeight: '800' }}>Status</th>
                <th style={{ padding: '20px', color: '#312e81', fontWeight: '800', borderRadius: '0 16px 16px 0' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((resource, index) => (
                <tr key={resource.id} style={{ borderBottom: index === resources.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.8)' }}>
                  <td style={{ padding: '20px', fontWeight: '800', color: '#1e1b4b' }}>{resource.name}</td>
                  <td style={{ padding: '20px', color: '#4338ca', fontWeight: '600' }}>🔖 {resource.type}</td>
                  <td style={{ padding: '20px', color: '#4338ca', fontWeight: '600' }}>📍 {resource.location}</td>
                  <td style={{ padding: '20px', color: '#4338ca', fontWeight: '600' }}>👥 {resource.capacity}</td>
                  <td style={{ padding: '20px' }}>
                    <span style={{ 
                        padding: '6px 14px', 
                        borderRadius: '999px', fontSize: '0.8rem', fontWeight: '800', letterSpacing: '0.5px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                        backgroundColor: resource.status === 'ACTIVE' ? 'rgba(167, 243, 208, 0.8)' : 'rgba(254, 202, 202, 0.8)',
                        color: resource.status === 'ACTIVE' ? '#065f46' : '#991b1b'
                    }}>{resource.status}</span>
                  </td>
                  <td style={{ padding: '20px' }}>
                    <button 
                      onClick={() => handleDelete(resource.id)}
                      style={{ padding: '8px 16px', background: 'rgba(220, 38, 38, 0.9)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => e.target.style.background = '#b91c1c'}
                      onMouseLeave={(e) => e.target.style.background = 'rgba(220, 38, 38, 0.9)'}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <div style={{ ...glassPanel, padding: '40px', borderRadius: '32px', width: '100%', maxWidth: '540px', margin: '20px', maxHeight: '90vh', overflowY: 'auto' }}>
              <h2 style={{ margin: '0 0 24px', fontWeight: '900', color: '#1e1b4b', fontSize: '2rem', letterSpacing: '-0.5px' }}>Create Resource</h2>
              
              {error && <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(254, 226, 226, 0.9)', color: '#991b1b', fontWeight: '800', border: '1px solid #fca5a5', marginBottom: '24px' }}>⚠️ {typeof error === 'string' ? error : JSON.stringify(error)}</div>}
              
              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '800', color: '#312e81' }}>Name</label>
                  <input required placeholder="E.g., Grand Auditorium" name="name" value={formData.name} onChange={handleChange} style={inputStyle} onFocus={(e) => e.target.style.boxShadow = inputFocusStyle} onBlur={(e) => e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02), 0 2px 5px rgba(0,0,0,0.02)'} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '800', color: '#312e81' }}>Type</label>
                  <select name="type" value={formData.type} onChange={handleChange} style={inputStyle} onFocus={(e) => e.target.style.boxShadow = inputFocusStyle} onBlur={(e) => e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02), 0 2px 5px rgba(0,0,0,0.02)'}>
                    <option value="LECTURE_HALL">📚 Lecture Hall</option>
                    <option value="LAB">🔬 Lab</option>
                    <option value="MEETING_ROOM">💼 Meeting Room</option>
                    <option value="EQUIPMENT">💻 Equipment</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '800', color: '#312e81' }}>Location</label>
                    <input required type="text" placeholder="E.g., Floor 3" name="location" value={formData.location} onChange={handleChange} style={inputStyle} onFocus={(e) => e.target.style.boxShadow = inputFocusStyle} onBlur={(e) => e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02), 0 2px 5px rgba(0,0,0,0.02)'} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '800', color: '#312e81' }}>Capacity</label>
                    <input required type="number" placeholder="50" name="capacity" value={formData.capacity} onChange={handleChange} style={inputStyle} onFocus={(e) => e.target.style.boxShadow = inputFocusStyle} onBlur={(e) => e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02), 0 2px 5px rgba(0,0,0,0.02)'} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '800', color: '#312e81' }}>Description</label>
                  <textarea placeholder="List features and amenities..." name="description" value={formData.description} onChange={handleChange} style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} onFocus={(e) => e.target.style.boxShadow = inputFocusStyle} onBlur={(e) => e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02), 0 2px 5px rgba(0,0,0,0.02)'} />
                </div>
                
                <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                  <button type="submit" style={{ flex: 2, padding: '16px', background: 'linear-gradient(135deg, #a855f7, #6366f1)', color: 'white', border: 'none', borderRadius: '16px', cursor: 'pointer', fontWeight: '900', fontSize: '1.1rem', boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)', transition: 'transform 0.2s' }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    🚀 Launch Resource
                  </button>
                  <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '16px', background: 'rgba(255,255,255,0.7)', color: '#4f46e5', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '16px', cursor: 'pointer', fontWeight: '800', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.9)'}
                    onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.7)'}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminResources;