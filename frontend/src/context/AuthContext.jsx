/**
 * AuthContext
 * Global authentication state — user info, login/logout, token management
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Initialise from localStorage on mount ──────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem("desicart_user");
    const token  = localStorage.getItem("desicart_token");
    if (stored && token) {
      try { setUser(JSON.parse(stored)); }
      catch { localStorage.clear(); }
    }
    setLoading(false);
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("desicart_token", data.token);
    localStorage.setItem("desicart_user",  JSON.stringify(data.user));
    setUser(data.user);
    toast.success(`Welcome back, ${data.user.name.split(" ")[0]}! 👋`);
    return data.user;
  }, []);

  // ── Register ───────────────────────────────────────────────────────────────
  const register = useCallback(async (name, email, password, phone) => {
    const { data } = await api.post("/auth/register", { name, email, password, phone });
    localStorage.setItem("desicart_token", data.token);
    localStorage.setItem("desicart_user",  JSON.stringify(data.user));
    setUser(data.user);
    toast.success("Account created successfully! 🎉");
    return data.user;
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem("desicart_token");
    localStorage.removeItem("desicart_user");
    setUser(null);
    toast.success("Logged out successfully");
  }, []);

  // ── Update profile locally ─────────────────────────────────────────────────
  const updateUser = useCallback((updatedUser) => {
    localStorage.setItem("desicart_user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  }, []);

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
