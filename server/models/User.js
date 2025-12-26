const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["candidate", "recruiter", "admin"],
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
    // For candidates - profile information
    candidateProfile: {
      phone: String,
      location: String,
      skills: [String],
      experience: Number,
      bio: String,
      resume: {
        url: String,
        public_id: String,
      },
    },
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
