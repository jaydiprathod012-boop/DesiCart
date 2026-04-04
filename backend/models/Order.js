/**
 * Order Model
 * Tracks orders, shipping, payment status, and items
 */

const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name:     { type: String, required: true },
  image:    { type: String, required: true },
  price:    { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const shippingAddressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone:    { type: String, required: true },
  street:   { type: String, required: true },
  city:     { type: String, required: true },
  state:    { type: String, required: true },
  pincode:  { type: String, required: true },
  country:  { type: String, default: "India" },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    orderItems: [orderItemSchema],

    shippingAddress: shippingAddressSchema,

    paymentMethod: {
      type: String,
      enum: ["Razorpay", "COD"],
      required: true,
    },
    paymentResult: {
      razorpay_order_id:   String,
      razorpay_payment_id: String,
      razorpay_signature:  String,
      status:              String,
      update_time:         String,
    },

    itemsPrice:    { type: Number, required: true, default: 0 },
    taxPrice:      { type: Number, required: true, default: 0 },
    shippingPrice: { type: Number, required: true, default: 0 },
    totalPrice:    { type: Number, required: true, default: 0 },

    isPaid:   { type: Boolean, default: false },
    paidAt:   Date,

    orderStatus: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    deliveredAt: Date,
    cancelledAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
