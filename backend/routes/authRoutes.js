/**
 * Auth Routes
 */
const express = require("express");
const router  = express.Router();
const { register, login, getProfile, updateProfile, getAllUsers, deleteUser } =
  require("../controllers/authController");
const { protect, authorize } = require("../middleware/auth");

router.post("/register", register);
router.post("/login",    login);
router.get("/profile",   protect, getProfile);
router.put("/profile",   protect, updateProfile);
router.get("/users",     protect, authorize("admin"), getAllUsers);
router.delete("/users/:id", protect, authorize("admin"), deleteUser);

module.exports = router;
