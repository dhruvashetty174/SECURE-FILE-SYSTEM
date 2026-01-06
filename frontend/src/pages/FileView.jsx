import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";

export default function FileView() {
  const { link } = useParams();
  const [info, setInfo] = useState(null);
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await api.get(`/../download/${link}`);
        setInfo(res.data);
      } catch (err) {
        setError(err.response?.data || "Invalid link");
      }
    };
    fetchInfo();
  }, [link]);

  const download = async () => {
    try {
      const res = await fetch(`${(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000")}/download/${link}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      if (!res.ok) {
        const txt = await res.text();
        setError(txt || "Download failed");
        return;
      }
      const blob = await res.blob();
      const disposition = res.headers.get("content-disposition") || "";
      const match = disposition.match(/filename="?([^\"]+)"?/);
      const filename = (match && match[1]) || `download-${link}`;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError("Download error");
    }
  };

  if (error) return <div className="container error">{String(error)}</div>;
  if (!info) return <div className="container loading-state">Checking link...</div>;

  const expiryDate = info?.expiry ? new Date(info.expiry) : null;
  const expired = info?.expired || (expiryDate && new Date() > expiryDate);

  return (
    <div className="container file-view-wrapper">
      <style>{`
        .file-view-wrapper { max-width: 600px; margin: 60px auto; font-family: 'Inter', sans-serif; padding: 0 20px; }
        .title { font-size: 26px; font-weight: 800; color: #111827; margin-bottom: 12px; }
        .muted { font-size: 13px; color: #6b7280; margin-bottom: 16px; }
        .form { display: flex; flex-direction: column; gap: 12px; margin-top: 20px; }
        .input { padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 10px; outline: none; font-size: 14px; }
        .input:focus { border-color: #1a7ef2; box-shadow: 0 0 0 3px rgba(26,126,242,0.1); }
        .btn-primary { background: #1a7ef2; color: white; border: none; padding: 12px; border-radius: 10px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
        .btn-primary:hover { background: #1565c0; }
        .loading-state { text-align: center; padding: 40px; color: #6b7280; font-weight: 500; }
        .error { background: #fee2e2; color: #dc2626; padding: 12px 16px; border-radius: 8px; font-size: 14px; margin-bottom: 16px; }
      `}</style>

      <h2 className="title">File Download</h2>
      {expiryDate && <div className="muted">Expires: {expiryDate.toLocaleString()} ({expired ? "Expired" : "Active"})</div>}

      {info.requiresPasscode ? (
        <div className="form">
          <p>This file requires a passcode ({info.ruleType})</p>
          <input className="input" value={passcode} onChange={(e) => setPasscode(e.target.value)} placeholder="Enter passcode" />
          <button className="btn-primary" onClick={download} disabled={expired}>Download</button>
        </div>
      ) : (
        <div>{expired ? <p>This link has expired.</p> : <p>Preparing download…</p>}</div>
      )}
    </div>
  );
}
