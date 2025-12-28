import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { jobsAPI } from "../services/apiClient";

export default function PostJob() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { jobId } = useParams();
  const editing = Boolean(jobId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    jobType: "full-time",
    salary: "",
    skills: "",
    department: "",
    experience: "",
    company: { name: "", website: "", about: "", industry: "" },
  });

  useEffect(() => {
    if (user?.role !== "recruiter") {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    const loadJob = async () => {
      if (!editing) return;
      try {
        setLoading(true);
        const { data } = await jobsAPI.getJobById(jobId);
        const job = data?.job || {};
        const company = typeof job.company === "object" ? job.company : {};
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
        setError("");
      } catch (e) {
        setError("Failed to load job for editing");
      } finally {
        setLoading(false);
      }
    };
    loadJob();
  }, [editing, jobId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("company.")) {
      const field = name.replace("company.", "");
      setFormData((prev) => ({
        ...prev,
        company: { ...prev.company, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        jobType: formData.jobType,
        salary: formData.salary,
        skills: formData.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        department: formData.department,
        experience: parseInt(formData.experience) || null,
        company: formData.company,
      };

      if (editing) {
        await jobsAPI.updateJob(jobId, payload);
        alert("Job updated successfully");
      } else {
        await jobsAPI.createJob(payload);
        alert("Job posted successfully");
      }
      navigate("/recruiter-dashboard/my-jobs");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-2">
          {editing ? "Edit Job" : "Post a Job"}
        </h1>
        <p className="text-gray-400 mb-6">
          Provide clear, concise details to attract the best candidates.
        </p>
        {error && <p className="text-red-300 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Job Title *</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                placeholder="e.g., Senior React Developer"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Department</label>
              <input
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                placeholder="e.g., Engineering"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={6}
              required
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              placeholder="Describe responsibilities, requirements, and benefits"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Location *</label>
              <input
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                placeholder="e.g., Remote / NYC"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Job Type</label>
              <select
                name="jobType"
                value={formData.jobType}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Salary</label>
              <input
                name="salary"
                value={formData.salary}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                placeholder="e.g., $120k-$150k"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Key Skills (comma separated)</label>
            <input
              name="skills"
              value={formData.skills}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              placeholder="React, Node.js, MongoDB"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Experience (years)</label>
              <input
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                placeholder="e.g., 3"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Company Name *</label>
              <input
                name="company.name"
                value={formData.company.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                placeholder="Your company"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Website</label>
              <input
                name="company.website"
                value={formData.company.website}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">About Company</label>
              <textarea
                name="company.about"
                value={formData.company.about}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Industry</label>
              <input
                name="company.industry"
                value={formData.company.industry}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-2 px-6 rounded"
            >
              {editing ? "Save Changes" : "Post Job"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/recruiter-dashboard/my-jobs")}
              className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
