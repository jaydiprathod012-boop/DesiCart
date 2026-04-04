import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import toast from "react-hot-toast";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiStar } from "react-icons/fi";
import styles from "./Admin.module.css";

const CATEGORIES = [
  "Clothing","Electronics","Food & Grocery","Home & Kitchen",
  "Beauty & Personal Care","Sports & Fitness","Books",
  "Toys & Games","Jewellery","Footwear",
];
const EMPTY_FORM = { name:"", description:"", price:"", mrp:"", category:"", brand:"", stock:"", tags:"", isFeatured:false, images:[] };

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState(null); // product being edited
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [saving,   setSaving]   = useState(false);
  const [imgFiles, setImgFiles] = useState([]);
  const [search,   setSearch]   = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/products?limit=15&page=${page}${search ? `&keyword=${search}` : ""}`);
      setProducts(data.products);
      setTotal(data.total);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [page, search]);

  const openAdd  = () => { setEditing(null); setForm(EMPTY_FORM); setImgFiles([]); setShowForm(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ name:p.name, description:p.description, price:p.price, mrp:p.mrp||"", category:p.category, brand:p.brand||"", stock:p.stock, tags:p.tags?.join(", ")||"", isFeatured:p.isFeatured, images:p.images });
    setImgFiles([]);
    setShowForm(true);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted");
      fetchProducts();
    } catch (err) { toast.error(err.message); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k !== "images") fd.append(k, v);
      });
      imgFiles.forEach((f) => fd.append("images", f));

      if (editing) {
        await api.put(`/products/${editing._id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Product updated!");
      } else {
        // If no files, send JSON with placeholder image
        if (imgFiles.length === 0) {
          fd.append("images", JSON.stringify([{ public_id: "placeholder", url: `https://placehold.co/600x600/FFF0E8/E8520A?text=${encodeURIComponent(form.name)}` }]));
        }
        await api.post("/products", fd, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Product created!");
      }
      setShowForm(false);
      fetchProducts();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>📦 Products</h1>
          <p className={styles.pageSub}>{total} total products</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><FiPlus /> Add Product</button>
      </div>

      {/* Search */}
      <input className="form-input" style={{ maxWidth:320, marginBottom:"1.25rem" }}
        placeholder="Search products…" value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }} />

      {/* Table */}
      {loading ? <div className="spinner-wrap"><div className="spinner" /></div> : (
        <div className={styles.table}>
          <div className={`${styles.tableRow} ${styles.tableHead}`}>
            <span>Product</span><span>Category</span><span>Price</span><span>Stock</span><span>Rating</span><span>Actions</span>
          </div>
          {products.map((p) => (
            <div key={p._id} className={styles.tableRow}>
              <div className={styles.productCell}>
                <img src={p.images?.[0]?.url || ""} alt={p.name} className={styles.productThumb} />
                <span className={styles.productName}>{p.name}{p.isFeatured && <FiStar size={12} style={{ color:"var(--gold)", marginLeft:4 }} />}</span>
              </div>
              <span><span className="badge badge-muted">{p.category}</span></span>
              <span>
                <strong>{fmt(p.price)}</strong>
                {p.mrp > p.price && <span style={{ fontSize:"0.75rem", color:"var(--muted)", display:"block" }}>{Math.round((p.mrp-p.price)/p.mrp*100)}% off</span>}
              </span>
              <span>
                <span style={{ color: p.stock < 5 ? "var(--saffron)" : p.stock === 0 ? "#dc2626" : "var(--forest)", fontWeight:600 }}>
                  {p.stock === 0 ? "Out" : p.stock}
                </span>
              </span>
              <span>{p.rating?.toFixed(1)} ⭐ ({p.numReviews})</span>
              <div style={{ display:"flex", gap:"0.5rem" }}>
                <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)}><FiEdit2 size={14} /></button>
                <button className="btn btn-sm" style={{ background:"#FEE2E2", color:"#DC2626", border:"none" }} onClick={() => handleDelete(p._id, p.name)}><FiTrash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 15 && (
        <div className="pagination" style={{ marginTop:"1.5rem" }}>
          <button disabled={page===1} onClick={() => setPage(p=>p-1)}>‹</button>
          {Array.from({ length: Math.ceil(total/15) }, (_,i)=>i+1).map(n=>(
            <button key={n} className={page===n?"active":""} onClick={()=>setPage(n)}>{n}</button>
          ))}
          <button disabled={page===Math.ceil(total/15)} onClick={()=>setPage(p=>p+1)}>›</button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className={styles.modalOverlay} onClick={(e) => { if(e.target===e.currentTarget) setShowForm(false); }}>
          <div className={styles.modal}>
            <div className={styles.modalHead}>
              <h3>{editing ? "Edit Product" : "Add New Product"}</h3>
              <button className={styles.modalClose} onClick={() => setShowForm(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.modalGrid}>
                <div className="form-group" style={{ gridColumn:"1/-1" }}>
                  <label className="form-label">Product Name *</label>
                  <input className="form-input" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Banarasi Silk Saree" />
                </div>
                <div className="form-group" style={{ gridColumn:"1/-1" }}>
                  <label className="form-label">Description *</label>
                  <textarea className="form-input" rows={3} required value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Price (₹) *</label>
                  <input type="number" className="form-input" required min={0} value={form.price} onChange={e=>setForm({...form,price:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">MRP (₹)</label>
                  <input type="number" className="form-input" min={0} value={form.mrp} onChange={e=>setForm({...form,mrp:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select className="form-select" required value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <input className="form-input" value={form.brand} onChange={e=>setForm({...form,brand:e.target.value})} placeholder="KaashiWeaves" />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock *</label>
                  <input type="number" className="form-input" required min={0} value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tags (comma separated)</label>
                  <input className="form-input" value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} placeholder="silk, ethnic, wedding" />
                </div>
                <div className="form-group" style={{ gridColumn:"1/-1" }}>
                  <label className="form-label">Product Images (max 5)</label>
                  <input type="file" accept="image/*" multiple className="form-input"
                    onChange={e=>setImgFiles(Array.from(e.target.files).slice(0,5))} />
                  {imgFiles.length > 0 && <p style={{ fontSize:"0.8rem", color:"var(--forest)", marginTop:"0.25rem" }}>✓ {imgFiles.length} file(s) selected</p>}
                  {editing && form.images.length > 0 && !imgFiles.length && (
                    <p style={{ fontSize:"0.8rem", color:"var(--muted)", marginTop:"0.25rem" }}>Existing: {form.images.length} image(s). Upload new to replace.</p>
                  )}
                </div>
                <div className="form-group" style={{ gridColumn:"1/-1" }}>
                  <label style={{ display:"flex", alignItems:"center", gap:"0.5rem", cursor:"pointer", fontSize:"0.875rem" }}>
                    <input type="checkbox" checked={form.isFeatured} onChange={e=>setForm({...form,isFeatured:e.target.checked})} style={{ accentColor:"var(--saffron)" }} />
                    ⭐ Mark as Featured Product
                  </label>
                </div>
              </div>
              <div style={{ display:"flex", gap:"0.75rem", justifyContent:"flex-end", marginTop:"0.5rem" }}>
                <button type="button" className="btn btn-outline" onClick={()=>setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : editing ? "Update Product" : "Add Product"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
