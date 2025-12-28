const User = require("../models/User");
const { uploadBuffer } = require("../services/cloudinaryUpload");

// Get candidate's own profile
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ profile: user.candidateProfile || {} });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res
      .status(500)
      .json({ message: "Error fetching profile", error: err.message });
  }
};

// Get another candidate's profile (read-only for recruiters)
const getCandidateProfile = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const candidate = await User.findById(candidateId).select("-password");

    if (!candidate || candidate.role !== "candidate") {
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.json({ profile: candidate.candidateProfile || {} });
  } catch (err) {
    console.error("Error fetching candidate profile:", err);
    res
      .status(500)
      .json({ message: "Error fetching profile", error: err.message });
  }
};

// Update profile summary
const updateProfileSummary = async (req, res) => {
  try {
    const { summary } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { "candidateProfile.summary": summary },
      { new: true }
    ).select("-password");

    res.json({ profile: user.candidateProfile });
  } catch (err) {
    console.error("Error updating summary:", err);
    res
      .status(500)
      .json({ message: "Error updating summary", error: err.message });
  }
};

// Upload/Update resume
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
    }

    // Check file size (6MB limit)
    const maxSize = 6 * 1024 * 1024;
    if (req.file.size > maxSize) {
      return res.status(400).json({ message: "File size exceeds 6MB limit" });
    }

    // Check file type
    const allowedMimes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/rtf",
      "text/rtf",
    ];
    if (!allowedMimes.includes(req.file.mimetype)) {
      return res.status(400).json({
        message: "Invalid file format. Supported: PDF, DOC, DOCX, RTF",
      });
    }

    const result = await uploadBuffer(req.file.buffer, "resumes");

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        "candidateProfile.resume": {
          url: result.secure_url,
          public_id: result.public_id,
          fileName: req.file.originalname,
        },
      },
      { new: true }
    ).select("-password");

    res.json({ profile: user.candidateProfile });
  } catch (err) {
    console.error("Error uploading resume:", err);
    res
      .status(500)
      .json({ message: "Error uploading resume", error: err.message });
  }
};

// Delete resume
const deleteResume = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.candidateProfile?.resume?.public_id) {
      // Note: Would need to implement cloudinary deletion separately
      // For now, just removing from database
    }

    user.candidateProfile.resume = null;
    await user.save();

    res.json({ profile: user.candidateProfile });
  } catch (err) {
    console.error("Error deleting resume:", err);
    res
      .status(500)
      .json({ message: "Error deleting resume", error: err.message });
  }
};

// Add work experience
const addWorkExperience = async (req, res) => {
  try {
    const {
      companyName,
      jobTitle,
      employmentType,
      startDate,
      endDate,
      currentlyWorking,
      industry,
      description,
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user.candidateProfile) {
      user.candidateProfile = {};
    }
    if (!user.candidateProfile.workExperience) {
      user.candidateProfile.workExperience = [];
    }

    user.candidateProfile.workExperience.push({
      companyName,
      jobTitle,
      employmentType,
      startDate,
      endDate: currentlyWorking ? null : endDate,
      currentlyWorking,
      industry,
      description,
    });

    await user.save();
    res.json({ profile: user.candidateProfile });
  } catch (err) {
    console.error("Error adding work experience:", err);
    res
      .status(500)
      .json({ message: "Error adding work experience", error: err.message });
  }
};

// Update work experience
const updateWorkExperience = async (req, res) => {
  try {
    const { experienceId } = req.params;
    const {
      companyName,
      jobTitle,
      employmentType,
      startDate,
      endDate,
      currentlyWorking,
      industry,
      description,
    } = req.body;

    const user = await User.findById(req.user._id);
    const experience = user.candidateProfile.workExperience.id(experienceId);

    if (!experience) {
      return res.status(404).json({ message: "Experience not found" });
    }

    experience.companyName = companyName;
    experience.jobTitle = jobTitle;
    experience.employmentType = employmentType;
    experience.startDate = startDate;
    experience.endDate = currentlyWorking ? null : endDate;
    experience.currentlyWorking = currentlyWorking;
    experience.industry = industry;
    experience.description = description;

    await user.save();
    res.json({ profile: user.candidateProfile });
  } catch (err) {
    console.error("Error updating work experience:", err);
    res
      .status(500)
      .json({ message: "Error updating work experience", error: err.message });
  }
};

