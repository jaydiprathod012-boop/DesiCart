import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";
import { FiCreditCard, FiTruck, FiCheck } from "react-icons/fi";
import styles from "./CheckoutPage.module.css";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const INITIAL_ADDRESS = { fullName: "", phone: "", street: "", city: "", state: "", pincode: "" };

export default function CheckoutPage() {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step,        setStep]        = useState(1); // 1=address, 2=payment
  const [address,     setAddress]     = useState(INITIAL_ADDRESS);
  const [payMethod,   setPayMethod]   = useState("Razorpay");
  const [processing,  setProcessing]  = useState(false);

  const tax      = Math.round(totalPrice * 0.18);
  const shipping = totalPrice > 499 ? 0 : 49;
  const grand    = totalPrice + tax + shipping;

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    const { fullName, phone, street, city, state, pincode } = address;
    if (!fullName || !phone || !street || !city || !state || !pincode) {
      return toast.error("Please fill all address fields");
    }
    if (!/^\d{10}$/.test(phone)) return toast.error("Enter a valid 10-digit phone number");
    if (!/^\d{6}$/.test(pincode)) return toast.error("Enter a valid 6-digit pincode");
    setStep(2);
  };

  const placeOrder = async (paymentResult = null) => {
    setProcessing(true);
    try {
      const orderItems = cartItems.map((item) => ({
        product:  item.product._id,
        name:     item.product.name,
        image:    item.product.images?.[0]?.url || "",
        price:    item.price,
        quantity: item.quantity,
      }));

      const { data } = await api.post("/orders", {
        orderItems,
        shippingAddress: address,
        paymentMethod:   payMethod,
      });

      // If payment result exists (Razorpay), mark order as paid
      if (paymentResult) {
        await api.put(`/orders/${data.order._id}/pay`, { paymentResult });
      }

      await clearCart();
      toast.success("Order placed successfully! 🎉");
      navigate(`/orders/${data.order._id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleRazorpay = async () => {
    setProcessing(true);
    try {
      // Step 1: Create Razorpay order
      const { data } = await api.post("/payment/create-order", { amount: grand });
      const { order, key } = data;

      // Step 2: Open Razorpay checkout
      const options = {
        key,
        amount:      order.amount,
        currency:    "INR",
        name:        "DesiCart",
        description: "Order Payment",
        order_id:    order.id,
        prefill: {
          name:    user.name,
          email:   user.email,
          contact: user.phone || address.phone,
        },
        theme: { color: "#E8520A" },
        handler: async (response) => {
          // Step 3: Verify payment on backend
          try {
            await api.post("/payment/verify", response);
            const paymentResult = {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              status:              "completed",
              update_time:         new Date().toISOString(),
            };
            await placeOrder(paymentResult);
          } catch (err) {
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        modal: { ondismiss: () => { setProcessing(false); toast("Payment cancelled"); } },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.message);
      setProcessing(false);
    }
  };

  const handleCOD = () => placeOrder(null);

  if (cartItems.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className={`container ${styles.page}`}>
      <h1 className={styles.title}>Checkout</h1>

      {/* Step indicator */}
      <div className={styles.steps}>
        {[["1", "Delivery Address", FiTruck], ["2", "Payment", FiCreditCard]].map(([num, label, Icon], i) => (
          <React.Fragment key={num}>
            <div className={`${styles.step} ${step >= Number(num) ? styles.stepActive : ""}`}>
              <div className={styles.stepCircle}>
                {step > Number(num) ? <FiCheck size={16} /> : <Icon size={16} />}
              </div>
              <span>{label}</span>
            </div>
            {i < 1 && <div className={`${styles.stepLine} ${step > 1 ? styles.stepLineDone : ""}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className={styles.layout}>
        {/* ── Left panel ── */}
        <div className={styles.left}>
          {/* Step 1: Address */}
          {step === 1 && (
            <form onSubmit={handleAddressSubmit} className={styles.section}>
              <h2 className={styles.sectionTitle}>📍 Delivery Address</h2>
              <div className={styles.formGrid}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" placeholder="Ravi Kumar" value={address.fullName}
                    onChange={(e) => setAddress({ ...address, fullName: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input className="form-input" placeholder="9876543210" maxLength={10} value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })} />
                </div>
                <div className="form-group" style={{ gridColumn: "1/-1" }}>
                  <label className="form-label">Street / House No. / Area *</label>
                  <input className="form-input" placeholder="Plot 42, Shivaji Nagar" value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input className="form-input" placeholder="Nagpur" value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">State *</label>
                  <input className="form-input" placeholder="Maharashtra" value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Pincode *</label>
                  <input className="form-input" placeholder="440001" maxLength={6} value={address.pincode}
                    onChange={(e) => setAddress({ ...address, pincode: e.target.value })} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: "1rem" }}>
                Continue to Payment →
              </button>
            </form>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>💳 Payment Method</h2>

              {/* Delivery summary */}
              <div className={styles.addrSummary}>
                <p className={styles.addrLabel}>Delivering to:</p>
                <p className={styles.addrText}>
                  <strong>{address.fullName}</strong> · {address.phone}<br />
                  {address.street}, {address.city}, {address.state} – {address.pincode}
                </p>
                <button className={styles.changeBtn} onClick={() => setStep(1)}>Change</button>
              </div>

              {/* Payment options */}
              <div className={styles.payOptions}>
                {[
                  { val: "Razorpay", label: "💳 Pay Online", sub: "UPI, Cards, Net Banking via Razorpay (Test Mode)" },
                  { val: "COD",      label: "💵 Cash on Delivery", sub: "Pay when your order arrives" },
                ].map(({ val, label, sub }) => (
                  <label key={val} className={`${styles.payOption} ${payMethod === val ? styles.paySelected : ""}`}>
                    <input type="radio" name="payment" value={val} checked={payMethod === val}
                      onChange={() => setPayMethod(val)} />
                    <div>
                      <p className={styles.payLabel}>{label}</p>
                      <p className={styles.paySub}>{sub}</p>
                    </div>
                  </label>
                ))}
              </div>

              {payMethod === "Razorpay" && (
                <div className={styles.razorNote}>
                  🔒 <strong>Test Mode:</strong> Use card <code>4111 1111 1111 1111</code>, any future expiry, CVV <code>123</code>
                </div>
              )}

              <div className={styles.payBtns}>
                <button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={payMethod === "Razorpay" ? handleRazorpay : handleCOD}
                  disabled={processing}
                >
                  {processing ? "Processing…" : payMethod === "COD" ? "Place Order (COD)" : `Pay ${fmt(grand)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Order summary ── */}
        <div className={styles.summary}>
          <h3 className={styles.summaryTitle}>Order Summary</h3>
          <div className={styles.summaryItems}>
            {cartItems.map((item) => (
              <div key={item._id} className={styles.summaryItem}>
                <img
                  src={item.product?.images?.[0]?.url || ""}
                  alt={item.product?.name}
                  className={styles.summaryImg}
                />
                <div className={styles.summaryItemInfo}>
                  <p className={styles.summaryItemName}>{item.product?.name}</p>
                  <p className={styles.summaryItemQty}>Qty: {item.quantity}</p>
                </div>
                <span className={styles.summaryItemPrice}>{fmt(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className={styles.summaryDivider} />
          {[["Items", fmt(totalPrice)], ["GST (18%)", fmt(tax)], ["Shipping", shipping === 0 ? "FREE" : fmt(shipping)]].map(([l, v]) => (
            <div key={l} className={styles.summaryRow}><span>{l}</span><span>{v}</span></div>
          ))}
          <div className={styles.summaryDivider} />
          <div className={styles.summaryGrand}><span>Total</span><span>{fmt(grand)}</span></div>
        </div>
      </div>
    </div>
  );
}
