const Application = require("../models/Application");
const Job = require("../models/Job");
const { uploadBuffer } = require("../services/cloudinaryUpload");

const applyToJob = async (req, res) => {
  const { jobId } = req.params;
  const job = await Job.findById(jobId);
  if (!job || job.status !== "open")
    return res.status(400).json({ message: "Job not available" });
  // prevent duplicates by unique index plus explicit check
  const exists = await Application.findOne({
    job: jobId,
    candidate: req.user._id,
  });
  if (exists)
    return res
      .status(409)
      .json({ message: "You have already applied to this job" });

  const applicationData = { job: jobId, candidate: req.user._id };
  if (req.file && req.file.buffer) {
    const result = await uploadBuffer(req.file.buffer, "resumes");
    applicationData.resume = {
      url: result.secure_url,
      public_id: result.public_id,
    };
  }
  if (req.body.coverLetter) applicationData.coverLetter = req.body.coverLetter;

  const application = await Application.create(applicationData);
  res.status(201).json({ application });
};

const getApplicationsForJob = async (req, res) => {
  const { jobId } = req.params;
  const applications = await Application.find({ job: jobId })
    .populate("candidate", "name email")
    .populate("job", "title");
  res.json({ applications });
};

const getMyApplications = async (req, res) => {
  const applications = await Application.find({ candidate: req.user._id })
    .populate("job", "title company status")
    .populate("candidate", "name email")
    .sort({ createdAt: -1 });
  res.json({ applications });
};

module.exports = { applyToJob, getApplicationsForJob, getMyApplications };
