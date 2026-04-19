// src/components/NotificationBell.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { notificationAPI } from '../services/api';
import { useAuth0 } from '@auth0/auth0-react';

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 15000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationAPI.getUnread();
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePanel = async () => {
    if (!showPanel) {
      await fetchNotifications();
    }
    setShowPanel(!showPanel);
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await notificationAPI.markSingleAsRead(notification.id);
        setUnreadCount(prev => prev - 1);
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    }
    // Navigate based on reference type
    if (notification.referenceId) {
      if (notification.type.includes('BOOKING')) {
        navigate(`/bookings/${notification.referenceId}`);
      } else if (notification.type.includes('TICKET')) {
        navigate(`/tickets/${notification.referenceId}`);
      }
    }
    setShowPanel(false);
  };

  const getIcon = (type) => {
    const icons = {
      BOOKING_APPROVED: '✅',
      BOOKING_REJECTED: '❌',
      BOOKING_PENDING: '⏳',
      TICKET_UPDATED: '🛠️',
      TICKET_RESOLVED: '✔️',
      COMMENT_ADDED: '💬',
      default: '🔔',
    };
    return icons[type] || icons.default;
  };

  const getColor = (type) => {
    const colors = {
      BOOKING_APPROVED: '#4caf50',
      BOOKING_REJECTED: '#f44336',
      BOOKING_PENDING: '#ff9800',
      TICKET_UPDATED: '#2196f3',
      TICKET_RESOLVED: '#4caf50',
      COMMENT_ADDED: '#9c27b0',
    };
    return colors[type] || '#667eea';
  };

  return (
    <div style={{ position: 'relative' }}>
      <motion.div
        style={{ position: 'relative', cursor: 'pointer', fontSize: '24px' }}
        onClick={togglePanel}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        🔔
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              background: '#f44336',
              color: 'white',
              borderRadius: '50%',
              padding: '2px 6px',
              fontSize: '11px',
              fontWeight: 'bold',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </motion.div>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20 }}
            style={{
              position: 'absolute',
              top: '45px',
              right: '-10px',
              width: '380px',
              maxHeight: '450px',
              overflowY: 'auto',
              background: 'white',
              borderRadius: '15px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              zIndex: 1000,
            }}
          >
            <div style={{ 
              padding: '15px', 
              borderBottom: '1px solid #eee',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '15px 15px 0 0'
            }}>
              <h3 style={{ margin: 0 }}>🔔 Notifications</h3>
              <p style={{ margin: '5px 0 0', fontSize: '12px', opacity: 0.8 }}>
                You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity }}
                  style={{ fontSize: '30px' }}
                >
                  ⏳
                </motion.div>
                <p>Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                <span style={{ fontSize: '48px' }}>🎉</span>
                <p>All caught up! No new notifications.</p>
              </div>
            ) : (
              <div>
                {notifications.slice(0, 10).map((notif, index) => (
                  <motion.div
                    key={notif.id}
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ backgroundColor: '#f5f5f5' }}
                    onClick={() => handleNotificationClick(notif)}
                    style={{
                      padding: '12px 15px',
                      borderBottom: '1px solid #eee',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '20px' }}>{getIcon(notif.type)}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{notif.title}</div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                          {notif.message.length > 80 ? notif.message.substring(0, 80) + '...' : notif.message}
                        </div>
                        <div style={{ fontSize: '10px', color: '#999' }}>
                          {new Date(notif.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: getColor(notif.type),
                        }}
                      />
                    </div>
                  </motion.div>
                ))}
                {notifications.length > 10 && (
                  <div style={{ padding: '10px', textAlign: 'center', borderTop: '1px solid #eee' }}>
                    <button
                      onClick={() => navigate('/notifications')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#667eea',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      View all {notifications.length} notifications →
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;