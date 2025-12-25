const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    department: { type: String },
    skills: [{ type: String }],
    experience: { type: Number },
    location: { type: String },
    salary: { type: String },
    jobType: {
      type: String,
      enum: ["full-time", "part-time", "contract"],
      default: "full-time",
    },
    description: { type: String },
    company: {
      name: { type: String, required: true },
      logo: { type: String },
      website: { type: String },
      about: { type: String },
      industry: { type: String },
    },
    status: { type: String, enum: ["open", "filled"], default: "open" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
