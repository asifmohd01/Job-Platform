import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { jobsAPI, applicationsAPI } from "../services/apiClient";
import { aiAPI } from "../services/aiClient";

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Post job moved to dedicated page
  const [applications, setApplications] = useState([]);
  const [showApplications, setShowApplications] = useState(false);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  //
  const [matchScores, setMatchScores] = useState({}); // { applicationId: { score, loading, error } }
  //
  // form removed from dashboard

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

  useEffect(() => {
    const fetchScores = async () => {
      if (!showApplications || applications.length === 0) return;
      const entries = await Promise.all(
        applications.map(async (app) => {
          const jobId = app.job?._id || app.job;
          const candidateId = app.candidate;
          if (!jobId || !candidateId) return [app._id, { error: "Missing ids" }];
          try {
            const { data } = await aiAPI.match(candidateId, jobId);
            return [app._id, { score: data?.match?.score ?? null }];
          } catch {
            return [app._id, { error: "Score failed" }];
          }
        })
      );
      const mapped = Object.fromEntries(entries);
      setMatchScores(mapped);
    };
    fetchScores();
  }, [showApplications, applications]);

  // input handlers not needed

  // submit removed

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

  // edit moved to My Jobs / Post Job

  // mark filled handled in My Jobs

  // application status updates handled in Job Applications page

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
        {/* Navigation */}
        <div className="flex gap-4 mb-8 flex-wrap">
          <Link
            to="/recruiter-dashboard/post-job"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            + Post New Job
          </Link>
          <Link
            to="/recruiter-dashboard/my-jobs"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            My Jobs
          </Link>
          <button
            onClick={toggleApplications}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            {showApplications ? "✕ Hide Applications" : "📋 View All Applications"}
          </button>
        </div>

        {/* Applications List */}
        {showApplications && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white">Recent Applications</h2>
            </div>
            {applicationsLoading ? (
              <div className="p-12 text-center text-gray-400">Loading applications...</div>
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
                  const jobId = app.job?._id || app.job;
                  const candidateId = app.candidate?._id || app.candidate;
                  return (
                    <div key={app._id} className="p-6 hover:bg-gray-700 transition">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          {candidateId ? (
                            <button
                              onClick={() => navigate(`/candidate/${candidateId}`)}
                              className="text-lg font-bold text-white mb-1 hover:text-blue-300 text-left"
                            >
                              {candidate.name || "Unknown Candidate"}
                            </button>
                          ) : (
                            <h3 className="text-lg font-bold text-white mb-1">
                              {candidate.name || "Unknown Candidate"}
                            </h3>
                          )}
                          <p className="text-gray-400 text-sm mb-1">
                            Applied for: <span className="text-blue-400">{job?.title || "Unknown Job"}</span>
                          </p>
                          <p className="text-gray-500 text-xs">
                            Applied on: {new Date(app.appliedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
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
                            {typeof app.status === "string"
                              ? app.status.charAt(0).toUpperCase() + app.status.slice(1)
                              : "Applied"}
                          </span>
                          <span className="text-xs text-gray-300">
                            Match: {matchScores[app._id]?.score ?? "--"}
                          </span>
                          <div className="flex gap-2">
                            {candidateId && (
                              <button
                                onClick={() => navigate(`/candidate/${candidateId}`)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-1 px-3 rounded transition text-sm whitespace-nowrap"
                              >
                                View Profile
                              </button>
                            )}
                            {jobId && (
                              <button
                                onClick={() => navigate(`/recruiter-dashboard/job/${jobId}/applications`)}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-1 px-3 rounded transition text-sm whitespace-nowrap"
                              >
                                Manage Status
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm text-gray-300">
                        <div>
                          <span className="text-gray-500">Email:</span> {candidate.email}
                        </div>
                        <div>
                          <span className="text-gray-500">Phone:</span> {candidate.phone || "N/A"}
                        </div>
                        <div>
                          <span className="text-gray-500">Experience:</span> {candidate.experience || "N/A"}
                        </div>
                        <div>
                          <span className="text-gray-500">Current Company:</span> {candidate.currentCompany || "N/A"}
                        </div>
                      </div>

                      {candidate.skills && candidate.skills.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-500 mb-2">Skills:</p>
                          <div className="flex flex-wrap gap-2">
                            {candidate.skills.slice(0, 5).map((skill, idx) => (
                              <span key={idx} className="bg-gray-700 text-gray-200 px-2 py-1 rounded text-xs">
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
                onClick={() => navigate("/recruiter-dashboard/post-job")}
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
                          onClick={() => navigate(`/recruiter-dashboard/post-job/${job._id}`)}
                          className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-1 px-3 rounded transition text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => navigate(`/recruiter-dashboard/job/${job._id}/applications`)}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-1 px-3 rounded transition text-sm"
                        >
                          Applications
                        </button>
                        {job.status === "open" ? (
                          <button
                            onClick={async () => {
                              if (!window.confirm("Mark this job as filled?")) return;
                              try {
                                await jobsAPI.markFilled(job._id);
                                fetchJobs();
                              } catch (e) {
                                console.error("Mark filled failed", e);
                                alert(
                                  `Failed to mark filled: ${
                                    e?.response?.data?.message || e?.message || "Unknown error"
                                  }`
                                );
                              }
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-1 px-3 rounded transition text-sm"
                          >
                            Mark Filled
                          </button>
                        ) : (
                          <button
                            onClick={async () => {
                              if (!window.confirm("Reopen this job?")) return;
                              try {
                                await jobsAPI.markOpen(job._id);
                                fetchJobs();
                              } catch (e) {
                                console.error("Reopen job failed", e);
                                alert(
                                  `Failed to reopen job: ${
                                    e?.response?.data?.message || e?.message || "Unknown error"
                                  }`
                                );
                              }
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-3 rounded transition text-sm"
                          >
                            Mark Open
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
                      <div className="md:col-span-4">
                        Status: {job.status === "open" ? (
                          <span className="text-green-400 font-semibold">Open</span>
                        ) : (
                          <span className="text-red-400 font-semibold">Filled</span>
                        )}
                      </div>
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
