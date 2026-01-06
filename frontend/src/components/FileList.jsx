import React, { useState } from "react";
import api from "../api";

export default function FileList({ files, onRefresh }) {
  const [visiblePasscodes, setVisiblePasscodes] = useState({});
  const [expiryAlert, setExpiryAlert] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const togglePasscode = (id) => {
    setVisiblePasscodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split(".").pop().toLowerCase();
    const icons = {
      pdf: "📕",
      doc: "📘",
      docx: "📘",
      xls: "📗",
      xlsx: "📗",
      png: "🖼️",
      jpg: "🖼️",
      jpeg: "🖼️",
      gif: "🖼️",
      mp4: "🎬",
      mov: "🎬",
      zip: "📦",
      rar: "📦",
    };
    return icons[ext] || "📄";
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
  };

  const handleLinkClick = (isExpired, url) => {
    if (isExpired) {
      setExpiryAlert(true);
      setTimeout(() => setExpiryAlert(false), 3000);
      return;
    }

    copyToClipboard(url);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  const onDelete = async (id) => {
    if (!confirm("Are you sure?")) return;
    try {
      await api.delete(`/files/${id}`);
      onRefresh?.();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const onSetPasscode = async (id) => {
    const passcode = prompt("Enter passcode:");
    if (!passcode) return;
    try {
      await api.post(`/files/${id}/rule`, {
        ruleType: "PASSCODE",
        passcode,
      });
      onRefresh?.();
    } catch (err) {
      alert("Failed to set passcode");
    }
  };

  const onReplace = async (id, file) => {
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    try {
      await api.post(`/files/${id}/replace`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onRefresh?.();
    } catch (err) {
      alert("Replace failed");
    }
  };

  const sortedFiles = [...files].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div className="file-container">
      {expiryAlert && <div className="expiry-toast">⚠️ Link Expired</div>}
      {copySuccess && (
        <div className="expiry-toast success-toast">
          ✅ Link Copied to Clipboard!
        </div>
      )}

      <style>{`
        .file-container { border: 2px solid #1a7ef2; border-radius: 12px; font-family: sans-serif; max-width: 950px; margin: 20px auto; position: relative; }
        .expiry-toast { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #fee2e2; color: #b91c1c; padding: 12px 24px; border-radius: 8px; border: 1px solid #f87171; font-weight: bold; z-index: 9999; animation: fadeInOut 3s forwards; }
        .success-toast { background: #dcfce7; color: #15803d; border-color: #86efac; }
        @keyframes fadeInOut { 0% { opacity: 0; transform: translate(-50%, -10px); } 10% { opacity: 1; transform: translate(-50%, 0); } 90% { opacity: 1; transform: translate(-50%, 0); } 100% { opacity: 0; transform: translate(-50%, -10px); } }
        .file-list { display: flex; flex-direction: column; gap: 12px; padding: 12px; }
        .file-card { display: flex; flex-direction: column; padding: 16px; background: #fff; border: 1px solid #eef0f2; border-radius: 12px; }
        .card-row { display: flex; justify-content: space-between; align-items: center; }
        .file-main { display: flex; align-items: center; gap: 16px; }
        .icon-wrapper { width: 40px; height: 40px; background: #f8fafc; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .file-name { font-weight: 600; color: #1e293b; }
        .status-badge { font-size: 10px; padding: 2px 8px; border-radius: 6px; margin-left: 8px; }
        .status-active { background: #dcfce7; color: #15803d; }
        .status-expired { background: #fee2e2; color: #b91c1c; }
        .file-actions { display: flex; gap: 8px; }
        .btn { padding: 8px 12px; font-size: 12px; border-radius: 8px; cursor: pointer; border: 1px solid #e2e8f0; background: #fff; }
        .btn-primary { background: #2563eb; color: #fff; border: none; }
        .btn-expired { background: #f1f5f9; color: #94a3b8; cursor: not-allowed; }
        .hidden-input { display: none; }
      `}</style>

      <div className="file-list">
        {sortedFiles.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b", fontWeight: "600" }}>
            📂 No files uploaded
          </div>
        )}

        {sortedFiles.map((f) => {
          const isExpired = f.expiry && new Date() > new Date(f.expiry);
          const downloadUrl = `${window.location.origin}/download/${f.publicLink || ""}`;
          const passcode = f.rules?.passcode || f.passcode;

          return (
            <div key={f._id} className="file-card">
              <div className="card-row">
                <div className="file-main">
                  <div className="icon-wrapper">{getFileIcon(f.fileName)}</div>
                  <div className="file-details">
                    <div className="file-name">{f.fileName}</div>
                    <span className={`status-badge ${isExpired ? "status-expired" : "status-active"}`}>
                      {isExpired ? "EXPIRED" : "ACTIVE"}
                    </span>
                  </div>
                </div>

                <div className="file-actions">
                  <button
                    className={`btn ${isExpired ? "btn-expired" : "btn-primary"}`}
                    onClick={() => handleLinkClick(isExpired, downloadUrl)}
                  >
                    🔗 Link
                  </button>

                  <button className="btn" onClick={() => onSetPasscode(f._id)}>
                    🔑 {passcode ? "Change" : "Passcode"}
                  </button>

                  <label className="btn">
                    🔄
                    <input type="file" className="hidden-input" onChange={(e) => onReplace(f._id, e.target.files[0])} />
                  </label>

                  <button className="btn" style={{ color: "red" }} onClick={() => onDelete(f._id)}>
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
