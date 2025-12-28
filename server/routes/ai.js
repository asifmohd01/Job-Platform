const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth");
const aiController = require("../controllers/aiController");

// All AI routes require auth; both roles permitted
router.post("/match", protect, aiController.match);
router.post("/call", protect, aiController.call);
router.post("/jd-enhance", protect, aiController.jdEnhance);

module.exports = router;
