import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { bookingAPI } from '../services/bookingService';

const BookingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('current_user') || 'null');
    } catch (error) {
      return null;
    }
  })();

  const loadBooking = async () => {
    try {
      setLoading(true);
      const response = await bookingAPI.getBookingById(id);
      setBooking(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load booking.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooking();
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this booking?')) {
      return;
    }

    try {
      await bookingAPI.cancelBooking(id);
      loadBooking();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel booking.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this booking?')) {
      return;
    }

    try {
      await bookingAPI.deleteBooking(id);
      navigate('/bookings/my');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete booking.');
    }
  };

  if (loading) {
    return <div style={{ padding: '140px 20px', textAlign: 'center' }}>Loading booking...</div>;
  }

  if (error) {
    return <div style={{ padding: '140px 20px', textAlign: 'center', color: '#b91c1c' }}>{error}</div>;
  }

  if (!booking) {
    return <div style={{ padding: '140px 20px', textAlign: 'center' }}>Booking not found.</div>;
  }

  const isOwner = currentUser && String(currentUser.id) === String(booking.userId);
  const isAdmin = currentUser?.role === 'ADMIN';

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', bounce: 0.4, duration: 0.8 } }
  };

  const glassPanel = {
    background: 'rgba(255, 255, 255, 0.65)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.8)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.05)',
  };

  const statusColors = {
    PENDING: { background: '#fef3c7', color: '#92400e' },
    APPROVED: { background: '#dcfce7', color: '#166534' },
    REJECTED: { background: '#fee2e2', color: '#991b1b' },
    CANCELLED: { background: '#e2e8f0', color: '#334155' },
  };

  return (
    <div style={{ 
        minHeight: '100vh', 
        padding: '120px 20px 48px', 
        background: 'radial-gradient(circle at top center, #f3e8ff, transparent 50%), radial-gradient(circle at bottom right, #e0f2fe 0%, #e0c3fc 100%)',
        backgroundAttachment: 'fixed',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center'
    }}>
      <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ width: '100%', maxWidth: '840px', ...glassPanel, borderRadius: '32px', padding: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap', marginBottom: '32px' }}>
          <div>
            <h1 style={{ margin: 0, color: '#1e1b4b', fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1px' }}>{booking.resourceName || booking.resourceId}</h1>
            <p style={{ margin: '8px 0 0', color: '#4338ca', fontSize: '1.1rem', fontWeight: '600' }}>📅 {booking.date} · ⏰ {booking.startTime} - {booking.endTime}</p>
          </div>
          <span style={{ padding: '8px 20px', borderRadius: '999px', fontSize: '1rem', fontWeight: '800', letterSpacing: '0.5px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', ...statusColors[booking.status] }}>
            {booking.status}
          </span>
        </div>

        <div style={{ display: 'grid', gap: '20px', marginBottom: '32px' }}>
          <div style={{ background: 'rgba(255,255,255,0.6)', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.8)' }}>
            <h4 style={{ margin: '0 0 12px', color: '#312e81', fontSize: '1.1rem', fontWeight: '800' }}>Purpose of Booking</h4>
            <p style={{ margin: 0, color: '#4f46e5', fontSize: '1rem', lineHeight: '1.6' }}>{booking.purpose}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div style={{ background: 'rgba(255,255,255,0.6)', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.8)' }}>
              <h4 style={{ margin: '0 0 8px', color: '#312e81', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Expected Attendees</h4>
              <p style={{ margin: 0, color: '#1e1b4b', fontSize: '1.5rem', fontWeight: '900' }}>{booking.expectedAttendees} <span style={{fontSize:'1rem', color:'#6366f1'}}>people</span></p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.6)', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.8)' }}>
              <h4 style={{ margin: '0 0 8px', color: '#312e81', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Booking Owner</h4>
              <p style={{ margin: 0, color: '#1e1b4b', fontSize: '1.2rem', fontWeight: '800' }}>{booking.userName || `User #${booking.userId}`}</p>
            </div>
          </div>

          {booking.adminNote && (
            <div style={{ background: 'rgba(238, 242, 255, 0.8)', padding: '24px', borderRadius: '24px', borderLeft: '6px solid #6366f1', border: '1px solid #e0e7ff' }}>
              <h4 style={{ margin: '0 0 12px', color: '#3730a3', fontSize: '1.1rem', fontWeight: '800' }}>Admin Note</h4>
              <p style={{ margin: 0, color: '#4338ca', fontSize: '1rem', lineHeight: '1.6' }}>{booking.adminNote}</p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.5)', paddingTop: '24px' }}>
          <button onClick={() => navigate('/bookings/my')} style={{ padding: '14px 24px', borderRadius: '16px', border: '1px solid rgba(99, 102, 241, 0.3)', background: 'rgba(255,255,255,0.6)', color: '#4f46e5', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s', backdropFilter: 'blur(5px)' }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.9)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.6)'}
          >
            ← Back to List
          </button>
          
          {isOwner && booking.status === 'APPROVED' && (
            <button onClick={handleCancel} style={{ padding: '14px 24px', borderRadius: '16px', border: 'none', background: 'rgba(239, 68, 68, 0.9)', color: 'white', fontWeight: '800', cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseEnter={(e) => e.target.style.background = '#dc2626'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.9)'}
            >
              Cancel Booking
            </button>
          )}
          
          {(isOwner || isAdmin) && (booking.status === 'CANCELLED' || booking.status === 'REJECTED') && (
            <button onClick={handleDelete} style={{ padding: '14px 24px', borderRadius: '16px', border: 'none', background: 'rgba(31, 41, 55, 0.9)', color: 'white', fontWeight: '800', cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseEnter={(e) => e.target.style.background = '#111827'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(31, 41, 55, 0.9)'}
            >
              Delete Log
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default BookingDetailPage;
