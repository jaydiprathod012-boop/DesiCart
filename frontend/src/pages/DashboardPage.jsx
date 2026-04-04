import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";
import { FiPackage, FiUser, FiEdit2, FiChevronRight } from "react-icons/fi";
import styles from "./DashboardPage.module.css";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const STATUS_COLOR = {
  Pending:    "#F59E0B", Processing: "#3B82F6", Shipped: "#8B5CF6",
  Delivered:  "#10B981", Cancelled:  "#EF4444",
};

export default function DashboardPage() {
  const { user, updateUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [tab,     setTab]    = useState(searchParams.get("tab") || "orders");
  const [orders,  setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get("/orders/my");
        setOrders(data.orders);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put("/auth/profile", profile);
      updateUser(data.user);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.header}>
        <div className={styles.avatarBig}>{user?.name?.[0]?.toUpperCase()}</div>
        <div>
          <h1 className={styles.name}>{user?.name}</h1>
          <p className={styles.email}>{user?.email}</p>
          {user?.role === "admin" && <span className="badge badge-saffron">Admin</span>}
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {[["orders","📦 My Orders", FiPackage], ["profile","👤 Profile", FiUser]].map(([val, label]) => (
          <button key={val} className={`${styles.tabBtn} ${tab === val ? styles.tabActive : ""}`}
            onClick={() => setTab(val)}>
            {label}
          </button>
        ))}
        {user?.role === "admin" && (
          <Link to="/admin" className={`${styles.tabBtn}`}>⚙️ Admin Panel</Link>
        )}
      </div>

      {/* Orders Tab */}
      {tab === "orders" && (
        <div>
          {loading ? (
            <div className="spinner-wrap"><div className="spinner" /></div>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize:"3rem" }}>📦</div>
              <h3>No orders yet</h3>
              <p>Your orders will appear here once you place one.</p>
              <Link to="/products" className="btn btn-primary" style={{ marginTop:"1rem" }}>Start Shopping</Link>
            </div>
          ) : (
            <div className={styles.orderList}>
              {orders.map((order) => (
                <Link to={`/orders/${order._id}`} key={order._id} className={styles.orderCard}>
                  <div className={styles.orderTop}>
                    <div>
                      <p className={styles.orderId}>Order #{order._id.slice(-8).toUpperCase()}</p>
                      <p className={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" })}</p>
                    </div>
                    <div className={styles.orderRight}>
                      <span className={styles.orderTotal}>{fmt(order.totalPrice)}</span>
                      <span className={styles.orderStatus} style={{ background: STATUS_COLOR[order.orderStatus] + "20", color: STATUS_COLOR[order.orderStatus] }}>
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>
                  <div className={styles.orderItems}>
                    {order.orderItems.slice(0, 3).map((item, i) => (
                      <img key={i} src={item.image} alt={item.name} className={styles.orderThumb} />
                    ))}
                    {order.orderItems.length > 3 && (
                      <span className={styles.moreItems}>+{order.orderItems.length - 3}</span>
                    )}
                    <FiChevronRight size={18} style={{ marginLeft:"auto", color:"var(--muted)" }} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Profile Tab */}
      {tab === "profile" && (
        <div className={styles.profileCard}>
          <h3 className={styles.profileTitle}><FiEdit2 size={18} /> Edit Profile</h3>
          <form onSubmit={handleProfileSave} className={styles.profileForm}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Email (cannot change)</label>
              <input className="form-input" value={user?.email} disabled style={{ opacity: 0.6 }} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" placeholder="9876543210" maxLength={10}
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
