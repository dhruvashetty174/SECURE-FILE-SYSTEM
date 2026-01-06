import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api";

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
      <style>{`
        .reset-password-page {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 90vh;
          background-color: #f8f9fa;
          font-family: 'Inter', -apple-system, sans-serif;
          padding: 20px;
        }

        .reset-card {
         background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 400px;
  text-align: center;
  border: 1px solid black;
        }

        .header-section {
          text-align: center;
          margin-bottom: 30px;
        }

        .icon-box {
          background: #eef5ff;
          color: #1a7ef2;
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          font-size: 24px;
        }

        .title {
          font-size: 26px;
          font-weight: 800;
          color: #111827;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .subtitle {
          color: #6b7280;
          font-size: 14px;
        }

        .form-row {
          margin-bottom: 20px;
        }

        .form-row label {
          display: block;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 8px;
          color: #374151;
        }

        .input-wrapper {
          position: relative;
        }

        .input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          font-size: 15px;
          color: #1f2937;
          box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
        }

        .input:focus {
          border-color: #1a7ef2;
          box-shadow: 0 0 0 3px rgba(26, 126, 242, 0.1);
        }

        .btn-primary {
          width: 100%;
          padding: 14px;
          background-color: #1a7ef2;
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          transition: background 0.2s;
          margin-top: 10px;
        }

        .btn-primary:hover {
          background-color: #1565c0;
        }

        .success {
          background: #f0fdf4;
          color: #166534;
          padding: 14px;
          border-radius: 10px;
          margin-bottom: 24px;
          font-size: 14px;
          text-align: center;
          border: 1px solid #dcfce7;
        }

        .error {
          background: #fff5f5;
          color: #e03131;
          padding: 14px;
          border-radius: 10px;
          margin-bottom: 24px;
          font-size: 14px;
          text-align: center;
          border: 1px solid #ffe3e3;
        }

        .helper-text {
          font-size: 12px;
          color: #9ca3af;
          margin-top: 4px;
        }
      `}</style>

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