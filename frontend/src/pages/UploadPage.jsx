import React, { useState, useEffect } from "react";
import api from "../api";

export default function UploadForm({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false); // New success state
  const [isDragging, setIsDragging] = useState(false);

  // Automatically hide success message after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setError(null);
    setSuccess(false); // Hide success if user selects a new file
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const form = new FormData();
    form.append("file", file);

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await api.post("/files/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      setSuccess(true); // Trigger success message
      setFile(null);    // Clear the file from the input
      if (onUploaded) onUploaded();
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-wrapper">
      <style>{`
        /* ... existing styles ... */

        .success-message {
          background: #f0fff4;
          color: #2f855a;
          padding: 14px 18px;
          border-radius: 12px;
          margin-bottom: 24px;
          font-size: 14px;
          border-left: 5px solid #38a169;
          display: flex;
          align-items: center;
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Keep your existing styles below */
        .upload-wrapper { max-width: 550px; margin: 2rem auto; font-family: 'Inter', sans-serif; }
        .upload-form-advanced { background: #ffffff; padding: 2.5rem; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.05); border: 1px solid #f0f0f0; }
        .error { background: #fff5f5; color: #e03131; padding: 14px 18px; border-radius: 12px; margin-bottom: 24px; font-size: 14px; border-left: 5px solid #e03131; display: flex; align-items: center; }
        .dropzone { display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; border: 2px dashed ${isDragging ? '#1a7ef2' : '#cbd5e1'}; background: ${isDragging ? '#f0f7ff' : '#fafafa'}; border-radius: 16px; padding: 4rem 2rem; transition: all 0.3s ease; text-align: center; }
        .upload-icon { font-size: 52px; color: #1a7ef2; margin-bottom: 1.25rem; }
        .muted { color: #71717a; font-size: 14px; }
        .upload-link { color: #1a7ef2; font-weight: 700; text-decoration: underline; }
        .btn-primary { width: 100%; padding: 16px; background: #1a7ef2; color: #ffffff; border: none; border-radius: 14px; font-weight: 700; cursor: pointer; margin-top: 2rem; }
        .btn-primary:disabled { background: #e4e4e7; cursor: not-allowed; }
        .selected-file { margin-top: 2rem; display: flex; align-items: center; justify-content: space-between; padding: 1.25rem; background: #ffffff; border-radius: 14px; border: 1px solid #e4e4e7; }
        .btn-sm { background: #f4f4f5; border: none; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; }
      `}</style>

      <form
        onSubmit={onSubmit}
        className="upload-form-advanced"
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        {/* Success Alert */}
        {success && (
          <div className="success-message">
            ✅ File uploaded successfully!
          </div>
        )}

        {error && <div className="error">⚠️ {error}</div>}

        <label className="dropzone">
          <input
            type="file"
            hidden
            onChange={(e) => handleFile(e.target.files[0])}
          />
          <div className="dropzone-inner">
            <div className="upload-icon">☁️</div>
            <strong>Drag & drop your file here</strong>
            <span className="muted">
              or <span className="upload-link">browse your computer</span>
            </span>
          </div>
        </label>

        {file && (
          <div className="selected-file">
            <div className="file-info">
              <strong>{file.name}</strong>
              <div className="muted">
                {(file.size / 1024 / 1024).toFixed(2)} MB · Ready
              </div>
            </div>
            <button
              type="button"
              className="btn-sm"
              onClick={() => setFile(null)}
            >
              ✕
            </button>
          </div>
        )}

        <button
          className="btn-primary"
          type="submit"
          disabled={!file || loading}
        >
          {loading ? "Processing..." : `Confirm Upload`}
        </button>
      </form>
    </div>
  );
}