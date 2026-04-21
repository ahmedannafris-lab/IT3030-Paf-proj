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

  return (
    <div style={{ minHeight: '100vh', padding: '120px 20px 48px', background: 'linear-gradient(135deg, #ecfeff 0%, #eff6ff 45%, #f5f3ff 100%)' }}>
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0, color: '#0f172a', fontSize: '2.2rem' }}>My Bookings</h1>
            <p style={{ margin: '8px 0 0', color: '#475569' }}>Track request status and manage your approved bookings.</p>
          </div>
          <Link to="/bookings/new" style={{ padding: '14px 18px', borderRadius: '14px', textDecoration: 'none', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', color: 'white', fontWeight: '800' }}>
            New Booking
          </Link>
        </div>

        {loading ? (
          <p>Loading bookings...</p>
        ) : error ? (
          <div style={{ padding: '14px', borderRadius: '12px', background: '#fee2e2', color: '#991b1b' }}>{error}</div>
        ) : bookings.length === 0 ? (
          <div style={{ padding: '24px', borderRadius: '20px', background: 'rgba(255,255,255,0.92)', color: '#64748b' }}>No bookings found.</div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {bookings.map((booking) => (
              <div key={booking.id} style={{ background: 'rgba(255,255,255,0.96)', borderRadius: '20px', padding: '22px', boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                  <div>
                    <h3 style={{ margin: '0 0 8px', color: '#0f172a' }}>{booking.resourceName || booking.resourceId}</h3>
                    <p style={{ margin: 0, color: '#475569' }}>{booking.date} · {booking.startTime} - {booking.endTime}</p>
                    <p style={{ margin: '8px 0 0', color: '#334155' }}>{booking.purpose}</p>
                  </div>
                  <span style={{ alignSelf: 'flex-start', padding: '8px 12px', borderRadius: '999px', fontSize: '0.85rem', fontWeight: '800', ...statusColors[booking.status] }}>
                    {booking.status}
                  </span>
                </div>

                {booking.adminNote && (
                  <div style={{ marginTop: '12px', padding: '12px 14px', borderRadius: '14px', background: '#f8fafc', color: '#334155' }}>
                    <strong>Admin note:</strong> {booking.adminNote}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '16px' }}>
                  <Link to={`/bookings/${booking.id}`} style={{ padding: '10px 14px', borderRadius: '12px', textDecoration: 'none', border: '1px solid #cbd5e1', color: '#0f172a', fontWeight: '700' }}>
                    View Details
                  </Link>
                  {booking.status === 'APPROVED' && (
                    <button onClick={() => handleCancel(booking.id)} style={{ padding: '10px 14px', borderRadius: '12px', border: 'none', background: '#ef4444', color: 'white', fontWeight: '700', cursor: 'pointer' }}>
                      Cancel
                    </button>
                  )}
                  {(booking.status === 'CANCELLED' || booking.status === 'REJECTED') && (
                    <button onClick={() => handleDelete(booking.id)} style={{ padding: '10px 14px', borderRadius: '12px', border: 'none', background: '#1f2937', color: 'white', fontWeight: '700', cursor: 'pointer' }}>
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MyBookingsPage;
