const express = require("express");
const { protect } = require("../middlewares/auth");
const multer = require("multer");
const candidateProfileController = require("../controllers/candidateProfileController");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Get own profile (candidates)
router.get("/my-profile", protect, candidateProfileController.getMyProfile);

// Update profile summary (candidate only) - Must come before /:candidateId
router.patch(
  "/update/summary",
  protect,
  candidateProfileController.updateProfileSummary
);

// Resume operations (candidate only)
router.post(
  "/resume/upload",
  protect,
  upload.single("resume"),
  candidateProfileController.uploadResume
);
router.get(
  "/resume/view/:candidateId",
  protect,
  candidateProfileController.viewResume
);
router.get(
  "/resume/download/:candidateId",
  protect,
  candidateProfileController.downloadResume
);
router.delete("/resume", protect, candidateProfileController.deleteResume);

// Work experience operations
router.post(
  "/work-experience",
  protect,
  candidateProfileController.addWorkExperience
);
router.patch(
  "/work-experience/:experienceId",
  protect,
  candidateProfileController.updateWorkExperience
);
router.delete(
  "/work-experience/:experienceId",
  protect,
  candidateProfileController.deleteWorkExperience
);

// Skills operations
router.post("/skills", protect, candidateProfileController.addSkill);
router.delete("/skills", protect, candidateProfileController.removeSkill);

// Education operations
router.post("/education", protect, candidateProfileController.addEducation);
router.patch(
  "/education/:educationId",
  protect,
  candidateProfileController.updateEducation
);
router.delete(
  "/education/:educationId",
  protect,
  candidateProfileController.deleteEducation
);

// Job preferences
router.patch(
  "/job-preferences",
  protect,
  candidateProfileController.updateJobPreferences
);

// Personal details
router.patch(
  "/personal-details",
  protect,
  candidateProfileController.updatePersonalDetails
);

// Certifications operations
router.post(
  "/certifications",
  protect,
  candidateProfileController.addCertification
);
router.patch(
  "/certifications/:certificationId",
  protect,
  candidateProfileController.updateCertification
);
router.delete(
  "/certifications/:certificationId",
  protect,
  candidateProfileController.deleteCertification
);

// Projects operations
router.post("/projects", protect, candidateProfileController.addProject);
router.patch(
  "/projects/:projectId",
  protect,
  candidateProfileController.updateProject
);
router.delete(
  "/projects/:projectId",
  protect,
  candidateProfileController.deleteProject
);

// Awards operations
router.post("/awards", protect, candidateProfileController.addAward);
router.patch(
  "/awards/:awardId",
  protect,
  candidateProfileController.updateAward
);
router.delete(
  "/awards/:awardId",
  protect,
  candidateProfileController.deleteAward
);

// Social links
router.patch(
  "/social-links",
  protect,
  candidateProfileController.updateSocialLinks
);

// Languages operations
router.post("/languages", protect, candidateProfileController.addLanguage);
router.patch(
  "/languages/:languageId",
  protect,
  candidateProfileController.updateLanguage
);
router.delete(
  "/languages/:languageId",
  protect,
  candidateProfileController.deleteLanguage
);

// Get any candidate's profile (candidates and recruiters - read-only for recruiters) - Must be last
router.get(
  "/:candidateId",
  protect,
  candidateProfileController.getCandidateProfile
);

module.exports = router;
