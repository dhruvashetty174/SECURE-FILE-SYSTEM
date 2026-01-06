import React, { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

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
      <style>{`
.navbar-wrapper {
          position: sticky;
          top: 0;
          z-index: 1000;
          padding: 1rem 2rem;
          font-family: 'Inter', -apple-system, sans-serif;
          display: flex;
          justify-content: center;
        }

        .navbar-glass {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          max-width: 1100px;
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(12px) saturate(180%);
          -webkit-backdrop-filter: blur(12px) saturate(180%);
          border: 1px solid rgba(209, 213, 219, 0.3);
          padding: 0.6rem 1.2rem;
          border-radius: 100px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02);
        }

        /* Navigation Links Container */
        .nav-center {
          display: flex;
          gap: 8px;
          background: #f3f4f6;
          padding: 6px;
          border-radius: 50px;
        }

        /* Base Link Style */
        .nav-link {
          text-decoration: none;
          color: #6b7280;
          font-size: 13px;
          font-weight: 600;
          padding: 8px 20px;
          border-radius: 50px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .nav-link:hover {
          color: #111827;
          background: rgba(0, 0, 0, 0.05);
        }

        /* THE CHANGE: Active State Background Color */
        .active-pill {
          background: #1a7ef2 !important; /* Blue background when clicked/active */
          color: #ffffff !important;      /* White text when clicked/active */
          box-shadow: 0 4px 10px rgba(26, 126, 242, 0.3);
        }

        /* Profile Section */
        .nav-left .profile-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 12px 4px 6px;
          background: #ffffff;
          border: 1px solid #f3f4f6;
          border-radius: 50px;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
        }

        .logout-btn {
          background: #fff;
          border: 1px solid #fee2e2;
          color: #ef4444;
          padding: 8px 16px;
          border-radius: 50px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .logout-btn:hover {
          background: #ef4444;
          color: white;
        }

        @media (max-width: 768px) {
          .nav-link span:not(.icon) { display: none; }
          .navbar-wrapper { padding: 1rem; }
        }
      `}</style>

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