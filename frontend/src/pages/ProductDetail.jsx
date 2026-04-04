import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../utils/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { FiStar, FiShoppingCart, FiArrowLeft, FiPackage, FiTruck, FiShield } from "react-icons/fi";
import styles from "./ProductDetail.module.css";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product,  setProduct]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [qty,      setQty]      = useState(1);
  const [imgIdx,   setImgIdx]   = useState(0);
  const [tab,      setTab]      = useState("desc");
  const [review,   setReview]   = useState({ rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data.product);
      } catch (err) {
        toast.error("Product not found");
        navigate("/products");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleAddToCart = async () => {
    const ok = await addToCart(product._id, qty);
    if (ok && !user) navigate("/login");
  };

  const handleBuyNow = async () => {
    const ok = await addToCart(product._id, qty);
    if (ok) navigate("/checkout");
    else if (!user) navigate("/login");
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) return toast.error("Please login to review");
    setSubmitting(true);
    try {
      await api.post(`/products/${id}/reviews`, review);
      toast.success("Review submitted!");
      const { data } = await api.get(`/products/${id}`);
      setProduct(data.product);
      setReview({ rating: 5, comment: "" });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="spinner-wrap" style={{ minHeight: "70vh" }}><div className="spinner" /></div>;
  if (!product) return null;

  const discount = product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  return (
    <div className={`container ${styles.page}`}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link to="/">Home</Link> /
        <Link to="/products">Products</Link> /
        <Link to={`/products?category=${product.category}`}>{product.category}</Link> /
        <span>{product.name}</span>
      </div>

      <div className={styles.grid}>
        {/* ── Images ── */}
        <div className={styles.imgSection}>
          <div className={styles.mainImg}>
            <img
              src={product.images[imgIdx]?.url || "https://placehold.co/600x600/FFF0E8/E8520A?text=No+Image"}
              alt={product.name}
            />
            {discount > 0 && <span className={styles.discBadge}>{discount}% OFF</span>}
          </div>
          {product.images.length > 1 && (
            <div className={styles.thumbs}>
              {product.images.map((img, i) => (
                <button
                  key={i}
                  className={`${styles.thumb} ${i === imgIdx ? styles.thumbActive : ""}`}
                  onClick={() => setImgIdx(i)}
                >
                  <img src={img.url} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Info ── */}
        <div className={styles.info}>
          <p className={styles.brand}>{product.brand}</p>
          <h1 className={styles.name}>{product.name}</h1>

          {/* Rating */}
          <div className={styles.ratingRow}>
            <div className={styles.stars}>
              {[1,2,3,4,5].map((s) => (
                <FiStar key={s} size={16}
                  fill={s <= Math.round(product.rating) ? "#F5C842" : "none"}
                  stroke={s <= Math.round(product.rating) ? "#F5C842" : "#ccc"}
                />
              ))}
            </div>
            <span className={styles.ratingNum}>{product.rating?.toFixed(1)}</span>
            <span className={styles.ratingCount}>({product.numReviews} reviews)</span>
          </div>

          {/* Price */}
          <div className={styles.priceBox}>
            <span className={styles.price}>{fmt(product.price)}</span>
            {product.mrp > product.price && (
              <>
                <span className={styles.mrp}>{fmt(product.mrp)}</span>
                <span className={styles.save}>Save {fmt(product.mrp - product.price)}</span>
              </>
            )}
          </div>

          {/* Stock */}
          <div className={styles.stockRow}>
            {product.stock === 0 ? (
              <span className="badge badge-muted">Out of Stock</span>
            ) : product.stock < 5 ? (
              <span className="badge badge-saffron">⚠️ Only {product.stock} left</span>
            ) : (
              <span className="badge badge-green">✓ In Stock</span>
            )}
            <span className={styles.stockNum}>({product.stock} available)</span>
          </div>

          {/* Qty + Buttons */}
          {product.stock > 0 && (
            <>
              <div className={styles.qtyRow}>
                <span className={styles.qtyLabel}>Quantity:</span>
                <div className={styles.qtyControl}>
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                  <span>{qty}</span>
                  <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))}>+</button>
                </div>
              </div>
              <div className={styles.btnRow}>
                <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={handleAddToCart}>
                  <FiShoppingCart /> Add to Cart
                </button>
                <button className="btn btn-dark btn-lg" style={{ flex: 1 }} onClick={handleBuyNow}>
                  ⚡ Buy Now
                </button>
              </div>
            </>
          )}

          {/* Perks */}
          <div className={styles.perks}>
            <div className={styles.perk}><FiTruck size={18} /><span>Free delivery above ₹499</span></div>
            <div className={styles.perk}><FiPackage size={18} /><span>Easy 7-day returns</span></div>
            <div className={styles.perk}><FiShield size={18} /><span>100% genuine product</span></div>
          </div>

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className={styles.tags}>
              {product.tags.map((t) => (
                <Link key={t} to={`/products?keyword=${t}`} className={styles.tag}>#{t}</Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Tabs: Description & Reviews ── */}
      <div className={styles.tabs}>
        <div className={styles.tabBar}>
          {["desc","reviews"].map((t) => (
            <button key={t} className={`${styles.tabBtn} ${tab === t ? styles.tabActive : ""}`}
              onClick={() => setTab(t)}>
              {t === "desc" ? "Description" : `Reviews (${product.numReviews})`}
            </button>
          ))}
        </div>

        {tab === "desc" && (
          <div className={styles.tabContent}>
            <p className={styles.description}>{product.description}</p>
            <div className={styles.metaGrid}>
              {product.brand      && <MetaRow label="Brand"      val={product.brand} />}
              {product.subcategory && <MetaRow label="Type"      val={product.subcategory} />}
              {product.category   && <MetaRow label="Category"   val={product.category} />}
            </div>
          </div>
        )}

        {tab === "reviews" && (
          <div className={styles.tabContent}>
            {/* Review form */}
            {user && (
              <form onSubmit={submitReview} className={styles.reviewForm}>
                <h4>Write a Review</h4>
                <div className={styles.starPicker}>
                  {[1,2,3,4,5].map((s) => (
                    <button type="button" key={s}
                      className={styles.starPickBtn}
                      onClick={() => setReview((r) => ({ ...r, rating: s }))}
                    >
                      <FiStar size={22}
                        fill={s <= review.rating ? "#F5C842" : "none"}
                        stroke={s <= review.rating ? "#F5C842" : "#ccc"}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  placeholder="Share your experience with this product…"
                  className="form-input"
                  rows={3}
                  value={review.comment}
                  onChange={(e) => setReview((r) => ({ ...r, comment: e.target.value }))}
                  required
                />
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? "Submitting…" : "Submit Review"}
                </button>
              </form>
            )}

            {/* Reviews list */}
            {product.reviews.length === 0 ? (
              <p style={{ color: "var(--muted)", marginTop: "1rem" }}>No reviews yet. Be the first!</p>
            ) : (
              <div className={styles.reviewList}>
                {product.reviews.map((r) => (
                  <div key={r._id} className={styles.reviewCard}>
                    <div className={styles.reviewHead}>
                      <div className={styles.reviewAvatar}>{r.name[0]}</div>
                      <div>
                        <p className={styles.reviewName}>{r.name}</p>
                        <div className={styles.reviewStars}>
                          {[1,2,3,4,5].map((s) => (
                            <FiStar key={s} size={13}
                              fill={s <= r.rating ? "#F5C842" : "none"}
                              stroke={s <= r.rating ? "#F5C842" : "#ccc"}
                            />
                          ))}
                        </div>
                      </div>
                      <span className={styles.reviewDate}>{new Date(r.createdAt).toLocaleDateString("en-IN")}</span>
                    </div>
                    <p className={styles.reviewComment}>{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MetaRow({ label, val }) {
  return (
    <div style={{ display:"flex", gap:"0.5rem", fontSize:"0.875rem" }}>
      <span style={{ color:"var(--muted)", minWidth:90 }}>{label}:</span>
      <span style={{ fontWeight:600 }}>{val}</span>
    </div>
  );
}
