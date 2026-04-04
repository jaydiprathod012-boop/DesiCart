/**
 * Product Controller
 * Full CRUD operations, search, filtering, pagination, and reviews
 */

const asyncHandler = require("express-async-handler");
const Product      = require("../models/Product");
const cloudinary   = require("../config/cloudinary");

// ─── @route   GET /api/products ────────────────────────────────────────────────
// ─── @desc    Get all products with filtering, search, and pagination
// ─── @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const {
    keyword,
    category,
    minPrice,
    maxPrice,
    rating,
    page     = 1,
    limit    = 12,
    sort     = "createdAt",
    order    = "desc",
    featured,
  } = req.query;

  // Build query filter object
  const query = { isActive: true };

  // Full-text search
  if (keyword) {
    query.$text = { $search: keyword };
  }

  // Category filter
  if (category && category !== "all") {
    query.category = category;
  }

  // Price range filter
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // Rating filter
  if (rating) {
    query.rating = { $gte: Number(rating) };
  }

  // Featured filter
  if (featured === "true") {
    query.isFeatured = true;
  }

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await Product.countDocuments(query);

  // Sort options mapping
  const sortOptions = {
    price_asc:   { price: 1 },
    price_desc:  { price: -1 },
    rating:      { rating: -1 },
    newest:      { createdAt: -1 },
    oldest:      { createdAt: 1 },
  };
  const sortObj = sortOptions[sort] || { [sort]: order === "asc" ? 1 : -1 };

  const products = await Product.find(query)
    .sort(sortObj)
    .skip(skip)
    .limit(Number(limit))
    .select("-reviews"); // Exclude reviews for performance on listing page

  res.json({
    success:     true,
    count:       products.length,
    total,
    page:        Number(page),
    totalPages:  Math.ceil(total / Number(limit)),
    products,
  });
});

// ─── @route   GET /api/products/:id ────────────────────────────────────────────
// ─── @desc    Get single product by ID (includes reviews)
// ─── @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    "reviews.user",
    "name avatar"
  );

  if (!product || !product.isActive) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json({ success: true, product });
});

// ─── @route   POST /api/products ───────────────────────────────────────────────
// ─── @desc    Create a new product (Admin only)
// ─── @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, mrp, category, subcategory, brand, stock, tags, isFeatured } = req.body;

  // Handle uploaded images from Cloudinary (via multer middleware)
  let images = [];
  if (req.files && req.files.length > 0) {
    images = req.files.map((file) => ({
      public_id: file.filename,
      url:       file.path,
    }));
  }

  // If no file uploaded but image URLs passed directly (for seeding)
  if (req.body.images && typeof req.body.images === "string") {
    const parsed = JSON.parse(req.body.images);
    if (parsed.length > 0 && images.length === 0) {
      images = parsed;
    }
  }

  const product = await Product.create({
    name, description, price, mrp, category, subcategory, brand,
    stock: Number(stock),
    tags: tags ? tags.split(",").map((t) => t.trim()) : [],
    isFeatured: isFeatured === "true" || isFeatured === true,
    images,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, message: "Product created successfully", product });
});

// ─── @route   PUT /api/products/:id ────────────────────────────────────────────
// ─── @desc    Update a product (Admin only)
// ─── @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const updates = { ...req.body };

  // Handle new image uploads
  if (req.files && req.files.length > 0) {
    // Delete old images from Cloudinary
    for (const img of product.images) {
      if (img.public_id) await cloudinary.uploader.destroy(img.public_id);
    }

    updates.images = req.files.map((file) => ({
      public_id: file.filename,
      url:       file.path,
    }));
  }

  if (updates.tags && typeof updates.tags === "string") {
    updates.tags = updates.tags.split(",").map((t) => t.trim());
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  );

  res.json({ success: true, message: "Product updated successfully", product: updatedProduct });
});

// ─── @route   DELETE /api/products/:id ─────────────────────────────────────────
// ─── @desc    Delete a product (Admin only) — soft delete by setting isActive: false
// ─── @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Delete images from Cloudinary
  for (const img of product.images) {
    if (img.public_id && !img.public_id.startsWith("sample")) {
      await cloudinary.uploader.destroy(img.public_id);
    }
  }

  await product.deleteOne();
  res.json({ success: true, message: "Product deleted successfully" });
});

// ─── @route   POST /api/products/:id/reviews ───────────────────────────────────
// ─── @desc    Add or update a product review
// ─── @access  Private
const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Check if user already reviewed this product
  const existingReview = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (existingReview) {
    existingReview.rating  = Number(rating);
    existingReview.comment = comment;
  } else {
    product.reviews.push({
      user:    req.user._id,
      name:    req.user.name,
      rating:  Number(rating),
      comment,
    });
    product.numReviews = product.reviews.length;
  }

  // Recalculate average rating
  product.rating =
    product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;

  await product.save();
  res.json({ success: true, message: "Review submitted successfully" });
});

// ─── @route   GET /api/products/categories/list ────────────────────────────────
// ─── @desc    Get distinct categories
// ─── @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct("category", { isActive: true });
  res.json({ success: true, categories });
});

module.exports = {
  getProducts, getProductById, createProduct, updateProduct,
  deleteProduct, addReview, getCategories,
};
