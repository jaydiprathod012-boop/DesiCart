/**
 * Navbar — Responsive top navigation with cart badge, auth links, search
 */

import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import {
  FiShoppingCart, FiSearch, FiUser, FiMenu, FiX,
  FiPackage, FiLogOut, FiSettings, FiChevronDown,
} from "react-icons/fi";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropOpen,    setDropOpen]    = useState(false);
  const [scrolled,    setScrolled]    = useState(false);
  const dropRef  = useRef(null);
  const searchRef = useRef(null);

  // Scroll shadow
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); setDropOpen(false); }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setSearchOpen(false);
    }
  };

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ""}`}>
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>🛒</span>
          <span className={styles.logoText}>
            Desi<span>Cart</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className={styles.navLinks}>
          <Link to="/"         className={styles.navLink}>Home</Link>
          <Link to="/products" className={styles.navLink}>Shop</Link>
          {isAdmin && (
            <Link to="/admin" className={styles.navLink}>Admin</Link>
          )}
        </div>

        {/* Desktop search */}
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search products…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </form>

        {/* Actions */}
        <div className={styles.actions}>
          {/* Mobile search toggle */}
          <button className={styles.iconBtn} onClick={() => setSearchOpen(!searchOpen)} aria-label="Search">
            <FiSearch size={20} />
          </button>

          {/* Cart */}
          <Link to="/cart" className={styles.cartBtn} aria-label="Cart">
            <FiShoppingCart size={20} />
            {totalItems > 0 && (
              <span className={styles.cartBadge}>{totalItems > 9 ? "9+" : totalItems}</span>
            )}
          </Link>

          {/* User dropdown */}
          {user ? (
            <div ref={dropRef} className={styles.dropdown}>
              <button className={styles.userBtn} onClick={() => setDropOpen(!dropOpen)}>
                <div className={styles.avatar}>{user.name[0].toUpperCase()}</div>
                <span className={styles.userName}>{user.name.split(" ")[0]}</span>
                <FiChevronDown size={14} className={dropOpen ? styles.rotated : ""} />
              </button>
              {dropOpen && (
                <div className={styles.dropMenu}>
                  <Link to="/dashboard" className={styles.dropItem}>
                    <FiUser size={15} /> My Account
                  </Link>
                  <Link to="/dashboard?tab=orders" className={styles.dropItem}>
                    <FiPackage size={15} /> My Orders
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className={styles.dropItem}>
                      <FiSettings size={15} /> Admin Panel
                    </Link>
                  )}
                  <hr className={styles.dropDivider} />
                  <button className={`${styles.dropItem} ${styles.logoutBtn}`} onClick={logout}>
                    <FiLogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.authLinks}>
              <Link to="/login"  className={`btn btn-outline btn-sm`}>Login</Link>
              <Link to="/signup" className={`btn btn-primary btn-sm`}>Sign Up</Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button className={styles.hamburger} onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile search bar */}
      {searchOpen && (
        <div className={styles.mobileSearch}>
          <form onSubmit={handleSearch} className={styles.mobileSearchForm}>
            <input
              ref={searchRef}
              autoFocus
              type="text"
              placeholder="Search for products…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            <button type="submit" className="btn btn-primary btn-sm">Go</button>
          </form>
        </div>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div className={styles.mobileMenu}>
          <Link to="/"             className={styles.mobileLink}>Home</Link>
          <Link to="/products"     className={styles.mobileLink}>Shop All</Link>
          <Link to="/cart"         className={styles.mobileLink}>Cart {totalItems > 0 && `(${totalItems})`}</Link>
          {user ? (
            <>
              <Link to="/dashboard"  className={styles.mobileLink}>My Account</Link>
              {isAdmin && <Link to="/admin" className={styles.mobileLink}>Admin Panel</Link>}
              <button className={`${styles.mobileLink} ${styles.mobileLogout}`} onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login"  className={styles.mobileLink}>Login</Link>
              <Link to="/signup" className={styles.mobileLink}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
