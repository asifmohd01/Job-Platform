import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jobsAPI, applicationsAPI } from "../services/apiClient";
import { useAuth } from "../context/AuthContext";

export default function JobDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applying, setApplying] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [formData, setFormData] = useState({
    email: user?.email || "",
    phone: "",
    coverLetter: "",
    resume: null,
  });

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const { data } = await jobsAPI.getJobById(id);
      const jobData = data.job || data;
      setJob(jobData);
      setError("");
      
      // Check if user has already applied
      if (user && user.role === "candidate") {
        try {
          const { data: appData } = await applicationsAPI.getMyApplications();
          const myApps = appData.applications || [];
          const hasApp = myApps.some(app => app.job?._id === id);
          setHasApplied(hasApp);
          // Check saved state
          try {
            const { data: savedData } = await jobsAPI.getSavedJobs();
            const ids = (savedData.jobs || []).map((j) => j._id);
            setIsSaved(ids.includes(id));
          } catch (se) {
            console.error("Failed to load saved jobs", se);
          }
        } catch (e) {
          console.error("Failed to check applications", e);
        }
      }
    } catch (err) {
      setError("Failed to load job details.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = async () => {
    if (!user || user.role !== "candidate") return;
    try {
      if (isSaved) {
        await jobsAPI.unsaveJob(id);
        setIsSaved(false);
      } else {
        await jobsAPI.saveJob(id);
        setIsSaved(true);
      }
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to update saved job");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "resume") {
      setFormData((prev) => ({
        ...prev,
        resume: files ? files[0] : null,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate("/login");
      return;
    }

    try {
      setApplying(true);

      const form = new FormData();
      form.append("email", formData.email);
      form.append("phone", formData.phone);
      form.append("coverLetter", formData.coverLetter);
      if (formData.resume) {
        form.append("resume", formData.resume);
      }

      await applicationsAPI.apply(id, form);

      alert("Application submitted successfully!");
      setHasApplied(true);
      setShowApplyForm(false);
      setFormData({
        email: "",
        phone: "",
        coverLetter: "",
        resume: null,
      });
      await fetchJob();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit application");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400 text-lg">Loading job details...</div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-lg">{error || "Job not found"}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/jobs")}
          className="text-blue-400 hover:text-blue-300 mb-6 flex items-center gap-2"
        >
          ← Back to Jobs
        </button>

        {/* Main Content */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column - Job Details */}
          <div className="md:col-span-2">
            {/* Job Header */}
            <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    {job.title}
                  </h1>
                  <p className="text-xl text-blue-400 font-semibold">
                    {job.company?.name || "Company"}
                  </p>
                </div>
                <span className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold">
                  {job.jobType}
                </span>
              </div>

              {/* Key Info Grid */}
              <div className="grid md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-700 rounded-lg">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Location</p>
                  <p className="text-white font-semibold">📍 {job.location}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Salary</p>
                  <p className="text-white font-semibold">💰 {job.salary}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Experience</p>
                  <p className="text-white font-semibold">
                    📊{" "}
                    {job.experience
                      ? `${job.experience} years`
                      : "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Status</p>
                  <p
                    className={`font-semibold ${
                      job.status === "open" ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {job.status === "open" ? "🟢 Open" : "🔴 Filled"}
                  </p>
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 mb-6">
              <h2 className="text-2xl font-bold text-white mb-4">
                About This Job
              </h2>
              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                {job.description}
              </p>
            </div>

            {/* Required Skills */}
            {job.skills && job.skills.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 mb-6">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Required Skills
                </h2>
                <div className="flex flex-wrap gap-3">
                  {job.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-600 bg-opacity-30 border border-blue-500 text-blue-200 px-4 py-2 rounded-lg font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Company & Apply */}
          <div>
            {/* Company Card */}
            {job.company && (
              <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 mb-6 sticky top-4">
                <h3 className="text-xl font-bold text-white mb-4">
                  About Company
                </h3>

                <div className="mb-4">
                  <p className="text-gray-400 text-sm mb-1">Company Name</p>
                  <p className="text-white font-semibold text-lg">
                    {job.company.name}
                  </p>
                </div>

                {job.company?.industry && (
                  <div className="mb-4">
                    <p className="text-gray-400 text-sm mb-1">Industry</p>
                    <p className="text-white">{job.company.industry}</p>
                  </div>
                )}

                {job.company?.about && (
                  <div className="mb-4">
                    <p className="text-gray-400 text-sm mb-2">About</p>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {job.company.about}
                    </p>
                  </div>
                )}

                {job.company.website && (
                  <div className="mb-6">
                    <a
                      href={job.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2"
                    >
                      🌐 Visit Website
                    </a>
                  </div>
                )}

                <hr className="border-gray-700 my-6" />

                {/* Save & Apply */}
                {user && user.role === "candidate" && (
                  <button
                    onClick={toggleSave}
                    className={`w-full mb-3 font-bold py-2 px-4 rounded-lg transition ${
                      isSaved
                        ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                        : "bg-gray-700 hover:bg-gray-600 text-white"
                    }`}
                  >
                    {isSaved ? "Saved" : "Save Job"}
                  </button>
                )}

                {/* Apply Button */}
                {job.status === "open" && (
                  <>
                    {user && user.role === "candidate" ? (
                      hasApplied ? (
                        <div className="w-full bg-green-500 bg-opacity-20 border border-green-500 text-green-200 px-4 py-3 rounded-lg text-center font-semibold">
                          ✓ Applied
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowApplyForm(!showApplyForm)}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition mb-3"
                        >
                          {showApplyForm ? "Cancel" : "Apply Now"}
                        </button>
                      )
                    ) : user ? (
                      <div className="bg-yellow-500 bg-opacity-20 border border-yellow-500 text-yellow-200 px-4 py-3 rounded-lg text-sm">
                        Only job seekers can apply. Switch to candidate account.
                      </div>
                    ) : (
                      <button
                        onClick={() => navigate("/login")}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition"
                      >
                        Sign In to Apply
                      </button>
                    )}
                  </>
                )}

                {job.status === "filled" && (
                  <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
                    This position has been filled.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Apply Form Modal */}
        {showApplyForm && user && user.role === "candidate" && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Submit Your Application
                </h2>
                <button
                  onClick={() => setShowApplyForm(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleApplySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Resume (PDF)
                  </label>
                  <input
                    type="file"
                    name="resume"
                    onChange={handleInputChange}
                    accept=".pdf,.doc,.docx"
                    // Optional: allow application without resume if backend/cloud storage isn't configured
                    required={false}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white file:text-blue-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cover Letter
                  </label>
                  <textarea
                    name="coverLetter"
                    value={formData.coverLetter}
                    onChange={handleInputChange}
                    required
                    rows="5"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    placeholder="Tell us why you're a great fit for this role..."
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={applying}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white font-bold py-2 px-6 rounded-lg transition"
                  >
                    {applying ? "Submitting..." : "Submit Application"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowApplyForm(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
