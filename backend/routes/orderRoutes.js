const express = require("express");
const router  = express.Router();
const {
  placeOrder, getMyOrders, getOrderById, markOrderAsPaid,
  getAllOrders, updateOrderStatus,
} = require("../controllers/orderController");
const { protect, authorize } = require("../middleware/auth");

router.post("/",              protect, placeOrder);
router.get("/my",             protect, getMyOrders);
router.get("/",               protect, authorize("admin"), getAllOrders);
router.get("/:id",            protect, getOrderById);
router.put("/:id/pay",        protect, markOrderAsPaid);
router.put("/:id/status",     protect, authorize("admin"), updateOrderStatus);

module.exports = router;
