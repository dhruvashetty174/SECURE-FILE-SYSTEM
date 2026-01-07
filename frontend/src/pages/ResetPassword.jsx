import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api";
import "./Styles/ResetPassword.css";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const e = searchParams.get("email");
    if (e) setEmail(e);
  }, [searchParams]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await api.post("/auth/reset-password", { 
        email, 
        otp, 
        newPassword, 
        confirmPassword 
      });
      setMessage(res.data.message || "Password updated");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
    }
  };

  return (
    <div className="reset-password-page">
     

      <div className="reset-card">
        <div className="header-section">
          <div className="icon-box">🛡️</div>
          <h2 className="title">Reset Password</h2>
          <p className="subtitle">Securely update your account credentials</p>
        </div>

        {message && <div className="success">{message}</div>}
        {error && <div className="error">{error}</div>}

        <form onSubmit={onSubmit}>
          <div className="form-row">
            <label>Email Address</label>
            <input 
              className="input" 
              type="email"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="name@example.com"
              required
            />
          </div>

          <div className="form-row">
            <label>OTP Code</label>
            <input 
              className="input" 
              value={otp} 
              onChange={(e) => setOtp(e.target.value)} 
              placeholder="Enter 6-digit code"
              required
            />
            <p className="helper-text">Check your inbox for the reset code.</p>
          </div>

          <div className="form-row">
            <label>New Password</label>
            <input 
              className="input" 
              type="password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              placeholder="Enter Your New Password"
              required
            />
          </div>

          <div className="form-row">
            <label>Confirm Password</label>
            <input 
              className="input" 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              placeholder="Enter Your Password"
              required
            />
          </div>

          <button className="btn btn-primary" type="submit">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}