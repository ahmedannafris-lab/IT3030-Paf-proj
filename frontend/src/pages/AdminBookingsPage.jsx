import React, { useEffect, useState } from 'react';
import { bookingAPI } from '../services/bookingService';

const statusOptions = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingAPI.getAllBookings();
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

  const updateBooking = async (action, id) => {
    try {
      if (action === 'approve') {
        const note = window.prompt('Optional approval note:') || '';
        await bookingAPI.approveBooking(id, note);
      } else if (action === 'reject') {
        const note = window.prompt('Enter rejection reason:');
        if (!note || !note.trim()) {
          return;
        }
        await bookingAPI.rejectBooking(id, note.trim());
      } else if (action === 'cancel') {
        await bookingAPI.adminCancelBooking(id);
      }

      loadBookings();
    } catch (err) {
      alert(err.response?.data?.error || 'Action failed.');
    }
  };

  const filteredBookings = filter === 'ALL' ? bookings : bookings.filter((booking) => booking.status === filter);

  return (
    <div style={{ minHeight: '100vh', padding: '120px 20px 48px', background: 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 45%, #7c3aed 100%)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <h1 style={{ margin: '0 0 20px', color: 'white', fontSize: '2.3rem' }}>Admin Bookings</h1>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <select value={filter} onChange={(event) => setFilter(event.target.value)} style={{ padding: '12px 14px', borderRadius: '12px', border: 'none' }}>
            {statusOptions.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <button onClick={loadBookings} style={{ padding: '12px 16px', borderRadius: '12px', border: 'none', background: 'white', fontWeight: '700', cursor: 'pointer' }}>
            Refresh
          </button>
        </div>

        {loading ? (
          <p style={{ color: 'white' }}>Loading bookings...</p>
        ) : error ? (
          <div style={{ padding: '14px', borderRadius: '12px', background: '#fee2e2', color: '#991b1b' }}>{error}</div>
        ) : filteredBookings.length === 0 ? (
          <div style={{ padding: '24px', borderRadius: '20px', background: 'rgba(255,255,255,0.96)' }}>No bookings found.</div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {filteredBookings.map((booking) => (
              <div key={booking.id} style={{ background: 'rgba(255,255,255,0.96)', borderRadius: '20px', padding: '22px', boxShadow: '0 20px 40px rgba(15, 23, 42, 0.18)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                  <div>
                    <h3 style={{ margin: '0 0 8px', color: '#0f172a' }}>{booking.resourceName || booking.resourceId}</h3>
                    <p style={{ margin: 0, color: '#475569' }}>Owner: {booking.userName || booking.userId}</p>
                    <p style={{ margin: '8px 0 0', color: '#334155' }}>{booking.date} · {booking.startTime} - {booking.endTime}</p>
                    <p style={{ margin: '8px 0 0', color: '#334155' }}>{booking.purpose}</p>
                  </div>
                  <span style={{ alignSelf: 'flex-start', padding: '8px 12px', borderRadius: '999px', background: '#e0e7ff', color: '#3730a3', fontWeight: '800' }}>
                    {booking.status}
                  </span>
                </div>

                {booking.adminNote && (
                  <div style={{ marginTop: '12px', padding: '12px 14px', borderRadius: '14px', background: '#f8fafc' }}>
                    <strong>Admin note:</strong> {booking.adminNote}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '16px' }}>
                  {booking.status === 'PENDING' && (
                    <>
                      <button onClick={() => updateBooking('approve', booking.id)} style={{ padding: '10px 14px', borderRadius: '12px', border: 'none', background: '#16a34a', color: 'white', fontWeight: '700', cursor: 'pointer' }}>
                        Approve
                      </button>
                      <button onClick={() => updateBooking('reject', booking.id)} style={{ padding: '10px 14px', borderRadius: '12px', border: 'none', background: '#dc2626', color: 'white', fontWeight: '700', cursor: 'pointer' }}>
                        Reject
                      </button>
                    </>
                  )}
                  {booking.status === 'APPROVED' && (
                    <button onClick={() => updateBooking('cancel', booking.id)} style={{ padding: '10px 14px', borderRadius: '12px', border: 'none', background: '#111827', color: 'white', fontWeight: '700', cursor: 'pointer' }}>
                      Admin Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBookingsPage;
