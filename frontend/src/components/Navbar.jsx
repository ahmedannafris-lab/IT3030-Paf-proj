import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { path: "/", name: "Home" },
    { path: "/about", name: "About" },
    { path: "/contact", name: "Contact" },
    { path: "/incidents", name: "Incidents" },
    { path: "/notifications", name: "Notifications" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: isScrolled
          ? "rgba(255,255,255,0.98)"
          : "rgba(255,255,255,0.95)",
        backdropFilter: "blur(10px)",
        boxShadow: isScrolled ? "0 2px 10px rgba(0,0,0,0.1)" : "none",
        padding: "1rem 2rem",
        transition: "all 0.3s ease",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div
          onClick={() => navigate("/")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: "28px" }}>🏫</span>
          <div>
            <h1 style={{ fontSize: "1.3rem", margin: 0, color: "#667eea" }}>
              Smart Campus Hub
            </h1>
            <p style={{ fontSize: "0.7rem", margin: 0, color: "#666" }}>
              SLIIT · Campus Operations
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "2rem",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                color: isActive(link.path) ? "#667eea" : "#333",
                textDecoration: "none",
                fontWeight: isActive(link.path) ? "600" : "500",
                padding: "8px 0",
                borderBottom: isActive(link.path)
                  ? "2px solid #667eea"
                  : "2px solid transparent",
              }}
            >
              {link.name}
            </Link>
          ))}

          {isAuthenticated && (
            <>
              <Link
                to="/dashboard"
                style={{ textDecoration: "none", color: "#333" }}
              >
                Dashboard
              </Link>
              {user?.role === "ADMIN" && (
                <Link
                  to="/admin"
                  style={{ textDecoration: "none", color: "#333" }}
                >
                  Admin
                </Link>
              )}
            </>
          )}
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          {!isAuthenticated ? (
            <>
              <button
                onClick={() => navigate("/login")}
                style={{
                  padding: "8px 20px",
                  background: "transparent",
                  border: "2px solid #667eea",
                  borderRadius: "25px",
                  color: "#667eea",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register")}
                style={{
                  padding: "8px 20px",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                  borderRadius: "25px",
                  color: "white",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Register
              </button>
            </>
          ) : (
            <div
              style={{
                display: "flex",
                gap: "15px",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "14px", color: "#333" }}>
                👋 {user?.name?.split(" ")[0]}
              </span>
              <button
                onClick={logout}
                style={{
                  padding: "8px 16px",
                  background: "#f44336",
                  border: "none",
                  borderRadius: "25px",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;