import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { bookingAPI } from '../services/bookingService';
import { resourceAPI } from '../services/api';

const BookingCreatePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    resourceId: '',
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: 0,
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const preselectedResourceId = params.get('resourceId');

    const loadResources = async () => {
      try {
        setLoading(true);
        const response = await resourceAPI.getAllResources({ status: 'ACTIVE' });
        const resourceList = response.data || [];
        setResources(resourceList);

        if (preselectedResourceId) {
          setForm((current) => ({ ...current, resourceId: preselectedResourceId }));
        } else if (resourceList.length > 0) {
          setForm((current) => ({ ...current, resourceId: resourceList[0].id }));
        }
      } catch (err) {
        setError('Failed to load resources.');
      } finally {
        setLoading(false);
      }
    };

    loadResources();
  }, [location.search]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: name === 'expectedAttendees' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      setSubmitting(true);
      const response = await bookingAPI.createBooking(form);
      setMessage('Booking request submitted successfully.');
      navigate(`/bookings/${response.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create booking.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '120px 20px 48px', background: 'linear-gradient(135deg, #eff6ff 0%, #e0f2fe 48%, #f5f3ff 100%)' }}>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: '860px', margin: '0 auto', background: 'rgba(255,255,255,0.96)', borderRadius: '28px', boxShadow: '0 24px 60px rgba(37, 99, 235, 0.12)', padding: '32px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2.2rem', color: '#0f172a' }}>Create Booking</h1>
            <p style={{ margin: '8px 0 0', color: '#475569' }}>Reserve a campus resource and send it for approval.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/bookings/my')}
            style={{ alignSelf: 'flex-start', padding: '12px 16px', borderRadius: '14px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: '700' }}
          >
            My Bookings
          </button>
        </div>

        {loading ? (
          <p>Loading resources...</p>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700' }}>Resource</label>
              <select name="resourceId" value={form.resourceId} onChange={handleChange} style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #cbd5e1' }} required>
                <option value="">Select resource</option>
                {resources.map((resource) => (
                  <option key={resource.id} value={resource.id}>
                    {resource.name} - {resource.location}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700' }}>Date</label>
                <input type="date" name="date" value={form.date} onChange={handleChange} style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #cbd5e1' }} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700' }}>Start Time</label>
                <input type="time" name="startTime" value={form.startTime} onChange={handleChange} style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #cbd5e1' }} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700' }}>End Time</label>
                <input type="time" name="endTime" value={form.endTime} onChange={handleChange} style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #cbd5e1' }} required />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700' }}>Purpose</label>
              <textarea name="purpose" value={form.purpose} onChange={handleChange} rows="4" maxLength="200" style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #cbd5e1', resize: 'vertical' }} placeholder="Describe why you need the resource" required />
            </div>

            <div style={{ maxWidth: '220px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700' }}>Expected Attendees</label>
              <input type="number" name="expectedAttendees" value={form.expectedAttendees} onChange={handleChange} min="0" style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #cbd5e1' }} />
            </div>

            {error && <div style={{ padding: '12px 14px', borderRadius: '12px', background: '#fee2e2', color: '#991b1b' }}>{error}</div>}
            {message && <div style={{ padding: '12px 14px', borderRadius: '12px', background: '#dcfce7', color: '#166534' }}>{message}</div>}

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button type="submit" disabled={submitting} style={{ padding: '14px 20px', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', color: 'white', fontWeight: '800', cursor: 'pointer' }}>
                {submitting ? 'Submitting...' : 'Submit Booking'}
              </button>
              <button type="button" onClick={() => navigate('/resources')} style={{ padding: '14px 20px', borderRadius: '14px', border: '1px solid #cbd5e1', background: '#fff', fontWeight: '700', cursor: 'pointer' }}>
                Back to Resources
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default BookingCreatePage;
