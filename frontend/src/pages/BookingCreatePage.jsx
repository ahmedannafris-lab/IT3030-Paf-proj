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
    isRecurring: false,
    recurrenceType: 'DAILY',
    recurrenceEndDate: '',
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

  const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    // Date validation
    if (type === 'date' && value) {
      const selectedDate = new Date(value);
      const day = selectedDate.getUTCDay();
      
      // 0 is Sunday, 6 is Saturday
      if (day === 0 || day === 6) {
        setError('Weekends are not allowed for bookings.');
        return;
      } else {
        setError('');
      }
    }

    // End date validation
    if (name === 'recurrenceEndDate' && form.date && value < form.date) {
      setError('End date cannot be before the start date.');
      return;
    }

    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : (name === 'expectedAttendees' ? Number(value) : value),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (form.date) {
      const selectedDate = new Date(form.date);
      if (selectedDate.getUTCDay() === 0 || selectedDate.getUTCDay() === 6) {
        setError('Weekends are not allowed for bookings.');
        return;
      }
    }

    if (form.isRecurring && form.recurrenceEndDate && form.recurrenceEndDate < form.date) {
      setError('End date cannot be before the start date.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await bookingAPI.createBooking(form);
      setMessage('Booking request submitted successfully.');
      
      const createdBookings = response.data;
      if (Array.isArray(createdBookings) && createdBookings.length > 0) {
        navigate(`/bookings/${createdBookings[0].id}`);
      } else if (createdBookings && createdBookings.id) {
        // Fallback if backend returns single object instead of array
        navigate(`/bookings/${createdBookings.id}`);
      } else {
        navigate('/bookings/my');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create booking.');
    } finally {
      setSubmitting(false);
    }
  };

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
        background: 'radial-gradient(circle at top right, #f3e8ff, transparent 40%), radial-gradient(circle at bottom left, #e0f2fe 0%, #e0c3fc 100%)',
        backgroundAttachment: 'fixed',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0.4, duration: 0.8 }}
        style={{ width: '100%', maxWidth: '860px', ...glassPanel, borderRadius: '32px', padding: '40px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '32px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2.5rem', color: '#1e1b4b', fontWeight: '900', letterSpacing: '-1px' }}>Create Booking</h1>
            <p style={{ margin: '8px 0 0', color: '#4338ca', fontWeight: '500' }}>Secure a campus resource for your next grand event.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/bookings/my')}
            style={{ 
              alignSelf: 'flex-start', 
              padding: '12px 20px', 
              borderRadius: '16px', 
              border: '1px solid rgba(99, 102, 241, 0.3)', 
              background: 'rgba(255,255,255,0.5)', 
              color: '#4f46e5',
              cursor: 'pointer', 
              fontWeight: '800',
              backdropFilter: 'blur(10px)',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.8)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.5)'}
          >
            📋 My Bookings
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#4f46e5', fontWeight: 'bold' }}>✨ Loading resources...</div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: '800', color: '#312e81' }}>Select Resource</label>
              <select 
                name="resourceId" 
                value={form.resourceId} 
                onChange={handleChange} 
                style={inputStyle} 
                onFocus={(e) => e.target.style.boxShadow = inputFocusStyle}
                onBlur={(e) => e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02), 0 2px 5px rgba(0,0,0,0.02)'}
                required
              >
                <option value="">-- Choose a resource --</option>
                {resources.map((resource) => (
                  <option key={resource.id} value={resource.id}>
                    {resource.name} ({resource.type}) -📍{resource.location}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '800', color: '#312e81' }}>Date</label>
                <input type="date" name="date" value={form.date} onChange={handleChange} min={getTodayString()} style={inputStyle} 
                  onFocus={(e) => e.target.style.boxShadow = inputFocusStyle}
                  onBlur={(e) => e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02), 0 2px 5px rgba(0,0,0,0.02)'}
                required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '800', color: '#312e81' }}>Start Time</label>
                <input type="time" name="startTime" value={form.startTime} onChange={handleChange} style={inputStyle} 
                  onFocus={(e) => e.target.style.boxShadow = inputFocusStyle}
                  onBlur={(e) => e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02), 0 2px 5px rgba(0,0,0,0.02)'}
                required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '800', color: '#312e81' }}>End Time</label>
                <input type="time" name="endTime" value={form.endTime} onChange={handleChange} style={inputStyle} 
                  onFocus={(e) => e.target.style.boxShadow = inputFocusStyle}
                  onBlur={(e) => e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02), 0 2px 5px rgba(0,0,0,0.02)'}
                required />
              </div>
            </div>

            <div style={{ padding: '24px', background: 'rgba(255,255,255,0.4)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.7)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontWeight: '800', color: '#312e81', fontSize: '1.1rem' }}>
                <input type="checkbox" name="isRecurring" checked={form.isRecurring} onChange={handleChange} style={{ width: '20px', height: '20px', accentColor: '#4f46e5' }} />
                🔄 Make this a Recurring Booking
              </label>
              
              {form.isRecurring && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', overflow: 'hidden' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: '800', color: '#312e81' }}>Recurrence Pattern</label>
                    <select name="recurrenceType" value={form.recurrenceType} onChange={handleChange} style={inputStyle} 
                      onFocus={(e) => e.target.style.boxShadow = inputFocusStyle}
                      onBlur={(e) => e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02), 0 2px 5px rgba(0,0,0,0.02)'}
                      required={form.isRecurring}
                    >
                      <option value="DAILY">Daily</option>
                      <option value="WEEKLY">Weekly</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: '800', color: '#312e81' }}>End Date (Max 30 days)</label>
                    <input type="date" name="recurrenceEndDate" value={form.recurrenceEndDate} onChange={handleChange} min={form.date || getTodayString()} style={inputStyle} 
                      onFocus={(e) => e.target.style.boxShadow = inputFocusStyle}
                      onBlur={(e) => e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02), 0 2px 5px rgba(0,0,0,0.02)'}
                      required={form.isRecurring} 
                    />
                  </div>
                </motion.div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: '800', color: '#312e81' }}>Booking Purpose</label>
              <textarea name="purpose" value={form.purpose} onChange={handleChange} rows="4" maxLength="200" style={{ ...inputStyle, resize: 'vertical' }} placeholder="Provide a detailed reason for the resource request..." 
                onFocus={(e) => e.target.style.boxShadow = inputFocusStyle}
                onBlur={(e) => e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02), 0 2px 5px rgba(0,0,0,0.02)'}
              required />
            </div>

            <div style={{ maxWidth: '240px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: '800', color: '#312e81' }}>Expected Attendees</label>
              <input type="number" name="expectedAttendees" value={form.expectedAttendees} onChange={handleChange} min="0" style={inputStyle} 
                onFocus={(e) => e.target.style.boxShadow = inputFocusStyle}
                onBlur={(e) => e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02), 0 2px 5px rgba(0,0,0,0.02)'}
              />
            </div>

            {error && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '16px', borderRadius: '16px', background: 'rgba(254, 226, 226, 0.8)', color: '#991b1b', fontWeight: '800', border: '1px solid #fca5a5' }}>⚠️ {error}</motion.div>}
            {message && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '16px', borderRadius: '16px', background: 'rgba(220, 252, 231, 0.8)', color: '#166534', fontWeight: '800', border: '1px solid #86efac' }}>✅ {message}</motion.div>}

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '16px' }}>
              <button 
                type="submit" 
                disabled={submitting} 
                style={{ 
                  flex: '1',
                  minWidth: '200px',
                  padding: '18px 24px', 
                  borderRadius: '16px', 
                  border: 'none', 
                  background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)', 
                  color: 'white', 
                  fontWeight: '900', 
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)',
                  transition: 'transform 0.2s',
                  opacity: submitting ? 0.7 : 1
                }}
                onMouseEnter={(e) => !submitting && (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => !submitting && (e.currentTarget.style.transform = 'translateY(0)')}
              >
                {submitting ? 'Submitting Request...' : 'Submit Booking Request'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default BookingCreatePage;
