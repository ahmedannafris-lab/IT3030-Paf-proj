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

  return (
    <div style={{ minHeight: '100vh', padding: '2rem', background: '#f8fafc' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Resource Management</h1>
          <button 
            onClick={() => setShowModal(true)} 
            style={{ padding: '0.75rem 1.5rem', background: '#4c51bf', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            + Create New Resource
          </button>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#edf2f7', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '1rem' }}>Name</th>
                <th style={{ padding: '1rem' }}>Type</th>
                <th style={{ padding: '1rem' }}>Location</th>
                <th style={{ padding: '1rem' }}>Capacity</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {resources.map(resource => (
                <tr key={resource.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '1rem', fontWeight: '500' }}>{resource.name}</td>
                  <td style={{ padding: '1rem', color: '#4a5568' }}>{resource.type}</td>
                  <td style={{ padding: '1rem', color: '#4a5568' }}>{resource.location}</td>
                  <td style={{ padding: '1rem', color: '#4a5568' }}>{resource.capacity}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '999px', fontSize: '0.75rem', fontWeight: 'bold',
                        backgroundColor: resource.status === 'ACTIVE' ? '#c6f6d5' : '#fed7d7',
                        color: resource.status === 'ACTIVE' ? '#22543d' : '#822727'
                    }}>{resource.status}</span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button 
                      onClick={() => handleDelete(resource.id)}
                      style={{ padding: '0.5rem 1rem', background: '#e53e3e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem' }}
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
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '500px' }}>
              <h2 style={{ marginBottom: '1.5rem', fontWeight: 'bold' }}>Create Resource</h2>
              
              {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{typeof error === 'string' ? error : JSON.stringify(error)}</div>}
              
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input required placeholder="Name" name="name" value={formData.name} onChange={handleChange} style={inputStyle} />
                <select name="type" value={formData.type} onChange={handleChange} style={inputStyle}>
                  <option value="LECTURE_HALL">Lecture Hall</option>
                  <option value="LAB">Lab</option>
                  <option value="MEETING_ROOM">Meeting Room</option>
                  <option value="EQUIPMENT">Equipment</option>
                </select>
                <input required type="text" placeholder="Location" name="location" value={formData.location} onChange={handleChange} style={inputStyle} />
                <input required type="number" placeholder="Capacity" name="capacity" value={formData.capacity} onChange={handleChange} style={inputStyle} />
                <textarea placeholder="Description" name="description" value={formData.description} onChange={handleChange} style={{ ...inputStyle, minHeight: '80px' }} />
                
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="submit" style={{ flex: 1, padding: '0.75rem', background: '#4c51bf', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Save</button>
                  <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '0.75rem', background: '#e2e8f0', color: '#4a5568', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const inputStyle = { padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem' };

export default AdminResources;