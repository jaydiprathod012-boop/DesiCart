import React from "react";
import { Link } from "react-router-dom";
import { FiStar, FiShoppingCart, FiHeart } from "react-icons/fi";
import { useCart } from "../../context/CartContext";
import styles from "./ProductCard.module.css";

const formatPrice = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export default function ProductCard({ product }) {
  const { addToCart, isInCart } = useCart();
  const inCart = isInCart(product._id);

  const discount = product.mrp && product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  const imgUrl = product.images?.[0]?.url || "https://placehold.co/400x400/FFF0E8/E8520A?text=No+Image";

  return (
    <div className={styles.card}>
      {/* Discount badge */}
      {discount > 0 && (
        <div className={styles.discountBadge}>{discount}% OFF</div>
      )}
      {product.isFeatured && (
        <div className={styles.featuredBadge}>⭐ Featured</div>
      )}

      {/* Wishlist */}
      <button className={styles.wishBtn} aria-label="Add to wishlist">
        <FiHeart size={16} />
      </button>

      {/* Image */}
      <Link to={`/products/${product._id}`} className={styles.imgWrap}>
        <img src={imgUrl} alt={product.name} className={styles.img} loading="lazy" />
      </Link>

      {/* Body */}
      <div className={styles.body}>
        <p className={styles.category}>{product.category}</p>
        <Link to={`/products/${product._id}`} className={styles.name}>
          {product.name}
        </Link>

        {/* Rating */}
        {product.numReviews > 0 && (
          <div className={styles.rating}>
            <FiStar fill="#F5C842" stroke="#F5C842" size={13} />
            <span className={styles.ratingNum}>{product.rating?.toFixed(1)}</span>
            <span className={styles.ratingCount}>({product.numReviews})</span>
          </div>
        )}

        {/* Price row */}
        <div className={styles.priceRow}>
          <span className="price-current">{formatPrice(product.price)}</span>
          {product.mrp > product.price && (
            <span className="price-mrp">{formatPrice(product.mrp)}</span>
          )}
        </div>

        {/* Stock */}
        {product.stock === 0 ? (
          <span className={`badge badge-muted ${styles.stockBadge}`}>Out of Stock</span>
        ) : product.stock < 10 ? (
          <span className={`badge badge-saffron ${styles.stockBadge}`}>Only {product.stock} left</span>
        ) : null}

        {/* Add to cart */}
        <button
          className={`btn btn-full ${styles.cartBtn} ${inCart ? styles.inCart : ""}`}
          onClick={() => addToCart(product._id)}
          disabled={product.stock === 0}
        >
          <FiShoppingCart size={15} />
          {inCart ? "In Cart ✓" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
