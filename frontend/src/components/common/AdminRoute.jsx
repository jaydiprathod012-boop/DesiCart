// AdminRoute.jsx — Redirect to home if not admin
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminRoute() {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="spinner-wrap" style={{ minHeight: "60vh" }}>
        <div className="spinner" />
      </div>
    );
  }

  return user && isAdmin
    ? <Outlet />
    : <Navigate to="/" replace />;
}
