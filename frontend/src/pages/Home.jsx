import React from "react";
import { Link } from "react-router-dom";
import "./Styles/Home.css";

function Home() {
  return (
    <>
    

      {/* Page Content */}
      <div className="home-page">
        {/* Hero */}
        <section className="hero">
          <div className="hero-content">
            <h1 className="hero-title">Secure File System</h1>
            <p className="hero-subtitle">
              The professional choice for secure storage. Upload, manage, and 
              share your digital assets with end-to-end control and military-grade protection.
            </p>
            <div className="hero-buttons">
              <Link to="/login" className="btn btn-primary">
                Get Started 🚀
              </Link>
              <Link to="/register" className="btn btn-secondary">
                Create Account
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="features">
          <h2 className="features-title">Enterprise-Grade Features</h2>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>Secure Upload</h3>
              <p>Your data is prioritized. Files are safely stored with multi-layer encryption and restricted access protocols.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔗</div>
              <h3>Smart Links</h3>
              <p>Generate shareable public links or keep things private. Set custom passcodes to protect sensitive information.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📁</div>
              <h3>Full Control</h3>
              <p>A unified dashboard allowing you to replace, delete, and audit your files in real-time with zero friction.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">👤</div>
              <h3>Profile Security</h3>
              <p>Robust user management. Self-service password resets and secure profile updates keep you in charge.</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta">
          <div className="blob" style={{ top: '-100px', left: '-100px' }}></div>
          <div className="blob" style={{ bottom: '-100px', right: '-100px', background: '#3b82f6' }}></div>
          <div className="cta-content">
            <p>Ready to secure your digital workflow?</p>
            <Link to="/login" className="btn btn-primary">
              Login Now
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}

export default Home;