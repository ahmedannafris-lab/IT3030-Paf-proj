import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:8080/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.text();

      if (response.ok) {
        localStorage.setItem("resetEmail", email);
        setMessage("OTP sent successfully. Check your email.");
        setTimeout(() => {
          navigate("/verify-otp");
        }, 1200);
      } else {
        setMessage(data || "Failed to send OTP");
      }
    } catch (error) {
      setMessage("Server error while sending OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #eef4ff 0%, #dbeafe 50%, #e9d5ff 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 20px",
        paddingTop: "120px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "720px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.96)",
            borderRadius: "28px",
            padding: "56px 50px",
            boxShadow: "0 20px 40px rgba(102, 126, 234, 0.15)",
            border: "1px solid rgba(255,255,255,0.7)",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              margin: "0 auto 18px",
              borderRadius: "20px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 10px 24px rgba(102,126,234,0.28)",
            }}
          >
            <span style={{ fontSize: "34px" }}>🏫</span>
          </div>

          <h1
            style={{
              margin: "0 0 10px 0",
              fontSize: "2.2rem",
              fontWeight: "800",
              color: "#1e3a8a",
            }}
          >
            Smart Campus Hub
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: "1.05rem",
              color: "#334155",
              fontWeight: "500",
            }}
          >
            Did you forget your password?
          </p>

          <h2
            style={{
              marginTop: "12px",
              marginBottom: "38px",
              fontSize: "2.6rem",
              color: "#0f172a",
              fontWeight: "800",
              lineHeight: 1.15,
            }}
          >
            Reset your account access
          </h2>

          <form onSubmit={handleSendOtp}>
            <input
              type="email"
              placeholder="Enter Email *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "18px 18px",
                fontSize: "1.05rem",
                borderRadius: "14px",
                border: "2px solid #bfdbfe",
                outline: "none",
                marginBottom: "24px",
                boxSizing: "border-box",
                background: "#f8fbff",
                color: "#0f172a",
              }}
              onFocus={(e) => {
                e.target.style.border = "2px solid #60a5fa";
                e.target.style.background = "#ffffff";
              }}
              onBlur={(e) => {
                e.target.style.border = "2px solid #bfdbfe";
                e.target.style.background = "#f8fbff";
              }}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "18px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "#fff",
                border: "none",
                borderRadius: "14px",
                fontSize: "1.08rem",
                fontWeight: "700",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                boxShadow: "0 10px 20px rgba(102,126,234,0.25)",
              }}
            >
              {loading ? "Sending OTP..." : "Get Password Reset Link"}
            </button>
          </form>

          {message && (
            <p
              style={{
                marginTop: "18px",
                color: "#334155",
                fontSize: "0.98rem",
              }}
            >
              {message}
            </p>
          )}

          <div style={{ marginTop: "30px" }}>
            <Link
              to="/login"
              style={{
                color: "#667eea",
                textDecoration: "none",
                fontSize: "1rem",
                fontWeight: "600",
              }}
            >
              Sign in to your Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}