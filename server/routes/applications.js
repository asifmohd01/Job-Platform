const express = require("express");
const router = express.Router();
const {
  applyToJob,
  getApplicationsForJob,
  getMyApplications,
  getMyJobApplications,
  getRecruiterApplications,
  updateApplicationStatus,
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
  permit("recruiter"),
  getApplicationsForJob
);
// Get applications for a specific job
router.get(
  "/job/:jobId/applications",
  protect,
  permit("recruiter"),
  getMyJobApplications
);
// Get all applications for recruiter's jobs
router.get(
  "/recruiter/all-applications",
  protect,
  permit("recruiter"),
  getRecruiterApplications
);
// Update application status
router.put(
  "/:applicationId/status",
  protect,
  permit("recruiter"),
  updateApplicationStatus
);

module.exports = router;
