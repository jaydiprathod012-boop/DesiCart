const express  = require("express");
const router   = express.Router();
const upload   = require("../middleware/upload");
const { protect, authorize } = require("../middleware/auth");

// Generic image upload endpoint (admin only)
router.post("/image", protect, authorize("admin"), upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }
  res.json({
    success:   true,
    public_id: req.file.filename,
    url:       req.file.path,
  });
});

module.exports = router;
