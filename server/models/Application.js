const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    candidateDetails: {
      name: String,
      email: String,
      phone: String,
      skills: [String],
      experience: Number,
      currentCompany: String,
    },
    resume: {
      url: String,
      public_id: String,
    },
    coverLetter: { type: String },
    status: {
      type: String,
      enum: ["applied", "shortlisted", "interviewed", "accepted", "rejected"],
      default: "applied",
    },
    appliedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
