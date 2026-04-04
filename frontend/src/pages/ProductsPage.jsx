import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../utils/api";
import ProductCard from "../components/common/ProductCard";
import { FiFilter, FiX, FiChevronDown } from "react-icons/fi";
import styles from "./ProductsPage.module.css";

const CATEGORIES = [
  "Clothing","Electronics","Food & Grocery","Home & Kitchen",
  "Beauty & Personal Care","Sports & Fitness","Books",
  "Toys & Games","Jewellery","Footwear",
];
const SORT_OPTIONS = [
  { value: "newest",     label: "Newest First" },
  { value: "price_asc",  label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating",     label: "Top Rated" },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products,   setProducts]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Derive filter state from URL params
  const keyword  = searchParams.get("keyword")  || "";
  const category = searchParams.get("category") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sort     = searchParams.get("sort")     || "newest";
  const page     = Number(searchParams.get("page") || 1);
  const featured = searchParams.get("featured") || "";

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(keyword  && { keyword }),
        ...(category && { category }),
        ...(minPrice && { minPrice }),
        ...(maxPrice && { maxPrice }),
        ...(featured && { featured }),
        sort, page, limit: 12,
      });
      const { data } = await api.get(`/products?${params}`);
      setProducts(data.products);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [keyword, category, minPrice, maxPrice, sort, page, featured]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [page]);

  const updateParam = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    if (key !== "page") p.delete("page");
    setSearchParams(p);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasFilters = keyword || category || minPrice || maxPrice || featured;

  return (
    <div className={`container ${styles.page}`}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            {keyword ? `Results for "${keyword}"` : category ? category : "All Products"}
          </h1>
          {!loading && (
            <p className={styles.count}>{total} product{total !== 1 ? "s" : ""} found</p>
          )}
        </div>
        <div className={styles.headerRight}>
          {/* Sort */}
          <select
            className="form-select"
            style={{ width: "auto" }}
            value={sort}
            onChange={(e) => updateParam("sort", e.target.value)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          {/* Filter toggle (mobile) */}
          <button
            className={`btn btn-outline btn-sm ${styles.filterToggle}`}
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <FiFilter size={15} /> Filters {hasFilters && "•"}
          </button>
        </div>
      </div>

      {/* Active filter chips */}
      {hasFilters && (
        <div className={styles.chips}>
          {keyword    && <Chip label={`Search: ${keyword}`}   onRemove={() => updateParam("keyword",  "")} />}
          {category   && <Chip label={category}              onRemove={() => updateParam("category", "")} />}
          {featured   && <Chip label="Featured"              onRemove={() => updateParam("featured", "")} />}
          {minPrice   && <Chip label={`Min ₹${minPrice}`}    onRemove={() => updateParam("minPrice", "")} />}
          {maxPrice   && <Chip label={`Max ₹${maxPrice}`}    onRemove={() => updateParam("maxPrice", "")} />}
          <button className={styles.clearAll} onClick={clearFilters}>Clear all ×</button>
        </div>
      )}

      <div className={styles.layout}>
        {/* ── Sidebar Filters ── */}
        <aside className={`${styles.sidebar} ${filtersOpen ? styles.sidebarOpen : ""}`}>
          <div className={styles.sidebarHead}>
            <h3>Filters</h3>
            <button className={styles.sidebarClose} onClick={() => setFiltersOpen(false)}>
              <FiX />
            </button>
          </div>

          {/* Category */}
          <FilterSection title="Category">
            <div className={styles.filterList}>
              <label className={styles.filterRadio}>
                <input type="radio" name="category" value="" checked={!category}
                  onChange={() => updateParam("category", "")} /> All Categories
              </label>
              {CATEGORIES.map((c) => (
                <label key={c} className={styles.filterRadio}>
                  <input type="radio" name="category" value={c}
                    checked={category === c}
                    onChange={() => updateParam("category", c)} />
                  {c}
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Price Range */}
          <FilterSection title="Price Range">
            <div className={styles.priceInputs}>
              <input
                type="number" placeholder="Min ₹"
                className="form-input" style={{ fontSize: "0.85rem" }}
                value={minPrice}
                onChange={(e) => updateParam("minPrice", e.target.value)}
              />
              <span style={{ color: "var(--muted)" }}>–</span>
              <input
                type="number" placeholder="Max ₹"
                className="form-input" style={{ fontSize: "0.85rem" }}
                value={maxPrice}
                onChange={(e) => updateParam("maxPrice", e.target.value)}
              />
            </div>
            <div className={styles.pricePresets}>
              {[["Under ₹500","","500"],["₹500-₹2000","500","2000"],["₹2000-₹10000","2000","10000"],["Above ₹10000","10000",""]].map(([label,mn,mx]) => (
                <button key={label} className={styles.preset}
                  onClick={() => { updateParam("minPrice", mn); updateParam("maxPrice", mx); }}>
                  {label}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Featured */}
          <FilterSection title="Availability">
            <label className={styles.filterRadio}>
              <input type="radio" name="featured" value="" checked={!featured}
                onChange={() => updateParam("featured", "")} /> All Products
            </label>
            <label className={styles.filterRadio}>
              <input type="radio" name="featured" value="true" checked={featured === "true"}
                onChange={() => updateParam("featured", "true")} /> ⭐ Featured Only
            </label>
          </FilterSection>

          <button className="btn btn-outline btn-full btn-sm" onClick={clearFilters} style={{ marginTop: "0.5rem" }}>
            Reset Filters
          </button>
        </aside>

        {/* ── Products Grid ── */}
        <div className={styles.main}>
          {loading ? (
            <div className="spinner-wrap" style={{ minHeight: "50vh" }}>
              <div className="spinner" />
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: "4rem" }}>🔍</div>
              <h3>No products found</h3>
              <p>Try adjusting your filters or search term.</p>
              <button className="btn btn-primary" style={{ marginTop: "1rem" }} onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="products-grid">
                {products.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button disabled={page === 1} onClick={() => updateParam("page", page - 1)}>‹</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((n) => Math.abs(n - page) <= 2 || n === 1 || n === totalPages)
                    .reduce((acc, n, idx, arr) => {
                      if (idx > 0 && n - arr[idx - 1] > 1) acc.push("…");
                      acc.push(n);
                      return acc;
                    }, [])
                    .map((n, i) =>
                      n === "…" ? <span key={i} style={{ padding: "0 0.25rem", color: "var(--muted)" }}>…</span>
                        : <button key={n} className={page === n ? "active" : ""} onClick={() => updateParam("page", n)}>{n}</button>
                    )}
                  <button disabled={page === totalPages} onClick={() => updateParam("page", page + 1)}>›</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterSection({ title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <button
        style={{ display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%", background:"none", border:"none", cursor:"pointer", padding:"0 0 0.5rem", fontWeight:600, fontSize:"0.875rem", color:"var(--text-secondary)" }}
        onClick={() => setOpen(!open)}
      >
        {title} <FiChevronDown size={14} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>
      {open && <div>{children}</div>}
      <div className="divider" style={{ margin: "0.75rem 0 0" }} />
    </div>
  );
}

function Chip({ label, onRemove }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:"0.3rem", padding:"0.25rem 0.65rem", background:"var(--saffron-pale)", color:"var(--saffron)", borderRadius:"99px", fontSize:"0.78rem", fontWeight:600 }}>
      {label}
      <button onClick={onRemove} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--saffron)", lineHeight:1, display:"flex" }}><FiX size={12} /></button>
    </span>
  );
}
