const express = require("express");
const router = express.Router();
const { register, login, me } = require("../controllers/authController");
const { protect } = require("../middlewares/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, me);

module.exports = router;
