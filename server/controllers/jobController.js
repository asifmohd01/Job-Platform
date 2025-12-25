const Job = require("../models/Job");

const createJob = async (req, res) => {
  const data = req.body;
  data.recruiter = req.user._id;
  const job = await Job.create(data);
  res.status(201).json({ job });
};

const updateJob = async (req, res) => {
  const { id } = req.params;
  const job = await Job.findById(id);
  if (!job) return res.status(404).json({ message: "Job not found" });
  if (!job.recruiter.equals(req.user._id) && req.user.role !== "admin")
    return res.status(403).json({ message: "Forbidden" });
  Object.assign(job, req.body);
  await job.save();
  res.json({ job });
};

const deleteJob = async (req, res) => {
  const { id } = req.params;
  const job = await Job.findById(id);
  if (!job) return res.status(404).json({ message: "Job not found" });
  if (!job.recruiter.equals(req.user._id) && req.user.role !== "admin")
    return res.status(403).json({ message: "Forbidden" });
  await Job.findByIdAndDelete(id);
  res.json({ message: "Job removed" });
};

const getJobs = async (req, res) => {
  const { location, jobType, skills } = req.query;
  const filter = { status: "open" };
  if (location) filter.location = new RegExp(location, "i");
  if (jobType) filter.jobType = jobType;
  if (skills) filter.skills = { $in: skills.split(",").map((s) => s.trim()) };
  const jobs = await Job.find(filter).populate("recruiter", "name email");
  res.json({ jobs });
};

const getJobById = async (req, res) => {
  const job = await Job.findById(req.params.id).populate(
    "recruiter",
    "name email"
  );
  if (!job) return res.status(404).json({ message: "Job not found" });
  res.json({ job });
};

module.exports = { createJob, updateJob, deleteJob, getJobs, getJobById };
