/**
 * Global Error Handler Middleware
 * Centralizes error responses with consistent structure
 */

/**
 * notFound — 404 handler for unknown routes
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * errorHandler — Catches all errors thrown in controllers.
 * Formats Mongoose validation, cast, and duplicate key errors into readable messages.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message    = err.message || "Internal Server Error";

  // ── Mongoose: Bad ObjectId ────────────────────────────────────────────────
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 400;
    message    = `Resource not found. Invalid ID: ${err.value}`;
  }

  // ── Mongoose: Duplicate key ───────────────────────────────────────────────
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message     = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
  }

  // ── Mongoose: Validation error ────────────────────────────────────────────
  if (err.name === "ValidationError") {
    statusCode = 400;
    message    = Object.values(err.errors).map((e) => e.message).join(". ");
  }

  // ── JWT: Invalid token ────────────────────────────────────────────────────
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message    = "Invalid token. Please log in again.";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message    = "Token expired. Please log in again.";
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

module.exports = { notFound, errorHandler };
