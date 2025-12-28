const express = require("express");
const router = express.Router();
const {
  updateCompanyProfile,
  getCompanyProfile,
  getRecruiterDashboard,
} = require("../controllers/recruiterController");
const { protect } = require("../middlewares/auth");
const { permit } = require("../middlewares/role");

// Company profile management
router.put(
  "/company-profile",
  protect,
  permit("recruiter"),
  updateCompanyProfile
);

router.get(
  "/company-profile",
  protect,
  permit("recruiter"),
  getCompanyProfile
);

// Dashboard
router.get(
  "/dashboard",
  protect,
  permit("recruiter"),
  getRecruiterDashboard
);

module.exports = router;
