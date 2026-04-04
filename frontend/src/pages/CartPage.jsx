import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight } from "react-icons/fi";
import styles from "./CartPage.module.css";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export default function CartPage() {
  const { cartItems, totalPrice, totalItems, updateQuantity, removeFromCart, cartLoading } = useCart();
  const navigate = useNavigate();

  const tax      = Math.round(totalPrice * 0.18);
  const shipping = totalPrice > 499 ? 0 : 49;
  const grand    = totalPrice + tax + shipping;

  if (cartLoading) {
    return <div className="spinner-wrap" style={{ minHeight: "70vh" }}><div className="spinner" /></div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className={`container ${styles.page}`}>
        <div className="empty-state">
          <div style={{ fontSize: "5rem", marginBottom: "1rem" }}>🛒</div>
          <h3>Your cart is empty</h3>
          <p>Add some products to get started!</p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: "1.5rem" }}>
            <FiShoppingBag /> Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`container ${styles.page}`}>
      <h1 className={styles.title}>My Cart <span>({totalItems} items)</span></h1>

      <div className={styles.layout}>
        {/* ── Items ── */}
        <div className={styles.items}>
          {cartItems.map((item) => {
            const p = item.product;
            if (!p) return null;
            const imgUrl = p.images?.[0]?.url || "https://placehold.co/120x120/FFF0E8/E8520A?text=IMG";

            return (
              <div key={item._id} className={styles.cartItem}>
                <Link to={`/products/${p._id}`} className={styles.itemImg}>
                  <img src={imgUrl} alt={p.name} />
                </Link>
                <div className={styles.itemInfo}>
                  <Link to={`/products/${p._id}`} className={styles.itemName}>{p.name}</Link>
                  <p className={styles.itemPrice}>{fmt(item.price)}</p>
                  {p.stock < 5 && p.stock > 0 && (
                    <p className={styles.stockWarn}>⚠️ Only {p.stock} left in stock</p>
                  )}
                </div>
                <div className={styles.itemActions}>
                  <div className={styles.qtyControl}>
                    <button onClick={() => updateQuantity(p._id, item.quantity - 1)}
                      disabled={item.quantity <= 1}><FiMinus size={14} /></button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(p._id, item.quantity + 1)}
                      disabled={item.quantity >= p.stock}><FiPlus size={14} /></button>
                  </div>
                  <p className={styles.lineTotal}>{fmt(item.price * item.quantity)}</p>
                  <button className={styles.removeBtn} onClick={() => removeFromCart(p._id)}>
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Summary ── */}
        <div className={styles.summary}>
          <h3 className={styles.summaryTitle}>Order Summary</h3>
          <div className={styles.summaryRows}>
            <SummaryRow label="Items total"     val={fmt(totalPrice)} />
            <SummaryRow label={`Tax (GST 18%)`} val={fmt(tax)} />
            <SummaryRow
              label="Shipping"
              val={shipping === 0 ? "FREE 🎉" : fmt(shipping)}
              valColor={shipping === 0 ? "var(--forest)" : undefined}
            />
            {totalPrice <= 499 && (
              <p className={styles.freeShipNote}>
                Add {fmt(499 - totalPrice)} more for free shipping
              </p>
            )}
          </div>
          <div className={styles.divider} />
          <div className={styles.grandTotal}>
            <span>Total</span>
            <span>{fmt(grand)}</span>
          </div>
          <p className={styles.taxNote}>Inclusive of all taxes</p>

          <button
            className={`btn btn-primary btn-full btn-lg ${styles.checkoutBtn}`}
            onClick={() => navigate("/checkout")}
          >
            Proceed to Checkout <FiArrowRight />
          </button>
          <Link to="/products" className="btn btn-outline btn-full" style={{ marginTop: "0.5rem" }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, val, valColor }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", fontSize:"0.9rem", color:"var(--text-secondary)" }}>
      <span>{label}</span>
      <span style={{ fontWeight:600, color: valColor }}>{val}</span>
    </div>
  );
}
