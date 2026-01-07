import React, { useState } from "react";
import api from "../api";
import "./Styles/FileList.css";

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
