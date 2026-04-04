import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff } from "react-icons/fi";
import styles from "./AuthPage.module.css";

export default function SignupPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form,    setForm]    = useState({ name: "", email: "", password: "", phone: "" });
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters");
    if (form.phone && !/^\d{10}$/.test(form.phone)) return toast.error("Enter a valid 10-digit phone");
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.phone);
      navigate("/");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoRow}>
          <span className={styles.logoEmoji}>🛒</span>
          <span className={styles.logoText}>DesiCart</span>
        </div>
        <h1 className={styles.title}>Create account</h1>
        <p className={styles.sub}>Join 50,000+ happy shoppers today</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {[
            { key:"name",     Icon: FiUser,  type:"text",     placeholder:"Ravi Kumar",        label:"Full Name" },
            { key:"email",    Icon: FiMail,  type:"email",    placeholder:"you@example.com",   label:"Email" },
            { key:"phone",    Icon: FiPhone, type:"tel",      placeholder:"9876543210",         label:"Phone (optional)", max:10 },
          ].map(({ key, Icon, type, placeholder, label, max }) => (
            <div className="form-group" key={key}>
              <label className="form-label">{label}</label>
              <div className={styles.inputWrap}>
                <Icon className={styles.inputIcon} size={16} />
                <input type={type} className={`form-input ${styles.iconInput}`}
                  placeholder={placeholder} maxLength={max}
                  value={form[key]} onChange={set(key)}
                  required={key !== "phone"} />
              </div>
            </div>
          ))}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className={styles.inputWrap}>
              <FiLock className={styles.inputIcon} size={16} />
              <input type={showPw ? "text" : "password"}
                className={`form-input ${styles.iconInput}`}
                placeholder="Min. 6 characters"
                value={form.password} onChange={set("password")} required />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(!showPw)}>
                {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className={styles.switch}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