// Delete work experience
const deleteWorkExperience = async (req, res) => {
  try {
    const { experienceId } = req.params;
    const user = await User.findById(req.user._id);

    user.candidateProfile.workExperience =
      user.candidateProfile.workExperience.filter(
        (exp) => exp._id.toString() !== experienceId
      );

    await user.save();
    res.json({ profile: user.candidateProfile });
  } catch (err) {
    console.error("Error deleting work experience:", err);
    res
      .status(500)
      .json({ message: "Error deleting work experience", error: err.message });
  }
};

// Add skill
const addSkill = async (req, res) => {
  try {
    const { skill } = req.body;
    const user = await User.findById(req.user._id);

    if (!user.candidateProfile) {
      user.candidateProfile = {};
    }
    if (!user.candidateProfile.skills) {
      user.candidateProfile.skills = [];
    }

    if (!user.candidateProfile.skills.includes(skill)) {
      user.candidateProfile.skills.push(skill);
    }

    await user.save();
    res.json({ profile: user.candidateProfile });
  } catch (err) {
    console.error("Error adding skill:", err);
    res.status(500).json({ message: "Error adding skill", error: err.message });
  }
};

// Remove skill
const removeSkill = async (req, res) => {
  try {
    const { skill } = req.body;
    const user = await User.findById(req.user._id);

    user.candidateProfile.skills = user.candidateProfile.skills.filter(
      (s) => s !== skill
    );
    await user.save();

    res.json({ profile: user.candidateProfile });
  } catch (err) {
    console.error("Error removing skill:", err);
    res
      .status(500)
      .json({ message: "Error removing skill", error: err.message });
  }
};

// Add education
const addEducation = async (req, res) => {
  try {
    const { degree, institute, yearOfCompletion } = req.body;
    const user = await User.findById(req.user._id);

    if (!user.candidateProfile) {
      user.candidateProfile = {};
    }
    if (!user.candidateProfile.education) {
      user.candidateProfile.education = [];
    }

    user.candidateProfile.education.push({
      degree,
      institute,
      yearOfCompletion,
    });

    await user.save();
    res.json({ profile: user.candidateProfile });
  } catch (err) {
    console.error("Error adding education:", err);
    res
      .status(500)
      .json({ message: "Error adding education", error: err.message });
  }
};

// Update education
const updateEducation = async (req, res) => {
  try {
    const { educationId } = req.params;
    const { degree, institute, yearOfCompletion } = req.body;
    const user = await User.findById(req.user._id);

    const education = user.candidateProfile.education.id(educationId);
    if (!education) {
      return res.status(404).json({ message: "Education not found" });
    }

    education.degree = degree;
    education.institute = institute;
    education.yearOfCompletion = yearOfCompletion;

    await user.save();
    res.json({ profile: user.candidateProfile });
  } catch (err) {
    console.error("Error updating education:", err);
    res
      .status(500)
      .json({ message: "Error updating education", error: err.message });
  }
};

// Delete education
const deleteEducation = async (req, res) => {
  try {
    const { educationId } = req.params;
    const user = await User.findById(req.user._id);

    user.candidateProfile.education = user.candidateProfile.education.filter(
      (edu) => edu._id.toString() !== educationId
    );

    await user.save();
    res.json({ profile: user.candidateProfile });
  } catch (err) {
    console.error("Error deleting education:", err);
    res
      .status(500)
      .json({ message: "Error deleting education", error: err.message });
  }
};

// Update job preferences
const updateJobPreferences = async (req, res) => {
  try {
    const { preferredJobTitles, preferredLocations } = req.body;
    const user = await User.findById(req.user._id);

    if (!user.candidateProfile) {
      user.candidateProfile = {};
    }
    if (!user.candidateProfile.jobPreferences) {
      user.candidateProfile.jobPreferences = {};
    }

    user.candidateProfile.jobPreferences = {
      preferredJobTitles: preferredJobTitles || [],
      preferredLocations: preferredLocations || [],
    };

    await user.save();
    res.json({ profile: user.candidateProfile });
  } catch (err) {
    console.error("Error updating job preferences:", err);
    res
      .status(500)
      .json({ message: "Error updating job preferences", error: err.message });
  }
};

