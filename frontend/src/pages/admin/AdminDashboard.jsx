import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import { FiPackage, FiShoppingBag, FiUsers, FiDollarSign, FiPlusCircle } from "react-icons/fi";
import styles from "./Admin.module.css";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export default function AdminDashboard() {
  const [stats,   setStats]   = useState({ orders:0, products:0, users:0, revenue:0 });
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordRes, prodRes, userRes] = await Promise.all([
          api.get("/orders?limit=5"),
          api.get("/products?limit=1"),
          api.get("/auth/users"),
        ]);
        const revenue = ordRes.data.orders.reduce((acc, o) => acc + (o.isPaid ? o.totalPrice : 0), 0);
        setStats({
          orders:   ordRes.data.total,
          products: prodRes.data.total,
          users:    userRes.data.count,
          revenue,
        });
        setOrders(ordRes.data.orders);
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className={styles.statCard} style={{ "--stat-color": color }}>
      <div className={styles.statIcon}><Icon size={22} /></div>
      <div><p className={styles.statValue}>{value}</p><p className={styles.statLabel}>{label}</p></div>
    </div>
  );

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>⚙️ Admin Dashboard</h1>
          <p className={styles.pageSub}>Manage your DesiCart store</p>
        </div>
        <div style={{ display:"flex", gap:"0.75rem" }}>
          <Link to="/admin/products" className="btn btn-outline btn-sm"><FiPackage /> Products</Link>
          <Link to="/admin/orders"   className="btn btn-primary btn-sm"><FiShoppingBag /> Orders</Link>
        </div>
      </div>

      {loading ? <div className="spinner-wrap"><div className="spinner" /></div> : (
        <>
          {/* Stats */}
          <div className={styles.statsGrid}>
            <StatCard icon={FiShoppingBag} label="Total Orders"   value={stats.orders}   color="var(--saffron)" />
            <StatCard icon={FiPackage}     label="Total Products"  value={stats.products} color="var(--forest)" />
            <StatCard icon={FiUsers}       label="Total Users"     value={stats.users}    color="#8B5CF6" />
            <StatCard icon={FiDollarSign}  label="Revenue (paid)"  value={fmt(stats.revenue)} color="#10B981" />
          </div>

          {/* Recent orders */}
          <div className={styles.section}>
            <div className={styles.sectionHead}>
              <h3 className={styles.sectionTitle}>Recent Orders</h3>
              <Link to="/admin/orders" className="btn btn-outline btn-sm">View All</Link>
            </div>
            <div className={styles.table}>
              <div className={`${styles.tableRow} ${styles.tableHead}`}>
                <span>Order ID</span><span>Customer</span><span>Total</span><span>Status</span><span>Date</span>
              </div>
              {orders.map((order) => (
                <Link to={`/orders/${order._id}`} key={order._id} className={styles.tableRow}>
                  <span className={styles.monoId}>#{order._id.slice(-6).toUpperCase()}</span>
                  <span>{order.user?.name || "—"}</span>
                  <span>{fmt(order.totalPrice)}</span>
                  <span>
                    <span className={styles.statusPill} style={{ background: order.isPaid ? "#EDF7ED" : "#FEF3C7", color: order.isPaid ? "#10B981" : "#F59E0B" }}>
                      {order.orderStatus}
                    </span>
                  </span>
                  <span>{new Date(order.createdAt).toLocaleDateString("en-IN")}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Quick Actions</h3>
            <div className={styles.quickActions}>
              <Link to="/admin/products" className={styles.quickCard}>
                <FiPlusCircle size={28} />
                <span>Add New Product</span>
              </Link>
              <Link to="/admin/orders" className={styles.quickCard}>
                <FiShoppingBag size={28} />
                <span>Manage Orders</span>
              </Link>
              <Link to="/admin/products" className={styles.quickCard}>
                <FiPackage size={28} />
                <span>View Inventory</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
