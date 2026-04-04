/**
 * Cart Controller
 * Add, remove, update, and retrieve cart items per user
 */

const asyncHandler = require("express-async-handler");
const Cart    = require("../models/Cart");
const Product = require("../models/Product");

// ─── @route   GET /api/cart ─────────────────────────────────────────────────────
// ─── @desc    Get current user's cart
// ─── @access  Private
const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product",
    "name images price stock isActive"
  );

  if (!cart) {
    return res.json({ success: true, cart: { items: [], totalPrice: 0, totalItems: 0 } });
  }

  // Filter out inactive/deleted products
  const activeItems = cart.items.filter(
    (item) => item.product && item.product.isActive
  );

  const totalPrice = activeItems.reduce(
    (acc, item) => acc + item.price * item.quantity, 0
  );
  const totalItems = activeItems.reduce(
    (acc, item) => acc + item.quantity, 0
  );

  res.json({
    success: true,
    cart: { _id: cart._id, items: activeItems, totalPrice, totalItems },
  });
});

// ─── @route   POST /api/cart/add ────────────────────────────────────────────────
// ─── @desc    Add item to cart or increment quantity
// ─── @access  Private
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  // Validate product
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    res.status(404);
    throw new Error("Product not found");
  }
  if (product.stock < quantity) {
    res.status(400);
    throw new Error(`Only ${product.stock} items left in stock`);
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    // Create new cart for user
    cart = await Cart.create({
      user: req.user._id,
      items: [{ product: productId, quantity: Number(quantity), price: product.price }],
    });
  } else {
    // Check if product already in cart
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      const newQty = existingItem.quantity + Number(quantity);
      if (newQty > product.stock) {
        res.status(400);
        throw new Error(`Cannot add more. Only ${product.stock} available.`);
      }
      existingItem.quantity = newQty;
      existingItem.price    = product.price; // Refresh price
    } else {
      cart.items.push({ product: productId, quantity: Number(quantity), price: product.price });
    }

    await cart.save();
  }

  // Return populated cart
  await cart.populate("items.product", "name images price stock");

  const totalPrice = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);

  res.json({
    success: true,
    message: "Item added to cart",
    cart: { items: cart.items, totalPrice, totalItems },
  });
});

// ─── @route   PUT /api/cart/update ──────────────────────────────────────────────
// ─── @desc    Update item quantity in cart
// ─── @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  if (quantity < 1) {
    res.status(400);
    throw new Error("Quantity must be at least 1. Use remove to delete item.");
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  if (quantity > product.stock) {
    res.status(400);
    throw new Error(`Only ${product.stock} items in stock`);
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  const item = cart.items.find((i) => i.product.toString() === productId);
  if (!item) {
    res.status(404);
    throw new Error("Item not found in cart");
  }

  item.quantity = Number(quantity);
  await cart.save();
  await cart.populate("items.product", "name images price stock");

  const totalPrice = cart.items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const totalItems = cart.items.reduce((acc, i) => acc + i.quantity, 0);

  res.json({
    success: true,
    message: "Cart updated",
    cart: { items: cart.items, totalPrice, totalItems },
  });
});

// ─── @route   DELETE /api/cart/remove/:productId ────────────────────────────────
// ─── @desc    Remove an item from cart
// ─── @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== req.params.productId
  );

  await cart.save();
  await cart.populate("items.product", "name images price stock");

  const totalPrice = cart.items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const totalItems = cart.items.reduce((acc, i) => acc + i.quantity, 0);

  res.json({
    success: true,
    message: "Item removed from cart",
    cart: { items: cart.items, totalPrice, totalItems },
  });
});

// ─── @route   DELETE /api/cart/clear ────────────────────────────────────────────
// ─── @desc    Clear entire cart
// ─── @access  Private
const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndDelete({ user: req.user._id });
  res.json({ success: true, message: "Cart cleared" });
});

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
