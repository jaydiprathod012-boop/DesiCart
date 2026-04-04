import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={{ minHeight:"80vh", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"1rem", textAlign:"center", padding:"2rem" }}>
      <div style={{ fontSize:"6rem" }}>🔍</div>
      <h1 style={{ fontFamily:"var(--font-display)", fontSize:"3rem", color:"var(--dark)" }}>404</h1>
      <p style={{ fontSize:"1.1rem", color:"var(--muted)" }}>Oops! This page doesn't exist.</p>
      <Link to="/" className="btn btn-primary btn-lg" style={{ marginTop:"0.5rem" }}>← Go Home</Link>
    </div>
  );
}
