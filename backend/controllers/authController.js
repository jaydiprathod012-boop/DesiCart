/**
 * Auth Controller
 * Handles user registration, login, profile management
 */

const asyncHandler = require("express-async-handler");
const User         = require("../models/User");
const { generateToken } = require("../middleware/auth");

// ─── @route   POST /api/auth/register ──────────────────────────────────────────
// ─── @desc    Register a new user
// ─── @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User with this email already exists");
  }

  // Create user (password is hashed in the User model pre-save hook)
  const user = await User.create({ name, email, password, phone });

  res.status(201).json({
    success: true,
    message: "Registration successful!",
    user: {
      _id:   user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
      phone: user.phone,
    },
    token: generateToken(user._id),
  });
});

// ─── @route   POST /api/auth/login ─────────────────────────────────────────────
// ─── @desc    Login user & return JWT
// ─── @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide email and password");
  }

  // Find user with password explicitly selected (password has select: false)
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  res.json({
    success: true,
    message: "Login successful!",
    user: {
      _id:    user._id,
      name:   user.name,
      email:  user.email,
      role:   user.role,
      phone:  user.phone,
      avatar: user.avatar,
    },
    token: generateToken(user._id),
  });
});

// ─── @route   GET /api/auth/profile ────────────────────────────────────────────
// ─── @desc    Get current user's profile
// ─── @access  Private
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.json({
    success: true,
    user: {
      _id:       user._id,
      name:      user.name,
      email:     user.email,
      role:      user.role,
      phone:     user.phone,
      avatar:    user.avatar,
      addresses: user.addresses,
      createdAt: user.createdAt,
    },
  });
});

// ─── @route   PUT /api/auth/profile ────────────────────────────────────────────
// ─── @desc    Update current user's profile
// ─── @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  user.name  = req.body.name  || user.name;
  user.phone = req.body.phone || user.phone;

  // Update password only if provided
  if (req.body.password) {
    if (req.body.password.length < 6) {
      res.status(400);
      throw new Error("Password must be at least 6 characters");
    }
    user.password = req.body.password;
  }

  // Add or update addresses
  if (req.body.address) {
    user.addresses.push(req.body.address);
  }

  const updatedUser = await user.save();

  res.json({
    success: true,
    message: "Profile updated successfully",
    user: {
      _id:       updatedUser._id,
      name:      updatedUser.name,
      email:     updatedUser.email,
      role:      updatedUser.role,
      phone:     updatedUser.phone,
      addresses: updatedUser.addresses,
    },
    token: generateToken(updatedUser._id),
  });
});

// ─── @route   GET /api/auth/users ──────────────────────────────────────────────
// ─── @desc    Get all users (Admin only)
// ─── @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).sort({ createdAt: -1 });
  res.json({ success: true, count: users.length, users });
});

// ─── @route   DELETE /api/auth/users/:id ───────────────────────────────────────
// ─── @desc    Delete a user (Admin only)
// ─── @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  await user.deleteOne();
  res.json({ success: true, message: "User deleted successfully" });
});

module.exports = { register, login, getProfile, updateProfile, getAllUsers, deleteUser };
