const Application = require("../models/Application");
const Job = require("../models/Job");
const { uploadBuffer } = require("../services/cloudinaryUpload");

const applyToJob = async (req, res) => {
  try {
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

    const applicationData = {
      job: jobId,
      candidate: req.user._id,
      candidateDetails: {
        name: req.body.name || req.user.name,
        email: req.body.email || req.user.email,
        phone: req.body.phone,
        skills: req.body.skills || [],
        experience: req.body.experience,
        currentCompany: req.body.currentCompany,
      },
    };

    if (req.file && req.file.buffer) {
      const result = await uploadBuffer(req.file.buffer, "resumes");
      applicationData.resume = {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }
    if (req.body.coverLetter)
      applicationData.coverLetter = req.body.coverLetter;

    const application = await Application.create(applicationData);
    const populatedApp = await application.populate([
      { path: "candidate", select: "name email" },
      { path: "job", select: "title company" },
    ]);
    res.status(201).json({ application: populatedApp });
  } catch (err) {
    console.error("Error applying to job:", err);
    res
      .status(500)
      .json({ message: "Error submitting application", error: err.message });
  }
};

const getApplicationsForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const applications = await Application.find({ job: jobId }).populate([
      { path: "candidate", select: "name email" },
      { path: "job", select: "title" },
    ]);
    res.json({ applications });
  } catch (err) {
    console.error("Error fetching job applications:", err);
    res
      .status(500)
      .json({ message: "Error fetching applications", error: err.message });
  }
};

const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ candidate: req.user._id })
      .populate([
        { path: "job", select: "title company status" },
        { path: "candidate", select: "name email" },
      ])
      .sort({ createdAt: -1 });
    res.json({ applications });
  } catch (err) {
    console.error("Error fetching my applications:", err);
    res
      .status(500)
      .json({ message: "Error fetching applications", error: err.message });
  }
};

// Get applications for all jobs posted by the recruiter
const getMyJobApplications = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // Check authorization
    if (!job.recruiter.equals(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate([{ path: "candidate", select: "name email" }])
      .sort({ createdAt: -1 });

    res.json({ applications });
  } catch (err) {
    console.error("Error fetching job applications:", err);
    res
      .status(500)
      .json({ message: "Error fetching applications", error: err.message });
  }
};

// Get all applications for recruiter's jobs
const getRecruiterApplications = async (req, res) => {
  try {
    const recruiterJobs = await Job.find({ recruiter: req.user._id }).select(
      "_id"
    );
    const jobIds = recruiterJobs.map((j) => j._id);

    const applications = await Application.find({ job: { $in: jobIds } })
      .populate([
        { path: "candidate", select: "name email" },
        { path: "job", select: "title company" },
      ])
      .sort({ createdAt: -1 });

    res.json({ applications });
  } catch (err) {
    console.error("Error fetching recruiter applications:", err);
    res
      .status(500)
      .json({ message: "Error fetching applications", error: err.message });
  }
};

// Update application status
const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    const application = await Application.findById(applicationId);
    if (!application)
      return res.status(404).json({ message: "Application not found" });

    const job = await Job.findById(application.job);
    if (!job.recruiter.equals(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    application.status = status;
    await application.save();
    const populatedApp = await application.populate([
      { path: "candidate", select: "name email" },
      { path: "job", select: "title" },
    ]);

    res.json({ application: populatedApp });
  } catch (err) {
    console.error("Error updating application status:", err);
    res
      .status(500)
      .json({ message: "Error updating application", error: err.message });
  }
};

module.exports = {
  applyToJob,
  getApplicationsForJob,
  getMyApplications,
  getMyJobApplications,
  getRecruiterApplications,
  updateApplicationStatus,
};
