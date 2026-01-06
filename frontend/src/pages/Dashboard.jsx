import React, { useEffect, useState } from "react";
import api from "../api";
import UploadForm from "../components/UploadForm";
import FileList from "../components/FileList";

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
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .dashboard-wrapper {
          max-width: 1100px;
          margin: 60px auto;
          padding: 0 24px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #1a1f36;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 3rem;
        }

        .title { 
          font-size: 32px; 
          font-weight: 800; 
          letter-spacing: -0.025em;
          color: #111827; 
          margin: 0;
        }

        .subtitle {
          color: #64748b;
          margin: 8px 0 0 0;
          font-size: 16px;
        }

        .section-card {
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02);
          padding: 32px;
          margin-bottom: 2rem;
          transition: transform 0.2s ease;
        }

        /* Modern Spinner */
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px;
          color: #64748b;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #1a7ef2;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Enhanced Buttons */
        .btn-refresh {
          background: #ffffff;
          color: #475569;
          border: 1px solid #e2e8f0;
          padding: 10px 18px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .btn-refresh:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          transform: translateY(-1px);
        }

        .error {
          background: #fef2f2;
          color: #b91c1c;
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 24px;
          border: 1px solid #fee2e2;
          display: flex;
          align-items: center;
          font-size: 14px;
          font-weight: 500;
        }

        /* Subtle divide for the settings if you choose to re-enable it later */
        .settings-footer {
          margin-top: 5rem;
          padding-top: 3rem;
          border-top: 2px dashed #e2e8f0;
        }

        @media (max-width: 640px) {
          .dashboard-header { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
          .title { font-size: 26px; }
          .section-card { padding: 20px; }
        }
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