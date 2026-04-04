/**
 * Order Controller
 * Place orders, manage order status, view history
 */

const asyncHandler = require("express-async-handler");
const Order   = require("../models/Order");
const Product = require("../models/Product");
const Cart    = require("../models/Cart");

// ─── @route   POST /api/orders ──────────────────────────────────────────────────
// ─── @desc    Place a new order
// ─── @access  Private
const placeOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error("No order items provided");
  }

  // Validate stock and calculate prices
  let itemsPrice = 0;
  const validatedItems = [];

  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product || !product.isActive) {
      res.status(404);
      throw new Error(`Product "${item.name}" not found`);
    }
    if (product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for "${product.name}"`);
    }

    validatedItems.push({
      product:  product._id,
      name:     product.name,
      image:    product.images[0]?.url || "",
      price:    product.price,
      quantity: item.quantity,
    });

    itemsPrice += product.price * item.quantity;
  }

  // Calculate tax (18% GST) and shipping
  const taxPrice      = Math.round(itemsPrice * 0.18);
  const shippingPrice = itemsPrice > 499 ? 0 : 49; // Free shipping above ₹499
  const totalPrice    = itemsPrice + taxPrice + shippingPrice;

  const order = await Order.create({
    user: req.user._id,
    orderItems: validatedItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  });

  // Reduce stock for each product
  for (const item of validatedItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity },
    });
  }

  // Clear the user's cart after order placed
  await Cart.findOneAndDelete({ user: req.user._id });

  res.status(201).json({
    success: true,
    message: "Order placed successfully!",
    order,
  });
});

// ─── @route   GET /api/orders/my ────────────────────────────────────────────────
// ─── @desc    Get current user's orders
// ─── @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip  = (Number(page) - 1) * Number(limit);
  const total = await Order.countDocuments({ user: req.user._id });

  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .select("-__v");

  res.json({
    success: true,
    count: orders.length,
    total,
    totalPages: Math.ceil(total / Number(limit)),
    orders,
  });
});

// ─── @route   GET /api/orders/:id ───────────────────────────────────────────────
// ─── @desc    Get order by ID
// ─── @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email phone");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // Ensure user can only view their own orders (admin can view all)
  if (
    order.user._id.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized to view this order");
  }

  res.json({ success: true, order });
});

// ─── @route   PUT /api/orders/:id/pay ───────────────────────────────────────────
// ─── @desc    Mark order as paid (after payment verification)
// ─── @access  Private
const markOrderAsPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.isPaid         = true;
  order.paidAt         = new Date();
  order.paymentResult  = req.body.paymentResult;
  order.orderStatus    = "Processing";

  const updatedOrder = await order.save();
  res.json({ success: true, message: "Payment recorded", order: updatedOrder });
});

// ─── @route   GET /api/orders ───────────────────────────────────────────────────
// ─── @desc    Get all orders (Admin only)
// ─── @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const skip  = (Number(page) - 1) * Number(limit);

  const query = {};
  if (status) query.orderStatus = status;

  const total  = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.json({
    success: true,
    count: orders.length,
    total,
    totalPages: Math.ceil(total / Number(limit)),
    orders,
  });
});

// ─── @route   PUT /api/orders/:id/status ────────────────────────────────────────
// ─── @desc    Update order status (Admin only)
// ─── @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.orderStatus = status;
  if (status === "Delivered") order.deliveredAt = new Date();
  if (status === "Cancelled") order.cancelledAt = new Date();

  const updatedOrder = await order.save();
  res.json({ success: true, message: `Order marked as ${status}`, order: updatedOrder });
});

module.exports = {
  placeOrder, getMyOrders, getOrderById, markOrderAsPaid,
  getAllOrders, updateOrderStatus,
};
