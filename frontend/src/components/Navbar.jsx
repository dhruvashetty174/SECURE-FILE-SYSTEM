import React, { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import "./Styles/Navbar.css";

export default function Navbar() {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  // Helper to determine active class based on current URL
  const isActive = (path) => (location.pathname === path ? "active-pill" : "");

  return (
    <nav className="navbar-wrapper">
      

      <div className="navbar-glass">
        {/* Left: Profile */}
        <div className="nav-left">
          {token && (
            <Link to="/profile" className="profile-chip">
              <img
                src="https://www.gravatar.com/avatar/?d=mp&s=200"
                alt="profile"
                className="avatar"
              />
              <span className="profile-text">My Profile</span>
            </Link>
          )}
        </div>

        {/* Center: Main Navigation */}
        <div className="nav-center">
          {token ? (
            <>
              <Link to="/upload" className={`nav-link ${isActive('/upload')}`}>
                <span className="icon">⬆️</span> <span>Upload</span>
              </Link>
              <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>
                <span className="icon">📊</span> <span>Dashboard</span>
              </Link>
            </>
          ) : (
            <>
              {/* Login and Register now use the exact same isActive logic and CSS */}
              <Link to="/login" className={`nav-link ${isActive('/login')}`}>
                <span className="icon">🔐</span> <span>Login</span>
              </Link>

              <Link to="/register" className={`nav-link ${isActive('/register')}`}>
                <span className="icon">🆕</span> <span>Register</span>
              </Link>
            </>
          )}
        </div>

        {/* Right: Logout */}
        <div className="nav-right">
          {token && (
            <button onClick={onLogout} className="logout-btn" title="Sign out">
              <span>Sign out</span>
              <span className="icon">↩️</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}