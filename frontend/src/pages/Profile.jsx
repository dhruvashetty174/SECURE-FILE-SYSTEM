import React, { useEffect, useState } from "react";
import api from "../api";
import "./Styles/Profile.css";

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