import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import toast from "react-hot-toast";
import styles from "./Admin.module.css";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const STATUS_OPTIONS = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
const STATUS_COLOR   = {
  Pending: "#F59E0B", Processing: "#3B82F6", Shipped: "#8B5CF6",
  Delivered: "#10B981", Cancelled: "#EF4444",
};

export default function AdminOrders() {
  const [orders,    setOrders]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [total,     setTotal]     = useState(0);
  const [page,      setPage]      = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [updating,  setUpdating]  = useState(null); // id being updated

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20, ...(statusFilter && { status: statusFilter }) });
      const { data } = await api.get(`/orders?${params}`);
      setOrders(data.orders);
      setTotal(data.total);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [page, statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order marked as ${newStatus}`);
      // Update locally for instant feedback
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
      );
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>🛍️ Orders</h1>
          <p className={styles.pageSub}>{total} total orders</p>
        </div>
        <Link to="/admin" className="btn btn-outline btn-sm">← Dashboard</Link>
      </div>

      {/* Filter bar */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        {["", ...STATUS_OPTIONS].map((s) => (
          <button
            key={s || "all"}
            className={`btn btn-sm ${statusFilter === s ? "btn-primary" : "btn-outline"}`}
            onClick={() => { setStatusFilter(s); setPage(1); }}
          >
            {s || "All Orders"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: "3rem" }}>📭</div>
          <h3>No orders found</h3>
        </div>
      ) : (
        <div className={styles.table}>
          <div className={`${styles.tableRow} ${styles.tableHead}`}>
            <span>Order ID</span>
            <span>Customer</span>
            <span>Items</span>
            <span>Total</span>
            <span>Payment</span>
            <span>Status</span>
            <span>Date</span>
          </div>
          {orders.map((order) => (
            <div key={order._id} className={styles.tableRow}>
              <Link to={`/orders/${order._id}`} className={styles.monoId} style={{ color: "var(--saffron)" }}>
                #{order._id.slice(-8).toUpperCase()}
              </Link>
              <span>
                <p style={{ fontWeight: 600, fontSize: "0.875rem" }}>{order.user?.name || "—"}</p>
                <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{order.user?.email}</p>
              </span>
              <span style={{ fontSize: "0.85rem" }}>{order.orderItems?.length} item(s)</span>
              <span><strong>{fmt(order.totalPrice)}</strong></span>
              <span>
                <span className={styles.statusPill}
                  style={{ background: order.isPaid ? "#EDF7ED" : "#FEF3C7", color: order.isPaid ? "#10B981" : "#F59E0B" }}>
                  {order.paymentMethod} · {order.isPaid ? "Paid" : "Unpaid"}
                </span>
              </span>
              <span>
                <select
                  value={order.orderStatus}
                  disabled={updating === order._id}
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  className={styles.statusSelect}
                  style={{ borderColor: STATUS_COLOR[order.orderStatus], color: STATUS_COLOR[order.orderStatus] }}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </span>
              <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                {new Date(order.createdAt).toLocaleDateString("en-IN")}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="pagination" style={{ marginTop: "1.5rem" }}>
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>‹</button>
          {Array.from({ length: Math.ceil(total / 20) }, (_, i) => i + 1).map((n) => (
            <button key={n} className={page === n ? "active" : ""} onClick={() => setPage(n)}>{n}</button>
          ))}
          <button disabled={page === Math.ceil(total / 20)} onClick={() => setPage((p) => p + 1)}>›</button>
        </div>
      )}
    </div>
  );
}
