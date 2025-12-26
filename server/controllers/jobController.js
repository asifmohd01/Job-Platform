const Job = require("../models/Job");

const createJob = async (req, res) => {
  try {
    const data = req.body;
    data.recruiter = req.user._id;
    const job = await Job.create(data);
    await job.populate("recruiter", "name email");
    res.status(201).json({ job });
  } catch (err) {
    console.error("Error creating job:", err);
    res.status(500).json({ message: "Error creating job", error: err.message });
  }
};

const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (!job.recruiter.equals(req.user._id) && req.user.role !== "admin")
      return res.status(403).json({ message: "Forbidden" });
    Object.assign(job, req.body);
    await job.save();
    await job.populate("recruiter", "name email");
    res.json({ job });
  } catch (err) {
    console.error("Error updating job:", err);
    res.status(500).json({ message: "Error updating job", error: err.message });
  }
};

const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (!job.recruiter.equals(req.user._id) && req.user.role !== "admin")
      return res.status(403).json({ message: "Forbidden" });
    await Job.findByIdAndDelete(id);
    res.json({ message: "Job removed" });
  } catch (err) {
    console.error("Error deleting job:", err);
    res.status(500).json({ message: "Error deleting job", error: err.message });
  }
};

const getJobs = async (req, res) => {
  try {
    const { location, jobType, skills } = req.query;
    const filter = { status: "open" };
    if (location) filter.location = new RegExp(location, "i");
    if (jobType) filter.jobType = jobType;
    if (skills) filter.skills = { $in: skills.split(",").map((s) => s.trim()) };
    const jobs = await Job.find(filter)
      .populate("recruiter", "name email")
      .lean();
    res.json({ jobs });
  } catch (err) {
    console.error("Error fetching jobs:", err);
    res
      .status(500)
      .json({ message: "Error fetching jobs", error: err.message });
  }
};

const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "recruiter",
      "name email"
    );
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json({ job });
  } catch (err) {
    console.error("Error fetching job details:", err);
    res.status(500).json({ message: "Error fetching job", error: err.message });
  }
};

// Get jobs posted by the logged-in recruiter
const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.user._id }).populate(
      "recruiter",
      "name email"
    );
    res.json({ jobs });
  } catch (err) {
    console.error("Error fetching recruiter jobs:", err);
    res
      .status(500)
      .json({ message: "Error fetching jobs", error: err.message });
  }
};

module.exports = {
  createJob,
  updateJob,
  deleteJob,
  getJobs,
  getJobById,
  getMyJobs,
};
