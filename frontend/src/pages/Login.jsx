import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Added for the eye icon logic
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  const onResend = async () => {
    const to = prompt("Enter the email address to resend confirmation to:", email || "");
    if (!to) return;
    try {
      const res = await fetch(`${(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000")}/api/auth/resend-confirmation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: to }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Resend failed");
      alert(data.message || "Confirmation email sent");
    } catch (err) {
      alert(err.message || "Resend failed");
    }
  };

  return (
    <div className="login-container">
      <style>{`
        .login-container {
        
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: #f8f9fa;
          font-family: 'Inter', -apple-system, sans-serif;
        }
        .login-card {
        background: white;
        padding: 40px;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        width: 100%;
        max-width: 400px;
        text-align: center;
        border: 1px solid black; /* added black border */
}

        .icon-header {
          background: #eef5ff;
          color: #1a73e8;
          width: 48px;
          height: 48px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          font-size: 24px;
        }
        .title { font-size: 24px; font-weight: 700; margin-bottom: 8px; color: #111; }
        .subtitle { color: #6c757d; font-size: 14px; margin-bottom: 30px; }
        .form-group { text-align: left; margin-bottom: 20px; position: relative; }
        .form-group label { display: block; font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #333; }
        .input-wrapper { position: relative; display: flex; align-items: center; }
        .input-icon { position: absolute; left: 12px; color: #adb5bd; }
        .input {
          width: 100%;
          padding: 12px 12px 12px 40px;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.2s;
          outline: none;
        }
        .input:focus { border-color: #1a73e8; }
        .password-toggle { position: absolute; right: 12px; cursor: pointer; color: #adb5bd; border: none; background: none; }
        .extra-options { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; font-size: 13px; }
        .remember-me { display: flex; align-items: center; color: #6c757d; }
        .remember-me input { margin-right: 8px; }
        .forgot-password { color: #1a73e8; text-decoration: none; font-weight: 600; border: none; background: none; cursor: pointer; }
        .submit-btn {
          width: 100%;
          padding: 12px;
          background-color: #1a73e8;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .submit-btn:hover { background-color: #1557b0; }
        .footer-text { margin-top: 25px; font-size: 14px; color: #6c757d; }
        .signup-link { color: #1a73e8; font-weight: 600; border: none; background: none; cursor: pointer; padding-left: 5px; }
        .error-msg { background: #fff5f5; color: #e03131; padding: 10px; border-radius: 6px; margin-bottom: 15px; font-size: 13px; }
        .resend-btn { display: block; margin: 15px auto 0; font-size: 12px; color: #adb5bd; background: none; border: none; cursor: pointer; }
      `}</style>

      <div className="login-card">
        <div className="icon-header">🔒</div>
        <h2 className="title">Welcome back</h2>
        <p className="subtitle">Please enter your details to sign in.</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Email or Username</label>
            <div className="input-wrapper">
              <span className="input-icon">✉️</span>
              <input 
                className="input" 
                placeholder="e.g. user@fileflow.com"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔑</span>
              <input 
                className="input" 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁️" : "🙈"}
              </button>
            </div>
          </div>

          <div className="extra-options">
            <label className="remember-me">
              <input type="checkbox" /> Remember me
            </label>
            <button type="button" onClick={() => navigate('/forgot-password')} className="forgot-password">
              Forgot password?
            </button>
          </div>

          <button className="submit-btn" type="submit">Sign in</button>
        </form>

        <div className="footer-text">
          Don't have an account? 
          <button onClick={() => navigate('/signup')} className="signup-link">Sign up</button>
        </div>
        
        <button onClick={onResend} className="resend-btn">
          Resend confirmation email
        </button>
      </div>
    </div>
  );
}