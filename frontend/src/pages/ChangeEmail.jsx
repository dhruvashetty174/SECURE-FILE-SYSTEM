import React, { useState } from "react";
import api from "../api";
import "./Styles/ChangeEmail.css";


export default function ChangeEmail() {
  const [newEmail, setNewEmail] = useState("");
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setError(null);
    try {
      const res = await api.post("/auth/change-email", { newEmail });
      setMsg(res.data.message || "Confirmation sent to new email");
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className="change-email-page">
     

      <div className="email-card">
        <div className="icon-box">✉️</div>
        <h2 className="title">Update Email</h2>
        <p className="subtitle">
          Enter your new email address. We'll send a confirmation link to verify the change.
        </p>

        {msg && <div className="success">{msg}</div>}
        {error && <div className="error">{error}</div>}

        <form className="form" onSubmit={submit}>
          <div className="form-group">
            <label>New Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon">📧</span>
              <input
                className="input"
                type="email"
                placeholder="name@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <button className="btn btn-primary" type="submit">
            Update & Send Verification
          </button>
        </form>
      </div>
    </div>
  );
}