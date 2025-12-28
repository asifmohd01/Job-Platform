const express = require("express");
const router = express.Router();
// Admin API removed
router.all("*", (req, res) => res.status(410).json({ message: "Admin API removed" }));
module.exports = router;
