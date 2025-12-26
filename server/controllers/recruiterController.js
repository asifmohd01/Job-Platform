const User = require("../models/User");
const Job = require("../models/Job");

// Update recruiter company profile
const updateCompanyProfile = async (req, res) => {
  try {
    const { name, industry, website, about } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.company = {
      name: name || user.company?.name,
      industry: industry || user.company?.industry,
      website: website || user.company?.website,
      about: about || user.company?.about,
    };

    await user.save();
    res.json({ user, message: "Company profile updated successfully" });
  } catch (err) {
    console.error("Error updating company profile:", err);
    res
      .status(500)
      .json({ message: "Error updating profile", error: err.message });
  }
};

// Get recruiter's company profile
const getCompanyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("company name email");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({
      company: user.company,
      recruiter: { name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Error fetching company profile:", err);
    res
      .status(500)
      .json({ message: "Error fetching profile", error: err.message });
  }
};

// Get recruiter dashboard data
const getRecruiterDashboard = async (req, res) => {
  try {
    const recruiter = await User.findById(req.user._id).select(
      "company name email"
    );
    const jobs = await Job.find({ recruiter: req.user._id }).lean();
    const totalJobs = jobs.length;
    const openJobs = jobs.filter((j) => j.status === "open").length;

    res.json({
      recruiter,
      stats: {
        totalJobs,
        openJobs,
        filledJobs: totalJobs - openJobs,
      },
    });
  } catch (err) {
    console.error("Error fetching recruiter dashboard:", err);
    res
      .status(500)
      .json({ message: "Error fetching dashboard", error: err.message });
  }
};

module.exports = {
  updateCompanyProfile,
  getCompanyProfile,
  getRecruiterDashboard,
};
