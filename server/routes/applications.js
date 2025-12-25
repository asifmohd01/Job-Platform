const express = require("express");
const router = express.Router();
const {
  applyToJob,
  getApplicationsForJob,
  getMyApplications,
} = require("../controllers/applicationController");
const { protect } = require("../middlewares/auth");
const { permit } = require("../middlewares/role");
const upload = require("../services/upload");

router.post(
  "/:jobId/apply",
  protect,
  permit("candidate"),
  upload.single("resume"),
  applyToJob
);
router.get(
  "/me/my-applications",
  protect,
  permit("candidate"),
  getMyApplications
);
router.get(
  "/:jobId",
  protect,
  permit("recruiter", "admin"),
  getApplicationsForJob
);

module.exports = router;
