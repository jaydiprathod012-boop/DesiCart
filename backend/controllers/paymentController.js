/**
 * Payment Controller
 * Razorpay payment integration (Test Mode)
 */

const asyncHandler = require("express-async-handler");
const Razorpay = require("razorpay");
const crypto   = require("crypto");

// Initialize Razorpay with test keys
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─── @route   POST /api/payment/create-order ────────────────────────────────────
// ─── @desc    Create a Razorpay order
// ─── @access  Private
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount } = req.body; // Amount in ₹

  const options = {
    amount:   Math.round(amount * 100), // Convert to paise (smallest INR unit)
    currency: "INR",
    receipt:  `receipt_${Date.now()}`,
  };

  const order = await razorpay.orders.create(options);

  res.json({
    success: true,
    order,
    key: process.env.RAZORPAY_KEY_ID,
  });
});

// ─── @route   POST /api/payment/verify ──────────────────────────────────────────
// ─── @desc    Verify Razorpay payment signature (security check)
// ─── @access  Private
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  // Create expected signature using HMAC SHA256
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    res.status(400);
    throw new Error("Payment verification failed. Invalid signature.");
  }

  res.json({
    success:  true,
    message:  "Payment verified successfully",
    paymentId: razorpay_payment_id,
  });
});

module.exports = { createRazorpayOrder, verifyPayment };
