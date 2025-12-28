const User = require("../models/User");
const Job = require("../models/Job");

// Simple rule-based matching without external AI
function computeMatch(candidate, job) {
  const result = {
    score: 0,
    breakdown: { skills: 0, experience: 0, location: 0 },
    details: { matchedSkills: [], missingSkills: [] },
  };

  if (!candidate || !job) return result;

  const candSkills = Array.isArray(candidate.candidateProfile?.skills)
    ? candidate.candidateProfile.skills.map((s) => (s || "").toLowerCase())
    : [];
  const jobSkills = Array.isArray(job.skills)
    ? job.skills.map((s) => (s || "").toLowerCase())
    : [];

  const matched = jobSkills.filter((s) => candSkills.includes(s));
  const missing = jobSkills.filter((s) => !candSkills.includes(s));

  const skillsScore = jobSkills.length
    ? Math.round((matched.length / jobSkills.length) * 100)
    : 0;

  const candExp = Number(candidate.candidateProfile?.experience || 0);
  const jobExp = Number(job.experience || 0);
  let expScore = 100;
  if (jobExp > 0) {
    const diff = Math.max(0, jobExp - candExp);
    expScore = Math.max(0, Math.round(100 - diff * 20)); // -20 per missing year
  }

  const candLocations = Array.isArray(
    candidate.candidateProfile?.jobPreferences?.preferredLocations
  )
    ? candidate.candidateProfile.jobPreferences.preferredLocations.map((l) =>
        (l || "").toLowerCase()
      )
    : [];
  const jobLoc = (job.location || "").toLowerCase();
  const locScore = jobLoc && candLocations.length
    ? candLocations.some((l) => jobLoc.includes(l) || l.includes(jobLoc))
      ? 100
      : 50
    : 70; // neutral if no data

  // Weighted blend
  const weighted = Math.round(skillsScore * 0.6 + expScore * 0.25 + locScore * 0.15);

  result.score = weighted;
  result.breakdown = { skills: skillsScore, experience: expScore, location: locScore };
  result.details = { matchedSkills: matched, missingSkills: missing };
  return result;
}

// POST /api/ai/match { candidateId, jobId }
const match = async (req, res) => {
  try {
    const { candidateId, jobId } = req.body || {};
    if (!candidateId || !jobId) {
      return res.status(400).json({ message: "candidateId and jobId are required" });
    }
    const [candidate, job] = await Promise.all([
      User.findById(candidateId).select("role candidateProfile"),
      Job.findById(jobId).select("skills experience location title"),
    ]);
    if (!candidate || candidate.role !== "candidate") {
      return res.status(404).json({ message: "Candidate not found" });
    }
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    const result = computeMatch(candidate, job);
    res.json({ match: result, job: { id: job.id, title: job.title } });
  } catch (err) {
    console.error("AI match error:", err);
    res.status(500).json({ message: "Failed to compute match", error: err.message });
  }
};

// Generic AI call placeholder
const call = async (req, res) => {
  res.status(501).json({ message: "AI provider not configured" });
};

module.exports = { match, call };
// JD Enhancer: creates a clearer, structured description
function enhanceJD(payload = {}) {
  const title = (payload.title || "").trim();
  const base = (payload.description || "").trim();
  const skills = Array.isArray(payload.skills) ? payload.skills.filter(Boolean) : [];
  const experience = Number(payload.experience || 0);
  const location = (payload.location || "").trim();
  const jobType = (payload.jobType || "full-time").trim();

  const heading = title ? `${title} (${jobType}, ${location || "Location Flexible"})` : "Role Overview";
  const responsibilities = [
    "Design, build, and maintain high-quality features",
    "Collaborate with cross-functional teams to deliver product goals",
    "Write clean, testable, and maintainable code",
    "Participate in code reviews and knowledge sharing",
  ];
  const requirements = [
    experience > 0 ? `${experience}+ years of relevant experience` : "Relevant experience in similar roles",
    skills.length ? `Hands-on with: ${skills.join(", ")}` : "Familiarity with modern tools and frameworks",
    "Strong problem-solving and communication skills",
    "Ownership mindset and attention to detail",
  ];

  const enhanced = [
    `About the Role — ${heading}`,
    base ? `\n${base}` : "\nWe are looking for a motivated professional to join our team and make meaningful impact from day one.",
    "\nKey Responsibilities:",
    ...responsibilities.map((r) => `- ${r}`),
    "\nRequirements:",
    ...requirements.map((r) => `- ${r}`),
  ].join("\n");

  return { enhancedDescription: enhanced, checklist: { responsibilities, requirements } };
}

// POST /api/ai/jd-enhance { title, description, skills, experience, location, jobType }
const jdEnhance = async (req, res) => {
  try {
    const result = enhanceJD(req.body || {});
    return res.json(result);
  } catch (err) {
    console.error("JD enhance error:", err);
    return res.status(500).json({ message: "Failed to enhance JD", error: err.message });
  }
};

module.exports.jdEnhance = jdEnhance;
