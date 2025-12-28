const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["candidate", "recruiter"],
      default: "candidate",
    },
    profilePhoto: {
      url: String,
      public_id: String,
    },
    // For recruiters - company information
    company: {
      name: String,
      industry: String,
      website: String,
      about: String,
      logo: String,
    },
    // For candidates - comprehensive profile information
    candidateProfile: {
      // 1. Profile Summary
      summary: String,

      // 2. Resume
      resume: {
        url: String,
        public_id: String,
        fileName: String,
      },

      // 3. Work Experience (multiple entries)
      workExperience: [
        {
          companyName: String,
          jobTitle: String,
          employmentType: String, // Full-time, Part-time, Contract, etc.
          startDate: Date,
          endDate: Date,
          currentlyWorking: Boolean,
          industry: String,
          description: String,
        },
      ],

      // 4. Skills
      skills: [String],

      // 5. Education (multiple entries)
      education: [
        {
          degree: String,
          institute: String,
          yearOfCompletion: Number,
          cgpa: String,
        },
      ],

      // 6. Job Preferences
      jobPreferences: {
        preferredJobTitles: [String],
        preferredLocations: [String],
      },

      // 7. Personal Details
      personalDetails: {
        country: String,
        nationality: String,
        workPermitStatus: String,
        speciallyAbled: Boolean,
      },

      // 8. Courses & Certifications (multiple entries)
      certifications: [
        {
          name: String,
          issuingOrganization: String,
          year: Number,
        },
      ],

      // 9. Projects (multiple entries)
      projects: [
        {
          name: String,
          description: String,
          techStack: [String],
          githubLink: String,
          liveLink: String,
        },
      ],

      // 10. Awards (multiple entries)
      awards: [
        {
          title: String,
          awardedBy: String,
          year: Number,
          description: String,
        },
      ],

      // 11. Social Links
      socialLinks: {
        linkedin: String,
        github: String,
        portfolio: String,
        other: String,
      },

      // 12. Languages (multiple entries)
      languages: [
        {
          language: String,
          proficiencyLevel: String, // Beginner, Intermediate, Professional, Fluent
        },
      ],

      // Legacy fields for backward compatibility
      phone: String,
      location: String,
      experience: Number,
      bio: String,
    },
    isBlocked: { type: Boolean, default: false },
    // Saved jobs (candidate bookmarks)
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
