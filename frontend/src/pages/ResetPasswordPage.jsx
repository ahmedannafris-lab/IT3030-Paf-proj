import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const email = localStorage.getItem("resetEmail");

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:8080/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, newPassword })
      });

      const data = await response.text();

      if (response.ok) {
        setMessage("Password reset successful");
        localStorage.removeItem("resetEmail");
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      } else {
        setMessage(data || "Failed to reset password");
      }
    } catch (error) {
      setMessage("Server error while resetting password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "120px 20px", maxWidth: "400px", margin: "0 auto" }}>
      <h2>Reset Password</h2>
      <form onSubmit={handleResetPassword}>
        <input
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "12px",
            borderRadius: "8px",
            border: "1px solid #ccc"
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            border: "none",
            borderRadius: "8px",
            background: "#667eea",
            color: "white",
            cursor: "pointer"
          }}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      {message && (
        <p style={{ marginTop: "15px", color: "#333" }}>{message}</p>
      )}
    </div>
  );
}