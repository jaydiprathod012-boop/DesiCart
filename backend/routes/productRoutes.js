/**
 * Product Routes
 */
const express = require("express");
const router  = express.Router();
const {
  getProducts, getProductById, createProduct, updateProduct,
  deleteProduct, addReview, getCategories,
} = require("../controllers/productController");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.get("/",                    getProducts);
router.get("/categories/list",     getCategories);
router.get("/:id",                 getProductById);
router.post("/",                   protect, authorize("admin"), upload.array("images", 5), createProduct);
router.put("/:id",                 protect, authorize("admin"), upload.array("images", 5), updateProduct);
router.delete("/:id",              protect, authorize("admin"), deleteProduct);
router.post("/:id/reviews",        protect, addReview);

module.exports = router;
