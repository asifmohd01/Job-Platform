const express = require("express");
const router = express.Router();
const {
  createJob,
  updateJob,
  deleteJob,
  getJobs,
  getJobById,
  getMyJobs,
} = require("../controllers/jobController");
const { protect } = require("../middlewares/auth");
const { permit } = require("../middlewares/role");

router.get("/", getJobs);
router.get(
  "/recruiter/my-jobs",
  protect,
  permit("recruiter", "admin"),
  getMyJobs
);
router.get("/:id", getJobById);
router.post("/", protect, permit("recruiter", "admin"), createJob);
router.put("/:id", protect, permit("recruiter", "admin"), updateJob);
router.delete("/:id", protect, permit("recruiter", "admin"), deleteJob);

module.exports = router;
