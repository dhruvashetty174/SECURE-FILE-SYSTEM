import React, { useState, useEffect } from "react";

export default function Loader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3500); 
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const styleSheet = `
      @keyframes revealUp {
        0% { transform: translateY(30px); opacity: 0; }
        100% { transform: translateY(0); opacity: 1; }
      }
      @keyframes expandWidth {
        0% { width: 0%; left: 0; }
        50% { width: 70%; left: 15%; }
        100% { width: 0%; left: 100%; }
      }
      @keyframes subtleScale {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
      }
    `;
    const styleTag = document.createElement("style");
    styleTag.innerHTML = styleSheet;
    document.head.appendChild(styleTag);
    return () => document.head.removeChild(styleTag);
  }, []);

  if (!loading) return null; // Or return your home content here

  return (
    <div style={styles.loaderWrapper}>
      <div style={styles.logoBox}>
        <h1 style={styles.brandName}>Abyasa</h1>
        <br />
        <span style={styles.tagline}>software for learning</span>
      </div>
      <div style={styles.loadingBarContainer}>
        <div style={styles.loadingFill}></div>
      </div>
    </div>
  );
}

const styles = {
  loaderWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    fontFamily: "'Inter', 'Helvetica', sans-serif",
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },
  logoBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center", // Changed to center for better balance
    textAlign: "center",
  },
  brandName: {
    fontSize: "110px",
    fontWeight: 900,
    color: "#E84E0F",
    margin: 0,
    letterSpacing: "-5px",
    lineHeight: 1,
    animation: "revealUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards, subtleScale 3s infinite ease-in-out",
  },
  tagline: {
    fontSize: "24px",
    color: "#666",
    fontWeight: 400,
    letterSpacing: "2px",
    textTransform: "uppercase",
    marginTop: "10px",
    opacity: 0,
    animation: "revealUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards",
    animationDelay: "0.3s", // Staggered entrance
  },
  loadingBarContainer: {
    width: "280px",
    height: "4px", // Thinner looks more modern
    background: "#f0f0f0",
    borderRadius: "10px",
    marginTop: "60px",
    overflow: "hidden",
    position: "relative",
  },
  loadingFill: {
    height: "100%",
    background: "linear-gradient(90deg, #E84E0F, #ff7a45)",
    borderRadius: "10px",
    position: "absolute",
    animation: "expandWidth 2s infinite cubic-bezier(0.445, 0.05, 0.55, 0.95)",
  },
};