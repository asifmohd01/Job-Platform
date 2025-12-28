import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { applicationsAPI } from "../services/apiClient";
import { useAuth } from "../context/AuthContext";

export default function MyApplications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "candidate") {
      navigate("/");
      return;
    }
    fetchApplications();
  }, [user]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data } = await applicationsAPI.getMyApplications();
      const apps = Array.isArray(data?.applications) ? data.applications : [];
      setApplications(apps);
      setError("");
    } catch (e) {
      console.error(e);
      setError("Failed to load applications");
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const statusClass = (status) => {
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
        <h1 className="text-4xl font-bold text-white mb-8">My Applications</h1>

        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-400">Loading applications...</div>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-lg">No applications yet.</p>
            <button
              onClick={() => navigate("/jobs")}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
            >
              Browse Jobs
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {applications.map((app) => (
              <div key={app._id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Link
                      to={`/jobs/${app.job?._id}`}
                      className="text-xl font-bold text-white hover:underline"
                    >
                      {app.job?.title || "Job Title"}
                    </Link>
                    <p className="text-blue-400 font-semibold">
                      {app.job?.company?.name || "Company"}
                    </p>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold border ${statusClass(
                      app.status
                    )}`}
                  >
                    {(app.status || "applied").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </span>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-2 text-sm text-gray-400">
                  <div>📅 {new Date(app.createdAt).toLocaleDateString()}</div>
                  <div>📧 {app.email || "Email not provided"}</div>
                  <div>📞 {app.phone || "Phone not provided"}</div>
                </div>
                {app.coverLetter && (
                  <p className="text-gray-300 text-sm mt-2 line-clamp-2">
                    {app.coverLetter}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}