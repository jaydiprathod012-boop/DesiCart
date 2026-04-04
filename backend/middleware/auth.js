/**
 * Authentication Middleware
 * Verifies JWT tokens and enforces role-based access control
 */

const jwt  = require("jsonwebtoken");
const User = require("../models/User");

/**
 * protect — Verifies the Bearer JWT token in the Authorization header.
 * Attaches the decoded user to req.user on success.
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized. No token provided.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch fresh user from DB (ensures revoked/deleted accounts are caught)
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Token is invalid.",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized. Token is invalid or expired.",
    });
  }
};

/**
 * authorize — Restricts access to specific roles (e.g., "admin").
 * Must be used AFTER protect middleware.
 * Usage: router.get("/admin", protect, authorize("admin"), handler)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role "${req.user.role}" is not authorized.`,
      });
    }
    next();
  };
};

/**
 * generateToken — Signs and returns a JWT token for a given user ID.
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });
};

module.exports = { protect, authorize, generateToken };
