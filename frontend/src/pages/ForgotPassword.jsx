import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./Styles/ForgotPassword.css";
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMessage(res.data.message || "If an account exists, an OTP was sent");
      // Redirect to reset page with email prefilled
      setTimeout(() => navigate(`/reset-password?email=${encodeURIComponent(email)}`), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Request failed");
    }
  };

  return (
    <div className="forgot-password-page">
      

      <div className="forgot-card">
        <div className="icon-circle">🔑</div>
        <h2 className="title">Forgot Password</h2>
        <p className="subtitle">
          Enter your registered email and we'll send you an OTP to reset your password.
        </p>

        {message && <div className="success">{message}</div>}
        {error && <div className="error">{error}</div>}

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Registered Email</label>
            <div className="input-wrapper">
              <span className="input-icon">✉️</span>
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <button className="btn-primary" type="submit">
            Send OTP
          </button>
        </form>

        <a href="/login" className="back-link">
          ← Back to Login
        </a>
      </div>
    </div>
  );
}