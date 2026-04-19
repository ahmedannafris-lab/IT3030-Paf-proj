import React, { useEffect, useState } from "react";
import {
  getNotificationsByUserId,
  createNotification,
} from "../services/notificationService";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userId = 1;

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotificationsByUserId(userId);
      setNotifications(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setError("Failed to load notifications");
      console.error("Notification fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleAddTestNotification = async () => {
    try {
      await createNotification({
        title: "Test Notification",
        message: "Frontend connected successfully!",
        type: "NEW_COMMENT",
        isRead: false,
        createdAt: new Date().toISOString(),
        user: {
          id: userId,
        },
      });

      await loadNotifications();
    } catch (err) {
      console.error("Create notification error:", err);
      alert("Failed to create notification");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "120px 20px 40px",
        background: "linear-gradient(135deg, #eef4ff 0%, #dbeafe 50%, #e9d5ff 100%)",
      }}
    >
      <div
        style={{
          maxWidth: "850px",
          margin: "0 auto",
          background: "rgba(255,255,255,0.96)",
          borderRadius: "24px",
          padding: "30px",
          boxShadow: "0 20px 40px rgba(102, 126, 234, 0.12)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "24px",
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "#1e3a8a",
              fontSize: "2rem",
              fontWeight: "800",
            }}
          >
            Notifications
          </h2>

          <button
            onClick={handleAddTestNotification}
            style={{
              padding: "12px 18px",
              border: "none",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Add Test Notification
          </button>
        </div>

        {loading && <p>Loading notifications...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && notifications.length === 0 && (
          <p>No notifications found.</p>
        )}

        {!loading &&
          notifications.map((notification) => (
            <div
              key={notification.id}
              style={{
                border: "1px solid #dbeafe",
                padding: "16px",
                borderRadius: "14px",
                marginBottom: "14px",
                background: "#f8fbff",
              }}
            >
              <h4
                style={{
                  margin: "0 0 8px 0",
                  color: "#0f172a",
                  fontSize: "1.1rem",
                }}
              >
                {notification.title}
              </h4>

              <p
                style={{
                  margin: "0 0 8px 0",
                  color: "#334155",
                }}
              >
                {notification.message}
              </p>

              <small style={{ color: "#64748b" }}>
                Type: {notification.type}
              </small>
            </div>
          ))}
      </div>
    </div>
  );
}