import React from "react";
import { Link } from "react-router-dom";
import { FiInstagram, FiTwitter, FiFacebook, FiMail, FiPhone, FiMapPin, FiLinkedin } from "react-icons/fi";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.brand}>
          <div className={styles.logo}>🛒 DesiCart</div>
          <p className={styles.tagline}>
            Dil se shopping — India's favourite online marketplace for authentic, quality products.
          </p>
          <div className={styles.socials}>
  <a href="https://instagram.com/im_jayy_100" target="_blank" aria-label="Instagram">
    <FiInstagram />
  </a>
  <a href="https://linkedin.com/in/jaydiptech2005" target="_blank" aria-label="LinkedIn">
    <FiLinkedin />
  </a>
</div>
        </div>

        <div className={styles.col}>
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          <Link to="/products">Shop</Link>
          <Link to="/products?category=Clothing">Clothing</Link>
          <Link to="/products?category=Electronics">Electronics</Link>
          <Link to="/products?featured=true">Featured</Link>
        </div>

        <div className={styles.col}>
          <h4>Account</h4>
          <Link to="/login">Login</Link>
          <Link to="/signup">Sign Up</Link>
          <Link to="/dashboard">My Orders</Link>
          <Link to="/cart">Cart</Link>
        </div>

        <div className={styles.col}>
          <h4>Contact</h4>
          <span><FiMail /> support@desicart.in</span>
          <span><FiPhone /> +91 8329910022</span>
          <span><FiMapPin /> Karanja(Lad), Maharashtra, India</span>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>© {new Date().getFullYear()} DesiCart. All rights reserved.</p>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.82rem", marginTop: "0.3rem" }}>
          Designed &amp; Developed by{" "}
          <strong style={{ color: "#FF9966" }}>Jaydip Rathod</strong>
          {" "}|{" "}
          📞 +91 xxxxxxxxxx
        </p>
        <div className={styles.badges}>
          <span>🔒 Secure Payments</span>
          <span>🚚 Free Shipping ₹499+</span>
          <span>↩️ Easy Returns</span>
        </div>
      </div>
    </footer>
  );
}