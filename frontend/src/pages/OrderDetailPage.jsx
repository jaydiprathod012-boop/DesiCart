// OrderDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";
import { FiPackage, FiCheck, FiTruck, FiHome } from "react-icons/fi";
import styles from "./OrderDetailPage.module.css";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const STATUS_STEPS = ["Pending", "Processing", "Shipped", "Delivered"];
const STATUS_COLOR = { Pending:"#F59E0B", Processing:"#3B82F6", Shipped:"#8B5CF6", Delivered:"#10B981", Cancelled:"#EF4444" };

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data.order);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <div className="spinner-wrap" style={{ minHeight:"70vh" }}><div className="spinner" /></div>;
  if (!order)  return <div className="empty-state"><h3>Order not found</h3><Link to="/dashboard" className="btn btn-primary" style={{ marginTop:"1rem" }}>My Orders</Link></div>;

  const stepIdx = order.orderStatus === "Cancelled" ? -1 : STATUS_STEPS.indexOf(order.orderStatus);

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.header}>
        <Link to="/dashboard" className="btn btn-outline btn-sm">← Back to Orders</Link>
        <div>
          <h1 className={styles.title}>Order #{order._id.slice(-8).toUpperCase()}</h1>
          <p className={styles.date}>{new Date(order.createdAt).toLocaleDateString("en-IN", { dateStyle: "long" })}</p>
        </div>
        <span className={styles.statusBadge} style={{ background: STATUS_COLOR[order.orderStatus] + "20", color: STATUS_COLOR[order.orderStatus] }}>
          {order.orderStatus}
        </span>
      </div>

      {/* Progress tracker */}
      {order.orderStatus !== "Cancelled" && (
        <div className={styles.progressWrap}>
          {STATUS_STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`${styles.progressStep} ${i <= stepIdx ? styles.progressDone : ""}`}>
                <div className={styles.progressCircle}>
                  {i < stepIdx ? <FiCheck size={14} /> : i === 0 ? <FiPackage size={14} /> : i === 2 ? <FiTruck size={14} /> : i === 3 ? <FiHome size={14} /> : <span>{i+1}</span>}
                </div>
                <span className={styles.progressLabel}>{s}</span>
              </div>
              {i < STATUS_STEPS.length - 1 && (
                <div className={`${styles.progressLine} ${i < stepIdx ? styles.progressLineDone : ""}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      <div className={styles.grid}>
        {/* Items */}
        <div className={styles.itemsSection}>
          <h3 className={styles.sectionTitle}>Items Ordered</h3>
          {order.orderItems.map((item, i) => (
            <div key={i} className={styles.item}>
              <img src={item.image} alt={item.name} className={styles.itemImg} />
              <div className={styles.itemInfo}>
                <p className={styles.itemName}>{item.name}</p>
                <p className={styles.itemQty}>Qty: {item.quantity} × {fmt(item.price)}</p>
              </div>
              <span className={styles.itemTotal}>{fmt(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        {/* Right panel */}
        <div className={styles.rightPanel}>
          {/* Shipping address */}
          <div className={styles.section}>
            <h4 className={styles.panelTitle}>📍 Delivery Address</h4>
            <p className={styles.addrText}>
              <strong>{order.shippingAddress.fullName}</strong><br />
              {order.shippingAddress.street}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.pincode}<br />
              📞 {order.shippingAddress.phone}
            </p>
          </div>

          {/* Price breakdown */}
          <div className={styles.section}>
            <h4 className={styles.panelTitle}>💰 Price Details</h4>
            {[
              ["Items Total", fmt(order.itemsPrice)],
              ["Tax (GST)",   fmt(order.taxPrice)],
              ["Shipping",    order.shippingPrice === 0 ? "FREE" : fmt(order.shippingPrice)],
            ].map(([l, v]) => (
              <div key={l} className={styles.priceRow}><span>{l}</span><span>{v}</span></div>
            ))}
            <div className={styles.divider} />
            <div className={styles.priceTotal}><span>Total Paid</span><span>{fmt(order.totalPrice)}</span></div>
          </div>

          {/* Payment info */}
          <div className={styles.section}>
            <h4 className={styles.panelTitle}>💳 Payment</h4>
            <p className={styles.addrText}>
              Method: <strong>{order.paymentMethod}</strong><br />
              Status: <strong style={{ color: order.isPaid ? "#10B981" : "#F59E0B" }}>{order.isPaid ? "Paid ✓" : "Pending"}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