// Update personal details
const updatePersonalDetails = async (req, res) => {
  try {
    const { country, nationality, workPermitStatus, speciallyAbled } = req.body;
    const user = await User.findById(req.user._id);

    if (!user.candidateProfile) {
      user.candidateProfile = {};
    }
    if (!user.candidateProfile.personalDetails) {
      user.candidateProfile.personalDetails = {};
    }

    user.candidateProfile.personalDetails = {
      country,
      nationality,
      workPermitStatus,
      speciallyAbled,
    };

    await user.save();
    res.json({ profile: user.candidateProfile });
  } catch (err) {
    console.error("Error updating personal details:", err);
    res
      .status(500)
      .json({ message: "Error updating personal details", error: err.message });
  }
};

// Add certification
const addCertification = async (req, res) => {
  try {
    const { name, issuingOrganization, year } = req.body;
    const user = await User.findById(req.user._id);

    if (!user.candidateProfile) {
      user.candidateProfile = {};
    }
    if (!user.candidateProfile.certifications) {
      user.candidateProfile.certifications = [];
    }

    user.candidateProfile.certifications.push({
      name,
      issuingOrganization,
      year,
    });

    await user.save();
    res.json({ profile: user.candidateProfile });
  } catch (err) {
    console.error("Error adding certification:", err);
    res
      .status(500)
      .json({ message: "Error adding certification", error: err.message });
  }
};

// Update certification
const updateCertification = async (req, res) => {
  try {
    const { certificationId } = req.params;
    const { name, issuingOrganization, year } = req.body;
    const user = await User.findById(req.user._id);

    const cert = user.candidateProfile.certifications.id(certificationId);
    if (!cert) {
      return res.status(404).json({ message: "Certification not found" });
    }

    cert.name = name;
    cert.issuingOrganization = issuingOrganization;
    cert.year = year;

    await user.save();
    res.json({ profile: user.candidateProfile });
  } catch (err) {
    console.error("Error updating certification:", err);
    res
      .status(500)
      .json({ message: "Error updating certification", error: err.message });
  }
};

// Delete certification
const deleteCertification = async (req, res) => {
  try {
    const { certificationId } = req.params;
    const user = await User.findById(req.user._id);

    user.candidateProfile.certifications =
      user.candidateProfile.certifications.filter(
        (cert) => cert._id.toString() !== certificationId
      );

    await user.save();
    res.json({ profile: user.candidateProfile });
  } catch (err) {
    console.error("Error deleting certification:", err);
    res
      .status(500)
      .json({ message: "Error deleting certification", error: err.message });
  }
};

// Add project
const addProject = async (req, res) => {
  try {
    const { name, description, techStack, githubLink, liveLink } = req.body;
    const user = await User.findById(req.user._id);

    if (!user.candidateProfile) {
      user.candidateProfile = {};
    }
    if (!user.candidateProfile.projects) {
      user.candidateProfile.projects = [];
    }

    user.candidateProfile.projects.push({
      name,
      description,
      techStack,
      githubLink,
      liveLink,
    });

    await user.save();
    res.json({ profile: user.candidateProfile });
  } catch (err) {
    console.error("Error adding project:", err);
    res
      .status(500)
      .json({ message: "Error adding project", error: err.message });
  }
};

// Update project
const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, description, techStack, githubLink, liveLink } = req.body;
    const user = await User.findById(req.user._id);

    const project = user.candidateProfile.projects.id(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    project.name = name;
    project.description = description;
    project.techStack = techStack;
    project.githubLink = githubLink;
    project.liveLink = liveLink;

    await user.save();
    res.json({ profile: user.candidateProfile });
  } catch (err) {
    console.error("Error updating project:", err);
    res
      .status(500)
      .json({ message: "Error updating project", error: err.message });
  }
};

// Delete project
const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const user = await User.findById(req.user._id);

    user.candidateProfile.projects = user.candidateProfile.projects.filter(
      (proj) => proj._id.toString() !== projectId
    );

    await user.save();
    res.json({ profile: user.candidateProfile });
  } catch (err) {
    console.error("Error deleting project:", err);
    res
      .status(500)
      .json({ message: "Error deleting project", error: err.message });
  }
};

