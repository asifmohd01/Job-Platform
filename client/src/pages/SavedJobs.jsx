import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jobsAPI } from "../services/apiClient";
import { useAuth } from "../context/AuthContext";

export default function SavedJobs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
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
    fetchSaved();
  }, [user]);

  const fetchSaved = async () => {
    try {
      setLoading(true);
      const { data } = await jobsAPI.getSavedJobs();
      setJobs(Array.isArray(data.jobs) ? data.jobs : []);
      setError("");
    } catch (e) {
      setError("Failed to load saved jobs");
      console.error(e);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const removeSaved = async (id) => {
    try {
      await jobsAPI.unsaveJob(id);
      setJobs((prev) => prev.filter((j) => j._id !== id));
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to remove saved job");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Saved Jobs</h1>

        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-400">Loading saved jobs...</div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-lg">No saved jobs yet.</p>
            <button
              onClick={() => navigate("/jobs")}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
            >
              Browse Jobs
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <Link
                      to={`/jobs/${job._id}`}
                      className="text-xl font-bold text-white mb-1 hover:underline"
                    >
                      {job.title}
                    </Link>
                    <p className="text-blue-400 font-semibold">
                      {job.company?.name || "Company"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                        job.status === "open"
                          ? "bg-green-600 text-white"
                          : "bg-red-600 text-white"
                      }`}
                    >
                      {job.status === "open" ? "Open" : "Filled"}
                    </span>
                  </div>
                </div>

                <p className="text-gray-300 mb-4 line-clamp-2">
                  {job.description}
                </p>

                <div className="flex gap-3">
                  <Link
                    to={`/jobs/${job._id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => removeSaved(job._id)}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}