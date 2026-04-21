import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { bookingAPI } from '../services/bookingService';

const statusColors = {
  PENDING: { background: '#fef3c7', color: '#92400e' },
  APPROVED: { background: '#dcfce7', color: '#166534' },
  REJECTED: { background: '#fee2e2', color: '#991b1b' },
  CANCELLED: { background: '#e2e8f0', color: '#334155' },
};

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingAPI.getMyBookings();
      setBookings(response.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) {
      return;
    }

    try {
      await bookingAPI.cancelBooking(id);
      loadBookings();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel booking.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this booking?')) {
      return;
    }

    try {
      await bookingAPI.deleteBooking(id);
      loadBookings();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete booking.');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.98, x: -20 },
    show: { opacity: 1, scale: 1, x: 0, transition: { type: 'spring', bounce: 0.4 } },
  };

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
        padding: '120px 20px 48px', 
        background: 'radial-gradient(circle at bottom right, #f3e8ff, transparent 40%), radial-gradient(circle at top left, #e0f2fe 0%, #e0c3fc 100%)',
        backgroundAttachment: 'fixed',
    }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '32px', gap: '16px' }}>
          <div>
            <h1 style={{ margin: 0, color: '#1e1b4b', fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1px' }}>My Bookings</h1>
            <p style={{ margin: '8px 0 0', color: '#4338ca', fontWeight: '600' }}>Track the status of your resource requests.</p>
          </div>
          <Link to="/bookings/new" style={{ padding: '14px 24px', borderRadius: '16px', textDecoration: 'none', background: 'linear-gradient(135deg, #a855f7, #6366f1)', color: 'white', fontWeight: '800', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)', transition: 'transform 0.2s', display: 'inline-block' }} 
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}>
            ✨ New Request
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#4f46e5', fontWeight: 'bold', fontSize: '1.2rem' }}>Loading bookings...</div>
        ) : error ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '20px', borderRadius: '16px', background: 'rgba(254, 226, 226, 0.8)', color: '#991b1b', fontWeight: '800', border: '1px solid #fca5a5' }}>
            ⚠️ {error}
          </motion.div>
        ) : bookings.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '40px', borderRadius: '24px', background: 'rgba(255,255,255,0.5)', color: '#6366f1', textAlign: 'center', fontWeight: '700', ...glassPanel }}>
            You haven't requested any resources yet. 
          </motion.div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: 'grid', gap: '20px' }}>
            {bookings.map((booking) => (
              <motion.div key={booking.id} variants={itemVariants} whileHover={{ scale: 1.01 }} style={{ ...glassPanel, borderRadius: '24px', padding: '24px', transition: 'all 0.2s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 10px', color: '#1e1b4b', fontSize: '1.4rem', fontWeight: '800' }}>{booking.resourceName || booking.resourceId}</h3>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                      <span style={{ color: '#4338ca', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>📅 {booking.date}</span>
                      <span style={{ color: '#4338ca', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>⏰ {booking.startTime} - {booking.endTime}</span>
                    </div>
                    <p style={{ margin: '0', color: '#4f46e5', fontSize: '0.95rem' }}>{booking.purpose}</p>
                  </div>
                  <div style={{ alignSelf: 'flex-start', padding: '6px 16px', borderRadius: '999px', fontSize: '0.85rem', fontWeight: '800', letterSpacing: '0.5px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', ...statusColors[booking.status] }}>
                    {booking.status}
                  </div>
                </div>

                {booking.adminNote && (
                  <div style={{ marginTop: '16px', padding: '12px 16px', borderRadius: '16px', background: 'rgba(255,255,255,0.7)', color: '#312e81', borderLeft: '4px solid #a855f7' }}>
                    <strong>Admin Response:</strong> {booking.adminNote}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.5)', paddingTop: '20px' }}>
                  <Link to={`/bookings/${booking.id}`} style={{ padding: '10px 20px', borderRadius: '12px', textDecoration: 'none', background: 'rgba(255,255,255,0.8)', color: '#4f46e5', fontWeight: '800', border: '1px solid rgba(99, 102, 241, 0.3)', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => e.target.style.background = '#fff'}
                    onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.8)'}
                  >
                    View Details
                  </Link>
                  {booking.status === 'APPROVED' && (
                    <button onClick={() => handleCancel(booking.id)} style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', background: 'rgba(239, 68, 68, 0.9)', color: 'white', fontWeight: '800', cursor: 'pointer', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => e.target.style.background = '#dc2626'}
                      onMouseLeave={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.9)'}
                    >
                      Cancel Booking
                    </button>
                  )}
                  <button onClick={() => handleDelete(booking.id)} style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', background: 'rgba(31, 41, 55, 0.9)', color: 'white', fontWeight: '800', cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => e.target.style.background = '#111827'}
                    onMouseLeave={(e) => e.target.style.background = 'rgba(31, 41, 55, 0.9)'}
                  >
                    Delete Log
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default MyBookingsPage;
