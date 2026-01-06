import React, { useState } from "react";
import api from "../api";

export default function UploadForm({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // UI-only state to handle drag hover effects
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (f) => {
    if (!f) return;
    setFile(f);
    setError(null);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files[0]);
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
    try {
      await api.post("/files/upload", form, { 
        headers: { "Content-Type": "multipart/form-data" } 
      });
      setFile(null);
      onUploaded && onUploaded();
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <style>{`
        .upload-container {
        
          max-width: 550px;
          margin: 1.5rem auto;
          font-family: 'Inter', -apple-system, sans-serif;
        }

        .upload-card {
          background: #ffffff;
          padding: 2rem;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          border: 1px solid #f0f0f0;
        }

        .error-message {
          background: #fff5f5;
          color: #e03131;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 14px;
          border-left: 4px solid #e03131;
        }

        /* Hides default browser "Choose File" UI */
        .hidden-input {
          display: none;
        }

        .drop-zone {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: 2px dashed ${isDragging ? '#1a7ef2' : '#e2e8f0'};
          background: ${isDragging ? '#f0f7ff' : '#fafafa'};
          border-radius: 12px;
          padding: 3rem 1rem;
          transition: all 0.2s ease-in-out;
          text-align: center;
        }

        .drop-zone:hover {
          border-color: #1a7ef2;
          background: #f8fbff;
        }

        .upload-icon {
          font-size: 40px;
          color: #1a7ef2;
          margin-bottom: 1rem;
          opacity: 0.8;
        }

        .drop-zone-text {
          display: block;
          font-size: 16px;
          color: #111827;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .muted-text {
          color: #6b7280;
          font-size: 14px;
        }

        .browse-link {
          color: #1a7ef2;
          font-weight: 700;
          text-decoration: underline;
        }

        /* Selected File Preview */
        .file-preview {
          margin-top: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: #f8fafc;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .file-info strong {
          font-size: 14px;
          color: #334155;
          display: block;
          max-width: 250px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .remove-file {
          background: #fff;
          border: 1px solid #e2e8f0;
          color: #94a3b8;
          width: 26px;
          height: 26px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .remove-file:hover {
          background: #fee2e2;
          color: #ef4444;
          border-color: #fecaca;
        }

        .submit-btn {
          width: 100%;
          padding: 14px;
          background: #1a7ef2;
          color: #ffffff;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          margin-top: 1.5rem;
          transition: background 0.2s;
        }

        .submit-btn:hover:not(:disabled) {
          background: #1565c0;
        }

        .submit-btn:disabled {
          background: #cbd5e1;
          cursor: not-allowed;
        }
      `}</style>

      <form 
        onSubmit={onSubmit} 
        className="upload-card"
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        {error && <div className="error-message">{error}</div>}

        {/* This label serves as the visible upload area */}
        <label className="drop-zone">
          <input 
            type="file" 
            className="hidden-input" 
            onChange={(e) => handleFileChange(e.target.files[0])} 
          />
          <div className="upload-icon">☁️</div>
          <span className="drop-zone-text">Drag & drop your file here</span>
          <span className="muted-text">
            or <span className="browse-link">browse your files</span>
          </span>
          <small className="muted-text" style={{marginTop: '10px', display: 'block', opacity: 0.6}}>
            Max size: 10MB (JPG, PNG, PDF)
          </small>
        </label>

        {file && (
          <div className="file-preview">
            <div className="file-info">
              <strong>{file.name}</strong>
              <div className="muted-text" style={{fontSize: '12px'}}>
                {(file.size / 1024 / 1024).toFixed(2)} MB · Ready to upload
              </div>
            </div>
            <button 
              type="button" 
              className="remove-file" 
              onClick={() => setFile(null)}
            >
              ✕
            </button>
          </div>
        )}

        <button 
          className="submit-btn" 
          type="submit" 
          disabled={!file || loading}
        >
          {loading ? "Uploading…" : `Upload ${file ? "1 File" : ""}`}
        </button>
      </form>
    </div>
  );
}