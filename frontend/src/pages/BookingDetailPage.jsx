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

  return (
    <div style={{ minHeight: '100vh', padding: '120px 20px 48px', background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 40%, #ede9fe 100%)' }}>
      <div style={{ maxWidth: '840px', margin: '0 auto', background: 'rgba(255,255,255,0.96)', borderRadius: '28px', padding: '32px', boxShadow: '0 24px 50px rgba(15, 23, 42, 0.10)' }}>
        <h1 style={{ marginTop: 0, color: '#0f172a' }}>{booking.resourceName || booking.resourceId}</h1>
        <p style={{ color: '#475569' }}>{booking.date} · {booking.startTime} - {booking.endTime}</p>
        <p><strong>Status:</strong> {booking.status}</p>
        <p><strong>Purpose:</strong> {booking.purpose}</p>
        <p><strong>Expected attendees:</strong> {booking.expectedAttendees}</p>
        <p><strong>Admin note:</strong> {booking.adminNote || 'None'}</p>
        <p><strong>Booking owner:</strong> {booking.userName || booking.userId}</p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '24px' }}>
          <button onClick={() => navigate('/bookings/my')} style={{ padding: '12px 18px', borderRadius: '14px', border: '1px solid #cbd5e1', background: '#fff', fontWeight: '700', cursor: 'pointer' }}>
            Back
          </button>
          {isOwner && booking.status === 'APPROVED' && (
            <button onClick={handleCancel} style={{ padding: '12px 18px', borderRadius: '14px', border: 'none', background: '#ef4444', color: 'white', fontWeight: '700', cursor: 'pointer' }}>
              Cancel Booking
            </button>
          )}
          {(isOwner || isAdmin) && (booking.status === 'CANCELLED' || booking.status === 'REJECTED') && (
            <button onClick={handleDelete} style={{ padding: '12px 18px', borderRadius: '14px', border: 'none', background: '#1f2937', color: 'white', fontWeight: '700', cursor: 'pointer' }}>
              Delete Booking
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetailPage;
