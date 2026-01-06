import React, { useEffect, useState } from "react";
import api from "../api";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/auth/me');
        setProfile(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile');
      }
    }
    fetch();
  }, []);

  if (error) return (
    <div className="profile-page">
      <div className="error-card">Error: {error}</div>
    </div>
  );

  if (!profile) return (
    <div className="profile-page">
      <div className="loading-spinner">Loading profile...</div>
    </div>
  );

  return (
    <div className="profile-page">
      <style>{`
        .profile-page {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 80vh;
          font-family: 'Inter', -apple-system, sans-serif;
          padding: 20px;
          background-color: #f9fafb;
        }

        .profile-card {
          background: white;
          width: 100%;
          max-width: 500px;
          border-radius: 24px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.04);
          overflow: hidden;
          border: 1px solid #f0f0f0;
        }

        .profile-cover {
          height: 120px;
          background: linear-gradient(135deg, #1a7ef2 0%, #00d4ff 100%);
        }

        .profile-content {
          padding: 0 40px 40px 40px;
          text-align: center;
          position: relative;
        }

        .avatar-wrapper {
          width: 110px;
          height: 110px;
          border-radius: 50%;
          background: white;
          padding: 5px;
          margin: -55px auto 15px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .profile-avatar {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }

        .title {
          font-size: 24px;
          font-weight: 800;
          color: #111827;
          margin: 0 0 4px 0;
        }

        .badge {
          display: inline-block;
          padding: 4px 12px;
          background: #eff6ff;
          color: #1a7ef2;
          font-size: 12px;
          font-weight: 700;
          border-radius: 100px;
          margin-bottom: 30px;
        }

        .info-grid {
          text-align: left;
          border-top: 1px solid #f3f4f6;
          padding-top: 25px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
        }

        .info-label {
          color: #6b7280;
          font-size: 14px;
          font-weight: 500;
        }

        .info-value {
          color: #111827;
          font-size: 14px;
          font-weight: 600;
        }

        .error-card {
          background: #fff5f5;
          color: #e03131;
          padding: 20px;
          border-radius: 12px;
          border: 1px solid #ffe3e3;
        }

        .loading-spinner {
          color: #6b7280;
          font-weight: 500;
        }
      `}</style>

      <div className="profile-card">
        <div className="profile-cover"></div>
        <div className="profile-content">
          <div className="avatar-wrapper">
            <img 
              src={`https://www.gravatar.com/avatar/${profile.email}?d=mp&s=200`} 
              alt="avatar" 
              className="profile-avatar"
            />
          </div>
          
          <h2 className="title">{profile.username}</h2>
          <span className="badge">Active Member</span>

          <div className="info-grid">
            <div className="info-row">
              <span className="info-label">Account Username</span>
              <span className="info-value">{profile.username}</span>
            </div>
            
            <div className="info-row">
              <span className="info-label">Email Address</span>
              <span className="info-value">{profile.email}</span>
            </div>

            <div className="info-row">
              <span className="info-label">Storage Type</span>
              <span className="info-value">Cloud Basic</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}