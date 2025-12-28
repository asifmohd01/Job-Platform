import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { applicationsAPI } from "../services/apiClient";

export default function CandidateDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    applied: 0,
    shortlisted: 0,
    interviewed: 0,
    accepted: 0,
    rejected: 0,
  });

  useEffect(() => {
    if (user?.role !== "candidate") {
      navigate("/");
      return;
    }
    fetchApplications();
  }, [user, navigate]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data } = await applicationsAPI.getMyApplications();
      
      // Handle different response formats
      let appsList = [];
      if (Array.isArray(data)) {
        appsList = data;
      } else if (data && Array.isArray(data.applications)) {
        appsList = data.applications;
      } else {
        appsList = [];
      }
      
      // Ensure all applications have required fields
      appsList = appsList.map(app => ({
        _id: app._id,
        job: app.job || {},
        email: app.email || "",
        phone: app.phone || "",
        coverLetter: app.coverLetter || "",
        status: app.status || "applied",
        resume: app.resume,
        candidate: app.candidate,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
      }));
      
      setApplications(appsList);
      setError("");

      // Calculate stats based on server enum: applied, shortlisted, interviewed, accepted, rejected
      const s = {
        total: appsList.length,
        applied: appsList.filter((a) => a.status === "applied").length,
        shortlisted: appsList.filter((a) => a.status === "shortlisted").length,
        interviewed: appsList.filter((a) => a.status === "interviewed").length,
        accepted: appsList.filter((a) => a.status === "accepted").length,
        rejected: appsList.filter((a) => a.status === "rejected").length,
      };
      setStats(s);
    } catch (err) {
      setError("Failed to load applications.");
      console.error(err);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "applied":
        return "bg-yellow-500 bg-opacity-20 text-yellow-200 border-yellow-500";
      case "shortlisted":
        return "bg-blue-500 bg-opacity-20 text-blue-200 border-blue-500";
      case "interviewed":
        return "bg-purple-500 bg-opacity-20 text-purple-200 border-purple-500";
      case "accepted":
        return "bg-green-500 bg-opacity-20 text-green-200 border-green-500";
      case "rejected":
        return "bg-red-500 bg-opacity-20 text-red-200 border-red-500";
      default:
        return "bg-gray-500 bg-opacity-20 text-gray-200 border-gray-500";
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
            Track your job applications and stay updated on opportunities
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-6 gap-4 mb-12">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Total Applications</p>
            <p className="text-4xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Applied</p>
            <p className="text-4xl font-bold text-yellow-400">{stats.applied}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Shortlisted</p>
            <p className="text-4xl font-bold text-blue-400">{stats.shortlisted}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Interviewed</p>
            <p className="text-4xl font-bold text-purple-400">{stats.interviewed}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Accepted</p>
            <p className="text-4xl font-bold text-green-400">
              {stats.accepted}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Rejected</p>
            <p className="text-4xl font-bold text-red-400">{stats.rejected}</p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => navigate("/jobs")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition mb-8"
        >
          Browse More Jobs
        </button>

        {/* Applications List */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-2xl font-bold text-white">My Applications</h2>
          </div>

          {error && (
            <div className="p-6 bg-red-500 bg-opacity-20 border-b border-red-500 text-red-200">
              {error}
            </div>
          )}

          {loading ? (
            <div className="p-12 text-center text-gray-400">
              Loading applications...
            </div>
          ) : applications.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-400 text-lg mb-4">
                You haven't applied to any jobs yet.
              </p>
              <button
                onClick={() => navigate("/jobs")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
              >
                Find Jobs Now
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {applications.map((app) => {
                const job = app && app.job && typeof app.job === 'object' 
                  ? app.job 
                  : {};
                const company = job && job.company && typeof job.company === 'object'
                  ? job.company
                  : {};
                
                return (
                <div key={app._id} className="p-6 hover:bg-gray-700 transition">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        {typeof job.title === 'string' ? job.title : "Job Title"}
                      </h3>
                      <p className="text-gray-400">
                        {typeof company.name === 'string' ? company.name : "Company Name"}
                      </p>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(
                        app.status
                      )}`}
                    >
                      {typeof app.status === 'string' ? (app.status.charAt(0).toUpperCase() + app.status.slice(1)) : "Applied"}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm text-gray-400">
                    <div>📧 {app.email || "Email not provided"}</div>
                    <div>📞 {app.phone || "Phone not provided"}</div>
                    <div>
                      📅{" "}
                      {new Date(app.createdAt).toLocaleDateString() ||
                        "Date not available"}
                    </div>
                  </div>

                  {app.coverLetter && (
                    <div className="mb-4 p-4 bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-300">
                        <strong>Cover Letter:</strong>
                      </p>
                      <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                        {app.coverLetter}
                      </p>
                    </div>
                  )}

                  {app.feedback && (
                    <div className="p-4 bg-blue-500 bg-opacity-20 border border-blue-500 rounded-lg">
                      <p className="text-sm text-blue-200">
                        <strong>Feedback:</strong> {app.feedback}
                      </p>
                    </div>
                  )}
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
