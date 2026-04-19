import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const email = localStorage.getItem("resetEmail");

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:8080/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, otp })
      });

      const data = await response.json();

      if (response.ok && data === true) {
        setMessage("OTP verified successfully");
        setTimeout(() => {
          navigate("/reset-password");
        }, 1200);
      } else {
        setMessage("Invalid or expired OTP");
      }
    } catch (error) {
      setMessage("Server error while verifying OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
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
          maxWidth: "650px",
          textAlign: "center",
        }}
      >
        {/* Logo */}
        <h1
          style={{
            fontSize: "3rem",
            fontWeight: "800",
            marginBottom: "40px",
            background: "linear-gradient(90deg, #c70039, #2b50ff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          ProfitSence.
        </h1>

        {/* Card */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "24px",
            padding: "48px 50px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.10)",
          }}
        >
          <p style={{ margin: 0, fontSize: "1.2rem", color: "#0f2d5c" }}>
            Enter OTP sent to your email
          </p>

          <h2
            style={{
              marginTop: "10px",
              marginBottom: "40px",
              fontSize: "2.3rem",
              color: "#0b2e63",
              fontWeight: "800",
            }}
          >
            Verify OTP
          </h2>

          <form onSubmit={handleVerifyOtp}>
            <input
              type="text"
              placeholder="Enter OTP *"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "20px 16px",
                fontSize: "1.1rem",
                borderRadius: "10px",
                border: "2px solid #234d7d",
                outline: "none",
                marginBottom: "28px",
              }}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "18px",
                background: "#c70039",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "1.15rem",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>

          {message && (
            <p style={{ marginTop: "20px", color: "#333" }}>
              {message}
            </p>
          )}

          <div style={{ marginTop: "30px" }}>
            <Link
              to="/login"
              style={{
                color: "#c70039",
                textDecoration: "none",
                fontWeight: "500",
              }}
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}