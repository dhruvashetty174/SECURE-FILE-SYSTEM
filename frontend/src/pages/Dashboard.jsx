import React, { useEffect, useState } from "react";
import api from "../api";
import UploadForm from "../components/UploadForm";
import FileList from "../components/FileList";
import "./Styles/Dashboard.css";

export default function Dashboard() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const res = await api.get("/files");
      setFiles(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load files");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const onUploaded = () => loadFiles();

  const [newEmail, setNewEmail] = React.useState("");
  const [emailMsg, setEmailMsg] = React.useState(null);

  const changeEmail = async (e) => {
    e.preventDefault();
    if (!newEmail) return setEmailMsg("Enter a new email");
    try {
      const res = await api.post("/auth/change-email", { newEmail });
      setEmailMsg(res.data.message || "Email updated");
    } catch (err) {
      setEmailMsg(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className="dashboard-wrapper">
      <style>{`
       
      `}</style>

      <header className="dashboard-header">
        <div>
          <h2 className="title">My Files</h2>
          <p className="subtitle">Manage and share your documents securely</p>
        </div>
        <button onClick={loadFiles} className="btn-refresh">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 4v6h-6"></path>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
          Refresh List
        </button>
      </header>

      {/* Upload Section (Commented out as per original) */}
      {/* <section className="section-card">
        <UploadForm onUploaded={onUploaded} />
      </section> */}

      {/* File List Section */}
      <div className="section-card">
        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Syncing your workspace...</p>
          </div>
        )}
        
        {error && (
          <div className="error">
            <svg style={{marginRight: '8px'}} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {error}
          </div>
        )}

        {!loading && (
          <FileList files={files} onRefresh={loadFiles} />
        )}
      </div>
    </div>
  );
}