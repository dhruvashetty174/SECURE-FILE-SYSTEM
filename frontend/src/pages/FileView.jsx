import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import "./Styles/FileView.css";

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