// Add award
const addAward = async (req, res) => {
  try {
    const { title, awardedBy, year, description } = req.body;
    const user = await User.findById(req.user._id);

    if (!user.candidateProfile) {
      user.candidateProfile = {};
    }
    if (!user.candidateProfile.awards) {
      user.candidateProfile.awards = [];
    }

    user.candidateProfile.awards.push({
      title,
      awardedBy,
      year,
      description,
    });

    await user.save();
    res.json({ profile: user.candidateProfile });
  } catch (err) {
    console.error("Error adding award:", err);
    res.status(500).json({ message: "Error adding award", error: err.message });
  }
};

// Update award
const updateAward = async (req, res) => {
  try {
    const { awardId } = req.params;
    const { title, awardedBy, year, description } = req.body;
    const user = await User.findById(req.user._id);

    const award = user.candidateProfile.awards.id(awardId);
    if (!award) {
      return res.status(404).json({ message: "Award not found" });
    }

    award.title = title;
    award.awardedBy = awardedBy;
    award.year = year;
    award.description = description;

    await user.save();
    res.json({ profile: user.candidateProfile });
  } catch (err) {
    console.error("Error updating award:", err);
    res
      .status(500)
      .json({ message: "Error updating award", error: err.message });
  }
};

// Delete award
const deleteAward = async (req, res) => {
  try {
    const { awardId } = req.params;
    const user = await User.findById(req.user._id);

    user.candidateProfile.awards = user.candidateProfile.awards.filter(
      (award) => award._id.toString() !== awardId
    );

    await user.save();
    res.json({ profile: user.candidateProfile });
  } catch (err) {
    console.error("Error deleting award:", err);
    res
      .status(500)
      .json({ message: "Error deleting award", error: err.message });
  }
};

// Update social links
const updateSocialLinks = async (req, res) => {
  try {
    const { linkedin, github, portfolio, other } = req.body;
    const user = await User.findById(req.user._id);

    if (!user.candidateProfile) {
      user.candidateProfile = {};
    }
    if (!user.candidateProfile.socialLinks) {
      user.candidateProfile.socialLinks = {};
    }

    user.candidateProfile.socialLinks = {
      linkedin,
      github,
      portfolio,
      other,
    };

    await user.save();
    res.json({ profile: user.candidateProfile });
  } catch (err) {
    console.error("Error updating social links:", err);
    res
      .status(500)
      .json({ message: "Error updating social links", error: err.message });
  }
};

// Add language
const addLanguage = async (req, res) => {
  try {
    const { language, proficiencyLevel } = req.body;
    const user = await User.findById(req.user._id);

    if (!user.candidateProfile) {
      user.candidateProfile = {};
    }
    if (!user.candidateProfile.languages) {
      user.candidateProfile.languages = [];
    }

    user.candidateProfile.languages.push({
      language,
      proficiencyLevel,
    });

    await user.save();
    res.json({ profile: user.candidateProfile });
  } catch (err) {
    console.error("Error adding language:", err);
    res
      .status(500)
      .json({ message: "Error adding language", error: err.message });
  }
};

// Update language
const updateLanguage = async (req, res) => {
  try {
    const { languageId } = req.params;
    const { language, proficiencyLevel } = req.body;
    const user = await User.findById(req.user._id);

    const lang = user.candidateProfile.languages.id(languageId);
    if (!lang) {
      return res.status(404).json({ message: "Language not found" });
    }

    lang.language = language;
    lang.proficiencyLevel = proficiencyLevel;

    await user.save();
    res.json({ profile: user.candidateProfile });
  } catch (err) {
    console.error("Error updating language:", err);
    res
      .status(500)
      .json({ message: "Error updating language", error: err.message });
  }
};

// Delete language
const deleteLanguage = async (req, res) => {
  try {
    const { languageId } = req.params;
    const user = await User.findById(req.user._id);

    user.candidateProfile.languages = user.candidateProfile.languages.filter(
      (lang) => lang._id.toString() !== languageId
    );

    await user.save();
    res.json({ profile: user.candidateProfile });
  } catch (err) {
    console.error("Error deleting language:", err);
    res
      .status(500)
      .json({ message: "Error deleting language", error: err.message });
  }
};

