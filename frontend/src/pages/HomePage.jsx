import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import ProductCard from "../components/common/ProductCard";
import styles from "./HomePage.module.css";

const CATEGORIES = [
  { name: "Clothing",             emoji: "👗", color: "#FFF0E8" },
  { name: "Electronics",          emoji: "📱", color: "#E8F4FD" },
  { name: "Food & Grocery",       emoji: "🌾", color: "#EDF7ED" },
  { name: "Home & Kitchen",       emoji: "🏠", color: "#FDF3E8" },
  { name: "Beauty & Personal Care", emoji: "✨", color: "#FCE8F4" },
  { name: "Sports & Fitness",     emoji: "🏋️", color: "#E8EDF7" },
  { name: "Books",                emoji: "📚", color: "#F7F0E8" },
  { name: "Jewellery",            emoji: "💍", color: "#FDF8E8" },
];

const formatPrice = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export default function HomePage() {
  const [featured, setFeatured]     = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [searchQ, setSearchQ]       = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featRes, newRes] = await Promise.all([
          api.get("/products?featured=true&limit=8"),
          api.get("/products?sort=newest&limit=8"),
        ]);
        setFeatured(featRes.data.products);
        setNewArrivals(newRes.data.products);
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim()) navigate(`/products?keyword=${encodeURIComponent(searchQ.trim())}`);
  };

  return (
    <div className="fade-in">
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <div className={styles.heroOrb1} />
          <div className={styles.heroOrb2} />
          <div className={styles.heroPattern} />
        </div>
        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroText}>
            <span className={styles.heroPill}>🇮🇳 Made for India, Made with Love</span>
            <h1 className={styles.heroTitle}>
              Shop the <span>Best of Bharat</span><br />— Dil Se
            </h1>
            <p className={styles.heroSub}>
              From Banarasi silks to boAt headphones — explore lakhs of products with the best prices, fast delivery, and easy returns.
            </p>
            <form onSubmit={handleSearch} className={styles.heroSearch}>
              <input
                type="text"
                placeholder="Search for sarees, mobiles, dal…"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                className={styles.heroInput}
              />
              <button type="submit" className={`btn btn-primary ${styles.heroSearchBtn}`}>
                🔍 Search
              </button>
            </form>
            <div className={styles.heroCtas}>
              <Link to="/products" className="btn btn-primary btn-lg">Shop Now →</Link>
              <Link to="/products?featured=true" className="btn btn-outline btn-lg">Featured Picks</Link>
            </div>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.stat}><span>10k+</span><p>Products</p></div>
            <div className={styles.stat}><span>50k+</span><p>Happy Customers</p></div>
            <div className={styles.stat}><span>100%</span><p>Secure Checkout</p></div>
          </div>
        </div>
      </section>

      {/* ── Trust bar ─────────────────────────────────────────── */}
      <div className={styles.trustBar}>
        <div className="container">
          <div className={styles.trustGrid}>
            <div className={styles.trust}><span>🚚</span> Free Shipping above ₹499</div>
            <div className={styles.trust}><span>🔒</span> 100% Secure Payments</div>
            <div className={styles.trust}><span>↩️</span> Easy 7-Day Returns</div>
            <div className={styles.trust}><span>🇮🇳</span> Made in India Products</div>
          </div>
        </div>
      </div>

      {/* ── Categories ────────────────────────────────────────── */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHead}>
            <h2 className="section-title">Shop by <span>Category</span></h2>
            <Link to="/products" className="btn btn-outline btn-sm">View All</Link>
          </div>
          <div className={styles.catGrid}>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                to={`/products?category=${encodeURIComponent(cat.name)}`}
                className={styles.catCard}
                style={{ "--cat-bg": cat.color }}
              >
                <span className={styles.catEmoji}>{cat.emoji}</span>
                <span className={styles.catName}>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ──────────────────────────────────── */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHead}>
            <div>
              <h2 className="section-title">⭐ Featured <span>Picks</span></h2>
              <p className="section-subtitle">Hand-curated products loved by our customers</p>
            </div>
            <Link to="/products?featured=true" className="btn btn-outline btn-sm">See All</Link>
          </div>
          {loading ? (
            <div className="spinner-wrap"><div className="spinner" /></div>
          ) : (
            <div className="products-grid">
              {featured.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── Promo Banner ───────────────────────────────────────── */}
      <section className={styles.promoBanner}>
        <div className="container">
          <div className={styles.promoGrid}>
            <div className={`${styles.promoCard} ${styles.promoMain}`}>
              <p className={styles.promoLabel}>🔥 Flash Sale</p>
              <h3>Electronics Up to<br /><span>60% OFF</span></h3>
              <Link to="/products?category=Electronics" className="btn btn-primary">Shop Electronics</Link>
            </div>
            <div className={`${styles.promoCard} ${styles.promoSub}`}>
              <p className={styles.promoLabel}>🌿 Ethnic Wear</p>
              <h3>Sarees & Kurtas<br /><span>Starting ₹499</span></h3>
              <Link to="/products?category=Clothing" className="btn btn-dark">Explore Now</Link>
            </div>
            <div className={`${styles.promoCard} ${styles.promoTert}`}>
              <p className={styles.promoLabel}>✨ Beauty & Skin</p>
              <h3>Natural Products<br /><span>Toxin Free</span></h3>
              <Link to="/products?category=Beauty+%26+Personal+Care" className="btn btn-dark">Shop Beauty</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── New Arrivals ───────────────────────────────────────── */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHead}>
            <div>
              <h2 className="section-title">🆕 New <span>Arrivals</span></h2>
              <p className="section-subtitle">Fresh stock added this week</p>
            </div>
            <Link to="/products?sort=newest" className="btn btn-outline btn-sm">View More</Link>
          </div>
          {loading ? (
            <div className="spinner-wrap"><div className="spinner" /></div>
          ) : (
            <div className="products-grid">
              {newArrivals.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── App CTA ────────────────────────────────────────────── */}
      <section className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaBox}>
            <div>
              <h2>Start Shopping Today</h2>
              <p>Join 50,000+ happy shoppers. Free signup, no hidden charges.</p>
            </div>
            <div className={styles.ctaBtns}>
              <Link to="/signup" className="btn btn-primary btn-lg">Create Account</Link>
              <Link to="/products" className="btn btn-outline btn-lg" style={{ borderColor: "rgba(255,255,255,0.4)", color: "#fff" }}>Browse Products</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
