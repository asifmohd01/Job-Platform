const User = require("../models/User");
const Job = require("../models/Job");

const getAllUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json({ users });
};

const blockUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  user.isBlocked = true;
  await user.save();
  res.json({ message: "User blocked" });
};

const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User removed" });
};

const getAllJobs = async (req, res) => {
  const jobs = await Job.find().populate("recruiter", "name email");
  res.json({ jobs });
};

module.exports = { getAllUsers, blockUser, deleteUser, getAllJobs };