// Helper function to check if user can access a candidate's resume
const canAccessResume = async (req, candidateId) => {
  const requestingUserId = req.user?._id?.toString();
  const targetCandidateId = candidateId?.toString();

  // User accessing their own resume
  if (requestingUserId === targetCandidateId) {
    return true;
  }

  // Recruiter accessing applied candidate's resume
  if (req.user?.role === "recruiter") {
    const Application = require("../models/Application");
    const hasApplication = await Application.findOne({
      candidate: candidateId,
      recruiter: requestingUserId,
    });
    return !!hasApplication;
  }

  return false;
};

// View resume (opens in browser)
const viewResume = async (req, res) => {
  try {
    const { candidateId } = req.params;

    if (!candidateId) {
      return res.status(400).json({ message: "Candidate ID required" });
    }

    // Check if user has permission to view this resume
    const hasAccess = await canAccessResume(req, candidateId);
    if (!hasAccess) {
      return res
        .status(403)
        .json({ message: "You don't have permission to view this resume" });
    }

    const user = await User.findById(candidateId);
    if (!user || !user.candidateProfile?.resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    const resumeUrl = user.candidateProfile.resume.url;
    const fileName = user.candidateProfile.resume.fileName;

    // Stream the remote file through the backend so it remains inside the app
    const parsedUrl = new URL(resumeUrl);
    const protocol =
      parsedUrl.protocol === "https:" ? require("https") : require("http");

    // Set inline disposition for in-app display
    res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);

    protocol
      .get(resumeUrl, (cloudRes) => {
        // Forward content-type if available
        if (cloudRes.headers["content-type"]) {
          res.setHeader("Content-Type", cloudRes.headers["content-type"]);
        }
        // Pipe remote response directly to client
        cloudRes.pipe(res);
        cloudRes.on("end", () => {
          // end handled by pipe
        });
      })
      .on("error", (err) => {
        console.error("Error streaming resume from remote:", err);
        return res
          .status(500)
          .json({ message: "Error streaming resume", error: err.message });
      });
  } catch (err) {
    console.error("Error viewing resume:", err);
    res
      .status(500)
      .json({ message: "Error viewing resume", error: err.message });
  }
};

// Download resume (force download)
const downloadResume = async (req, res) => {
  try {
    const { candidateId } = req.params;

    if (!candidateId) {
      return res.status(400).json({ message: "Candidate ID required" });
    }

    // Check if user has permission to download this resume
    const hasAccess = await canAccessResume(req, candidateId);
    if (!hasAccess) {
      return res
        .status(403)
        .json({ message: "You don't have permission to download this resume" });
    }

    const user = await User.findById(candidateId);
    if (!user || !user.candidateProfile?.resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    const resumeUrl = user.candidateProfile.resume.url;
    const fileName = user.candidateProfile.resume.fileName;

    // Stream the remote file through the backend and force download dialog
    const parsedUrl = new URL(resumeUrl);
    const protocol =
      parsedUrl.protocol === "https:" ? require("https") : require("http");

    // Set attachment disposition for download
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    protocol
      .get(resumeUrl, (cloudRes) => {
        if (cloudRes.headers["content-type"]) {
          res.setHeader("Content-Type", cloudRes.headers["content-type"]);
        }
        cloudRes.pipe(res);
      })
      .on("error", (err) => {
        console.error("Error streaming resume for download:", err);
        return res
          .status(500)
          .json({ message: "Error downloading resume", error: err.message });
      });
  } catch (err) {
    console.error("Error downloading resume:", err);
    res
      .status(500)
      .json({ message: "Error downloading resume", error: err.message });
  }
};

module.exports = {
  getMyProfile,
  getCandidateProfile,
  updateProfileSummary,
  uploadResume,
  viewResume,
  downloadResume,
  deleteResume,
  addWorkExperience,
  updateWorkExperience,
  deleteWorkExperience,
  addSkill,
  removeSkill,
  addEducation,
  updateEducation,
  deleteEducation,
  updateJobPreferences,
  updatePersonalDetails,
  addCertification,
  updateCertification,
  deleteCertification,
  addProject,
  updateProject,
  deleteProject,
  addAward,
  updateAward,
  deleteAward,
  updateSocialLinks,
  addLanguage,
  updateLanguage,
  deleteLanguage,
};
