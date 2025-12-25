const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  blockUser,
  deleteUser,
  getAllJobs,
} = require("../controllers/adminController");
const { protect } = require("../middlewares/auth");
const { permit } = require("../middlewares/role");

router.use(protect, permit("admin"));
router.get("/users", getAllUsers);
router.put("/users/:id/block", blockUser);
router.delete("/users/:id", deleteUser);
router.get("/jobs", getAllJobs);

module.exports = router;
