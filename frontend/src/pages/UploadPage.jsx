import React, { useState, useEffect } from "react";
import api from "../api";
import "./Styles/UploadPage.css";

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
      <style>{`  `}</style>

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
              <br/>
              or <br></br><span className="upload-link">browse your device</span>
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