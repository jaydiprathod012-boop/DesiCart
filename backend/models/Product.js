/**
 * Product Model
 * Stores product details, variants, reviews, and inventory
 */

const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name:    { type: String, required: true },
    rating:  { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [120, "Product name cannot exceed 120 characters"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    mrp: {
      // Maximum Retail Price (before discount)
      type: Number,
      min: [0, "MRP cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Clothing",
        "Electronics",
        "Food & Grocery",
        "Home & Kitchen",
        "Beauty & Personal Care",
        "Sports & Fitness",
        "Books",
        "Toys & Games",
        "Jewellery",
        "Footwear",
      ],
    },
    subcategory: { type: String, trim: true },
    brand:       { type: String, trim: true },
    images: [
      {
        public_id: { type: String, required: true },
        url:       { type: String, required: true },
      },
    ],
    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    reviews:     [reviewSchema],
    numReviews:  { type: Number, default: 0 },
    rating:      { type: Number, default: 0 },
    tags:        [String],
    isFeatured:  { type: Boolean, default: false },
    isActive:    { type: Boolean, default: true },
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// ─── Virtual: discount percentage ─────────────────────────────────────────────
productSchema.virtual("discountPercent").get(function () {
  if (this.mrp && this.mrp > this.price) {
    return Math.round(((this.mrp - this.price) / this.mrp) * 100);
  }
  return 0;
});

// ─── Index for full-text search ────────────────────────────────────────────────
productSchema.index({ name: "text", description: "text", tags: "text" });

module.exports = mongoose.model("Product", productSchema);
