import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { jobsAPI, applicationsAPI } from "../services/apiClient";

export default function MyJobs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [counts, setCounts] = useState({}); // jobId -> application count

  useEffect(() => {
    if (user?.role !== "recruiter") navigate("/");
  }, [user, navigate]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data } = await jobsAPI.getMyJobs();
      const list = Array.isArray(data.jobs) ? data.jobs : [];
      setJobs(list);
      setError("");
    } catch (e) {
      console.error(e);
      setError("Failed to load jobs");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCounts = async (list) => {
    try {
      const entries = await Promise.all(
        list.map(async (j) => {
          try {
            const { data } = await applicationsAPI.getJobApplications(j._id);
            return [j._id, (data.applications || []).length];
          } catch {
            return [j._id, 0];
          }
        })
      );
      setCounts(Object.fromEntries(entries));
    } catch {}
  };

  useEffect(() => {
    (async () => {
      await fetchJobs();
    })();
  }, []);

  useEffect(() => {
    if (jobs.length > 0) fetchCounts(jobs);
  }, [jobs]);

  const companyName = useMemo(() => {
    if (jobs.length === 0) return "";
    const c = jobs[0].company;
    return typeof c === "object" ? c?.name : c;
  }, [jobs]);

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">My Jobs</h1>
            <p className="text-gray-400">{companyName || "Your Company"}</p>
          </div>
          <Link
            to="/recruiter-dashboard/post-job"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
          >
            + Post Job
          </Link>
        </div>

        {error && <p className="text-red-300 mb-4">{error}</p>}

        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : jobs.length === 0 ? (
          <div className="text-gray-400">No jobs posted yet.</div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="bg-gray-800 border border-gray-700 rounded-lg p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="grow">
                    <h2 className="text-xl font-semibold text-white">
                      {job.title}
                    </h2>
                    <p className="text-gray-400 text-sm mb-2">
                      {job.location} • {job.jobType}
                    </p>
                    <p className="text-sm mb-2">
                      Status: {job.status === "open" ? (
                        <span className="text-green-400 font-semibold">Open</span>
                      ) : (
                        <span className="text-red-400 font-semibold">Filled</span>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {(job.skills || []).map((s) => (
                        <span
                          key={s}
                          className="px-2 py-1 text-xs bg-gray-700 text-gray-200 rounded"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-2">
                      {job.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Applications</p>
                    <p className="text-3xl font-bold text-blue-400">
                      {counts[job._id] ?? "-"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 flex-wrap">
                  <Link
                    to={`/recruiter-dashboard/job/${job._id}/applications`}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded"
                  >
                    View Applications
                  </Link>
                  <button
                    onClick={() => navigate(`/recruiter-dashboard/post-job/${job._id}`)}
                    className="bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold py-2 px-4 rounded"
                  >
                    Edit
                  </button>
                  {job.status === "open" ? (
                    <button
                      onClick={async () => {
                        if (!window.confirm("Mark this job as filled?")) return;
                        try {
                          await jobsAPI.markFilled(job._id);
                          await fetchJobs();
                        } catch (e) {
                          alert("Failed to mark filled");
                        }
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold py-2 px-4 rounded"
                    >
                      Mark Filled
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        if (!window.confirm("Reopen this job to accept applications?")) return;
                        try {
                          await jobsAPI.markOpen(job._id);
                          await fetchJobs();
                        } catch (e) {
                          alert("Failed to reopen job");
                        }
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 px-4 rounded"
                    >
                      Mark Open
                    </button>
                  )}
                  <button
                    onClick={async () => {
                      if (!window.confirm("Delete this job?")) return;
                      try {
                        await jobsAPI.deleteJob(job._id);
                        await fetchJobs();
                      } catch (e) {
                        alert("Failed to delete job");
                      }
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2 px-4 rounded"
                  >
                    Delete
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
