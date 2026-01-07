import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import "./Styles/Register.css";

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