/**
 * Cart Model
 * Persistent cart storage per user in MongoDB
 */

const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity must be at least 1"],
    default: 1,
  },
  price: {
    // Snapshot price at time of adding to cart
    type: Number,
    required: true,
  },
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One cart per user
    },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

// ─── Virtual: total cart value ─────────────────────────────────────────────────
cartSchema.virtual("totalPrice").get(function () {
  return this.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
});

// ─── Virtual: total number of items ───────────────────────────────────────────
cartSchema.virtual("totalItems").get(function () {
  return this.items.reduce((acc, item) => acc + item.quantity, 0);
});

module.exports = mongoose.model("Cart", cartSchema);
