const express = require("express");
const router = express.Router();
const {
  createJob,
  updateJob,
  deleteJob,
  getJobs,
  getJobById,
  getMyJobs,
  saveJob,
  unsaveJob,
  getSavedJobs,
} = require("../controllers/jobController");
const { protect } = require("../middlewares/auth");
const { permit } = require("../middlewares/role");

router.get("/", getJobs);
router.get(
  "/recruiter/my-jobs",
  protect,
  permit("recruiter"),
  getMyJobs
);
router.get("/:id", getJobById);
router.post("/", protect, permit("recruiter"), createJob);
router.put("/:id", protect, permit("recruiter"), updateJob);
router.delete("/:id", protect, permit("recruiter"), deleteJob);

// Candidate saved jobs
router.post("/:id/save", protect, permit("candidate"), saveJob);
router.delete("/:id/save", protect, permit("candidate"), unsaveJob);
router.get("/me/saved", protect, permit("candidate"), getSavedJobs);

module.exports = router;
