import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <>
      {/* Enhanced Inline CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');

        .home-page {
          font-family: 'Inter', sans-serif;
          color: #111827;
          overflow-x: hidden;
        }

        /* Hero Section with Mesh Gradient */
        .hero {
          min-height: 90vh;
          display: flex;
          justify-content: center;
          align-items: center;
          text-align: center;
          background-color: #4f46e5;
          background-image: 
            radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), 
            radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%), 
            radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%);
          color: white;
          padding: 2rem;
          position: relative;
        }

        .hero-content {
          z-index: 2;
          max-width: 800px;
        }

        .hero-title {
          font-size: clamp(2.5rem, 8vw, 4.5rem);
          font-weight: 800;
          margin-bottom: 1.5rem;
          line-height: 1.1;
          letter-spacing: -0.02em;
        }

        .hero-subtitle {
          font-size: clamp(1rem, 3vw, 1.25rem);
          max-width: 650px;
          margin: 0 auto 3rem;
          line-height: 1.6;
          color: #e0e7ff;
        }

        .hero-buttons {
          display: flex;
          justify-content: center;
          gap: 1.2rem;
          flex-wrap: wrap;
        }

        .btn {
          padding: 1rem 2.5rem;
          border-radius: 12px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .btn-primary {
          background: #ffffff;
          color: #4f46e5;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
          background: #f8fafc;
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(10px);
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.5);
          transform: translateY(-2px);
        }

        /* Features Section */
        .features {
          padding: 6rem 2rem;
          background: #ffffff;
          text-align: center;
        }

        .features-title {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 4rem;
          color: #111827;
          letter-spacing: -0.01em;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2.5rem;
          max-width: 1200px;
          margin: auto;
        }

        .feature-card {
          background: #ffffff;
          padding: 3rem 2rem;
          border-radius: 24px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
          text-align: left;
        }

        .feature-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px -15px rgba(79, 70, 229, 0.1);
          border-color: #e0e7ff;
        }

        .feature-icon {
          font-size: 2rem;
          margin-bottom: 1.5rem;
          background: #f8fafc;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
        }

        .feature-card h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: #1e293b;
        }

        .feature-card p {
          color: #64748b;
          font-size: 1rem;
          line-height: 1.6;
        }

        /* CTA Section */
        .cta {
          background: #111827;
          color: white;
          text-align: center;
          padding: 6rem 2rem;
          position: relative;
          overflow: hidden;
        }

        .cta-content {
          position: relative;
          z-index: 2;
        }

        .cta p {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 2rem;
          color: #f8fafc;
        }

        /* Decorative blobs */
        .blob {
          position: absolute;
          width: 300px;
          height: 300px;
          background: #4f46e5;
          filter: blur(80px);
          opacity: 0.2;
          border-radius: 50%;
          z-index: 1;
        }

        @media (max-width: 600px) {
          .hero { height: auto; padding: 6rem 1.5rem; }
          .hero-buttons { flex-direction: column; }
          .btn { width: 100%; }
        }
      `}</style>

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