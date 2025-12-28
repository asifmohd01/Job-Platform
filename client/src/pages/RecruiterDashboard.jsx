import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { jobsAPI, applicationsAPI, recruiterAPI } from "../services/apiClient";

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [applications, setApplications] = useState([]);
  const [showApplications, setShowApplications] = useState(false);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    jobType: "full-time",
    salary: "",
    skills: "",
    department: "",
    experience: "",
    company: {
      name: "",
      website: "",
      about: "",
      industry: "",
    },
  });

  useEffect(() => {
    if (user?.role !== "recruiter") {
      navigate("/");
      return;
    }
    fetchJobs();
  }, [user, navigate]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data } = await jobsAPI.getMyJobs();
      setJobs(Array.isArray(data.jobs) ? data.jobs : []);
      setError("");
    } catch (err) {
      setError("Failed to load jobs.");
      console.error(err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      setApplicationsLoading(true);
      const { data } = await applicationsAPI.getRecruiterApplications();
      setApplications(
        Array.isArray(data.applications) ? data.applications : []
      );
    } catch (err) {
      console.error("Failed to load applications:", err);
      setApplications([]);
    } finally {
      setApplicationsLoading(false);
    }
  };

  const toggleApplications = () => {
    if (!showApplications) {
      fetchApplications();
    }
    setShowApplications(!showApplications);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("company.")) {
      const field = name.replace("company.", "");
      setFormData((prev) => ({
        ...prev,
        company: {
          ...prev.company,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const jobData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        jobType: formData.jobType,
        salary: formData.salary,
        skills: formData.skills
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s),
        department: formData.department,
        experience: parseInt(formData.experience) || null,
        company: {
          name: formData.company.name,
          website: formData.company.website,
          about: formData.company.about,
          industry: formData.company.industry,
        },
      };

      if (editingJobId) {
        await jobsAPI.updateJob(editingJobId, jobData);
        alert("Job updated successfully!");
        setEditingJobId(null);
      } else {
        await jobsAPI.createJob(jobData);
        alert("Job posted successfully!");
      }

      setShowCreateForm(false);
      setFormData({
        title: "",
        description: "",
        location: "",
        jobType: "full-time",
        salary: "",
        skills: "",
        department: "",
        experience: "",
        company: {
          name: "",
          website: "",
          about: "",
          industry: "",
        },
      });
      fetchJobs();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save job");
    }
  };

  const handleDelete = async (jobId) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        await jobsAPI.deleteJob(jobId);
        alert("Job deleted successfully!");
        fetchJobs();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete job");
      }
    }
  };

  const handleEdit = (jobId) => {
    const job = jobs.find((j) => j._id === jobId);
    if (job) {
      const company =
        job.company && typeof job.company === "object"
          ? job.company
          : { name: "", website: "", about: "", industry: "" };

      setFormData({
        title: job.title || "",
        description: job.description || "",
        location: job.location || "",
        jobType: job.jobType || "full-time",
        salary: job.salary || "",
        skills: Array.isArray(job.skills) ? job.skills.join(", ") : "",
        department: job.department || "",
        experience: job.experience || "",
        company: {
          name: company.name || "",
          website: company.website || "",
          about: company.about || "",
          industry: company.industry || "",
        },
      });
      setEditingJobId(jobId);
      setShowCreateForm(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleMarkFilled = async (jobId) => {
    try {
      await jobsAPI.updateJob(jobId, { status: "filled" });
      alert("Job marked as filled!");
      fetchJobs();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update job");
    }
  };

  const handleUpdateApplicationStatus = async (applicationId, newStatus) => {
    try {
      await applicationsAPI.updateApplicationStatus(applicationId, newStatus);
      alert(`Application status updated to ${newStatus}!`);
      fetchApplications();
    } catch (err) {
      alert(
        err.response?.data?.message || "Failed to update application status"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome, {user?.name}!
          </h1>
          <p className="text-gray-400">
            Manage your job postings and review applications
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Active Job Postings</p>
            <p className="text-4xl font-bold text-white">{jobs.length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Total Applications</p>
            <p className="text-4xl font-bold text-blue-400">
              {applications.length}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Company</p>
            <p className="text-lg font-bold text-green-400">
              {jobs.length > 0
                ? typeof jobs[0].company === "object"
                  ? jobs[0].company?.name || "Your Company"
                  : jobs[0].company
                : "Not specified"}
            </p>
          </div>
        </div>

        {/* Create Job Button */}
        <div className="flex gap-4 mb-8 flex-wrap">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            {showCreateForm ? "✕ Cancel" : "+ Post New Job"}
          </button>
          <button
            onClick={toggleApplications}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            {showApplications ? "✕ Hide Applications" : "📋 View Applications"}
          </button>
          <a
            href="/jobs"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            Browse All Jobs
          </a>
        </div>

        {/* Create Job Form */}
        {showCreateForm && (
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingJobId ? "Edit Job Posting" : "Create New Job Posting"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Job Title and Department */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g., Senior React Developer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g., Engineering"
                  />
                </div>
              </div>

              {/* Company Information Section */}
              <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Company Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      name="company.name"
                      value={formData.company.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      placeholder="Your company name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      name="company.website"
                      value={formData.company.website}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      placeholder="https://company.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Industry
                    </label>
                    <input
                      type="text"
                      name="company.industry"
                      value={formData.company.industry}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      placeholder="e.g., Technology, Finance"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Experience Required (years)
                    </label>
                    <input
                      type="number"
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      placeholder="5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 mt-4">
                    About Company
                  </label>
                  <textarea
                    name="company.about"
                    value={formData.company.about}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="Tell candidates about your company..."
                  />
                </div>
              </div>

              {/* Job Details */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="City, State"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Job Type *
                  </label>
                  <select
                    name="jobType"
                    value={formData.jobType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="full-time">Full-Time</option>
                    <option value="part-time">Part-Time</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Salary Range *
                  </label>
                  <input
                    type="text"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g., $50,000 - $100,000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Required Skills (comma-separated) *
                  </label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="React, Node.js, MongoDB"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Job Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="5"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Write a compelling job description..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition"
              >
                {editingJobId ? "Update Job" : "Post Job"}
              </button>
              {editingJobId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingJobId(null);
                    setShowCreateForm(false);
                    setFormData({
                      title: "",
                      description: "",
                      location: "",
                      jobType: "full-time",
                      salary: "",
                      skills: "",
                      department: "",
                      experience: "",
                      company: {
                        name: "",
                        website: "",
                        about: "",
                        industry: "",
                      },
                    });
                  }}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition"
                >
                  Cancel
                </button>
              )}
            </form>
          </div>
        )}

        {/* Applications Section */}
        {showApplications && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white">Applications</h2>
            </div>

            {applicationsLoading ? (
              <div className="p-12 text-center text-gray-400">
                Loading applications...
              </div>
            ) : applications.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-400 text-lg">No applications yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {applications.map((app) => {
                  const job = jobs.find(
                    (j) => j._id === app.job?._id || j._id === app.job
                  );
                  const candidate = app.candidateDetails || {};

                  return (
                    <div
                      key={app._id}
                      className="p-6 hover:bg-gray-700 transition"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-white mb-1">
                            {candidate.name || "Unknown Candidate"}
                          </h3>
                          <p className="text-gray-400 text-sm mb-1">
                            Applied for:{" "}
                            <span className="text-blue-400">
                              {job?.title || "Unknown Job"}
                            </span>
                          </p>
                          <p className="text-gray-500 text-xs">
                            Applied on:{" "}
                            {new Date(app.appliedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${
                              app.status === "applied"
                                ? "bg-yellow-500 bg-opacity-20 text-yellow-300"
                                : app.status === "shortlisted"
                                ? "bg-blue-500 bg-opacity-20 text-blue-300"
                                : app.status === "interviewed"
                                ? "bg-purple-500 bg-opacity-20 text-purple-300"
                                : app.status === "accepted"
                                ? "bg-green-500 bg-opacity-20 text-green-300"
                                : "bg-red-500 bg-opacity-20 text-red-300"
                            }`}
                          >
                            {app.status}
                          </span>
                          <button
                            onClick={() =>
                              navigate(`/candidate/${app.candidate}`)
                            }
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-1 px-3 rounded transition text-sm whitespace-nowrap"
                          >
                            View Profile
                          </button>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm text-gray-300">
                        <div>
                          <span className="text-gray-500">Email:</span>{" "}
                          {candidate.email}
                        </div>
                        <div>
                          <span className="text-gray-500">Phone:</span>{" "}
                          {candidate.phone || "N/A"}
                        </div>
                        <div>
                          <span className="text-gray-500">Experience:</span>{" "}
                          {candidate.experience || "N/A"}
                        </div>
                        <div>
                          <span className="text-gray-500">
                            Current Company:
                          </span>{" "}
                          {candidate.currentCompany || "N/A"}
                        </div>
                      </div>

                      {candidate.skills && candidate.skills.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-500 mb-2">Skills:</p>
                          <div className="flex flex-wrap gap-2">
                            {candidate.skills.slice(0, 5).map((skill, idx) => (
                              <span
                                key={idx}
                                className="bg-gray-700 text-gray-200 px-2 py-1 rounded text-xs"
                              >
                                {skill}
                              </span>
                            ))}
                            {candidate.skills.length > 5 && (
                              <span className="bg-gray-700 text-gray-200 px-2 py-1 rounded text-xs">
                                +{candidate.skills.length - 5}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 flex-wrap pt-4 border-t border-gray-700">
                        <button
                          onClick={() =>
                            handleUpdateApplicationStatus(
                              app._id,
                              "shortlisted"
                            )
                          }
                          disabled={app.status !== "applied"}
                          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded transition text-sm"
                        >
                          ✓ Shortlist
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateApplicationStatus(
                              app._id,
                              "interviewed"
                            )
                          }
                          disabled={app.status !== "shortlisted"}
                          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded transition text-sm"
                        >
                          📞 Interview
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateApplicationStatus(app._id, "accepted")
                          }
                          disabled={app.status !== "interviewed"}
                          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded transition text-sm"
                        >
                          ✓ Accept
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateApplicationStatus(app._id, "rejected")
                          }
                          disabled={app.status === "accepted"}
                          className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded transition text-sm"
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Jobs List */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-2xl font-bold text-white">My Job Postings</h2>
          </div>

          {error && (
            <div className="p-6 bg-red-500 bg-opacity-20 border-b border-red-500 text-red-200">
              {error}
            </div>
          )}

          {loading ? (
            <div className="p-12 text-center text-gray-400">
              Loading jobs...
            </div>
          ) : jobs.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-400 text-lg mb-4">
                You haven't posted any jobs yet.
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition"
              >
                Post Your First Job
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {jobs.map((job) => {
                // Ensure company is always a valid object
                const company =
                  job && job.company && typeof job.company === "object"
                    ? job.company
                    : {};

                return (
                  <div
                    key={job._id}
                    className="p-6 hover:bg-gray-700 transition"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">
                          {job.title || "Untitled Job"}
                        </h3>
                        <p className="text-gray-400">
                          {typeof company.name === "string"
                            ? company.name
                            : "Company"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/jobs/${job._id}`)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded transition text-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(job._id)}
                          className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-1 px-3 rounded transition text-sm"
                        >
                          Edit
                        </button>
                        {job.status === "open" && (
                          <button
                            onClick={() => handleMarkFilled(job._id)}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-1 px-3 rounded transition text-sm"
                          >
                            Mark Filled
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(job._id)}
                          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded transition text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 mb-4 text-sm text-gray-400">
                      <div>📍 {job.location}</div>
                      <div>💰 {job.salary}</div>
                      <div>
                        📅 {new Date(job.createdAt).toLocaleDateString()}
                      </div>
                      <div>📊 {job.jobType}</div>
                    </div>

                    <p className="text-gray-300 line-clamp-2 mb-2">
                      {job.description || "No description"}
                    </p>

                    {company &&
                      company.about &&
                      typeof company.about === "string" && (
                        <p className="text-gray-400 text-sm line-clamp-1 mb-2">
                          {company.about}
                        </p>
                      )}

                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(job.skills) &&
                        job.skills.slice(0, 3).map((skill, idx) => (
                          <span
                            key={idx}
                            className="bg-gray-700 text-gray-200 px-2 py-1 rounded text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                      {Array.isArray(job.skills) && job.skills.length > 3 && (
                        <span className="bg-gray-700 text-gray-200 px-2 py-1 rounded text-xs">
                          +{job.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
