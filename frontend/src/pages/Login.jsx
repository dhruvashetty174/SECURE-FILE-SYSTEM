import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import "./Styles/Login.css";

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
                placeholder="Enter your password"
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