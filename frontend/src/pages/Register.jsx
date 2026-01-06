import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

export default function Register() {
  const { register } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Added for UI consistency
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      const res = await register({ email, password, username });
      if (res.emailDeliveryStatus && res.emailDeliveryStatus !== "sent") {
        setError(res.message || "Registration completed but confirmation email not delivered.");
        return;
      }
      if (res.emailDeliveryStatus === "sent") {
        setError(null);
        setSuccess(res.message || "Registered email sent successfully");
        return;
      }
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="register-page">
      <style>{`
        .register-page {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: #f3f4f6;
          font-family: 'Inter', -apple-system, sans-serif;
          padding: 20px;
        }
        .register-card {
           background: white;
        padding: 40px;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        width: 100%;
        max-width: 400px;
        text-align: center;
        border: 1px solid black; /* added black border */
        }
        .title { 
          font-size: 32px; 
          font-weight: 800; 
          margin-bottom: 8px; 
          color: #000;
          letter-spacing: -0.5px;
        }
        .subtitle { 
          color: #6b7280; 
          font-size: 15px; 
          margin-bottom: 32px; 
        }
        .form-group { margin-bottom: 20px; }
        .form-group label { 
          display: block; 
          font-size: 14px; 
          font-weight: 700; 
          margin-bottom: 8px; 
          color: #374151; 
        }
        .input-wrapper { position: relative; }
        .input {
          width: 100%;
          padding: 14px 16px;
          padding-right: 40px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          font-size: 15px;
          color: #1f2937;
          box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .input::placeholder { color: #9ca3af; }
        .input:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        .field-icon {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          pointer-events: none;
        }
        .register-btn {
          width: 100%;
          padding: 14px;
          background-color: #1a7ef2;
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          margin-top: 12px;
          transition: background 0.2s;
        }
        .register-btn:hover { background-color: #1565c0; }
        .footer-text { 
          text-align: center; 
          margin-top: 24px; 
          font-size: 14px; 
          color: #6b7280; 
        }
        .login-link { 
          color: #1a7ef2; 
          font-weight: 600; 
          text-decoration: none; 
          background: none; 
          border: none; 
          cursor: pointer;
          padding-left: 4px;
        }
        .error-msg { background: #fee2e2; color: #dc2626; padding: 12px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; text-align: center;}
        .success-msg { background: #f0fdf4; color: #166534; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;}
      `}</style>

      <div className="register-card">
        <h2 className="title">Create an Account</h2>
        <p className="subtitle">Sign up to start managing your files securely.</p>

        {error && <div className="error-msg">{error}</div>}
        
        {success ? (
          <div className="success-msg">
            <div>{success}</div>
            <button className="register-btn" style={{marginTop: '20px'}} onClick={() => navigate("/login")}>Go to login</button>
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label>Username</label>
              <div className="input-wrapper">
                <input 
                  className="input" 
                  placeholder="Enter your username"
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required 
                />
                <span className="field-icon">👤</span>
              </div>
            </div>

            <div className="form-group">
              <label>Email</label>
              <div className="input-wrapper">
                <input 
                  className="input" 
                  type="email"
                  placeholder="Enter your email address"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
                <span className="field-icon">✉️</span>
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-wrapper">
                <input 
                  className="input" 
                  type="password" 
                  placeholder="Create a password"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
                <span className="field-icon">👁️</span>
              </div>
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <div className="input-wrapper">
                <input 
                  className="input" 
                  type="password" 
                  placeholder="Re-enter your password"
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                />
                <span className="field-icon">🔒</span>
              </div>
            </div>

            <button className="register-btn" type="submit">Register</button>
          </form>
        )}

        <div className="footer-text">
          Already have an account? 
          <button onClick={() => navigate('/login')} className="login-link">Log in</button>
        </div>
      </div>
    </div>
  );
}