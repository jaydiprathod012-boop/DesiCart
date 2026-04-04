// LoginPage.jsx
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import styles from "./AuthPage.module.css";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [form,    setForm]    = useState({ email: "", password: "" });
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === "admin") setForm({ email: "admin@desicart.in", password: "admin123" });
    else                  setForm({ email: "user@desicart.in",  password: "user1234" });
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoRow}>
          <span className={styles.logoEmoji}>🛒</span>
          <span className={styles.logoText}>DesiCart</span>
        </div>
        <h1 className={styles.title}>Welcome back!</h1>
        <p className={styles.sub}>Login to continue shopping</p>

        {/* Demo buttons */}
        <div className={styles.demoRow}>
          <button className={styles.demoBtn} onClick={() => fillDemo("user")}>👤 Demo User</button>
          <button className={styles.demoBtn} onClick={() => fillDemo("admin")}>🔧 Demo Admin</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <div className={styles.inputWrap}>
              <FiMail className={styles.inputIcon} size={16} />
              <input type="email" className={`form-input ${styles.iconInput}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className={styles.inputWrap}>
              <FiLock className={styles.inputIcon} size={16} />
              <input type={showPw ? "text" : "password"}
                className={`form-input ${styles.iconInput}`}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(!showPw)}>
                {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? "Logging in…" : "Login"}
          </button>
        </form>

        <p className={styles.switch}>
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
