import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const role = user?.role || "USER";

  const menus = {
    USER: [
      { path: "/dashboard", name: "Dashboard", icon: "📊" },
      { path: "/bookings/my", name: "My Bookings", icon: "📅" },
      { path: "/bookings/new", name: "New Booking", icon: "➕" },
      { path: "/resources", name: "Resources", icon: "💻" },
      { path: "/notifications", name: "Notifications", icon: "🔔" },
    ],
    ADMIN: [
      { path: "/admin", name: "Admin Dashboard", icon: "⚙️" },
      { path: "/admin/resources", name: "Resource Admin", icon: "🏢" },
      { path: "/admin/bookings", name: "Booking Admin", icon: "📑" },
      { path: "/resources", name: "All Resources", icon: "💻" },
      { path: "/notifications", name: "Notifications", icon: "🔔" },
    ],
    TECHNICIAN: [
      { path: "/dashboard", name: "Tech Dashboard", icon: "🔧" },
      { path: "/resources", name: "Resources", icon: "💻" },
      { path: "/notifications", name: "Notifications", icon: "🔔" },
    ],
  };

  const links = menus[role] || menus.USER;

  const isActive = (path) => location.pathname === path;

  return (
    <aside
      style={{
        position: "fixed",
        top: "70px", // Below navbar
        left: 0,
        bottom: 0,
        width: "250px",
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        boxShadow: "2px 0 10px rgba(0,0,0,0.05)",
        padding: "20px 0",
        overflowY: "auto",
        zIndex: 900,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <div style={{ padding: "0 20px", marginBottom: "10px" }}>
        <h3 style={{ margin: 0, color: "#667eea", fontSize: "14px", textTransform: "uppercase", letterSpacing: "1px" }}>
          {role} MENU
        </h3>
      </div>
      
      {links.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 24px",
            color: isActive(link.path) ? "#667eea" : "#4a5568",
            textDecoration: "none",
            fontWeight: isActive(link.path) ? "700" : "500",
            background: isActive(link.path) ? "#f0f4ff" : "transparent",
            borderRight: isActive(link.path) ? "4px solid #667eea" : "4px solid transparent",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            if (!isActive(link.path)) {
              e.currentTarget.style.background = "#f7fafc";
              e.currentTarget.style.color = "#2d3748";
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive(link.path)) {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#4a5568";
            }
          }}
        >
          <span style={{ fontSize: "1.2rem" }}>{link.icon}</span>
          <span>{link.name}</span>
        </Link>
      ))}
    </aside>
  );
};

export default Sidebar;
