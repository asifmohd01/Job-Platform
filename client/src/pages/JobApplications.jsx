import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { applicationsAPI, jobsAPI } from "../services/apiClient";
import { aiAPI } from "../services/aiClient";

export default function JobApplications() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(null);
  const [scores, setScores] = useState({});

  const load = async () => {
    try {
      setLoading(true);
      const [{ data: jobData }, { data: appsData }] = await Promise.all([
        jobsAPI.getJobById(jobId),
        applicationsAPI.getJobApplications(jobId),
      ]);
      setJob(jobData?.job || null);
      setApps(appsData?.applications || []);
      setError("");
    } catch (e) {
      console.error(e);
      setError("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [jobId]);

  useEffect(() => {
    const getScores = async () => {
      if (!job || apps.length === 0) return;
      const entries = await Promise.all(
        apps.map(async (a) => {
          try {
            const { data } = await aiAPI.match(a.candidate, job._id);
            return [a._id, data?.match?.score ?? null];
          } catch {
            return [a._id, null];
          }
        })
      );
      setScores(Object.fromEntries(entries));
    };
    getScores();
  }, [apps, job]);

  const setStatus = async (applicationId, status) => {
    try {
      setUpdating(applicationId);
      await applicationsAPI.updateApplicationStatus(applicationId, status);
      await load();
    } catch (e) {
      alert("Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Applications</h1>
            {job && (
              <p className="text-gray-400">{job.title} • {job.location}</p>
            )}
          </div>
          <button
            onClick={() => navigate("/recruiter-dashboard/my-jobs")}
            className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded"
          >
            Back to My Jobs
          </button>
        </div>

        {error && <p className="text-red-300 mb-4">{error}</p>}
        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : apps.length === 0 ? (
          <div className="text-gray-400">No applications yet.</div>
        ) : (
          <div className="space-y-4">
            {apps.map((app) => (
              <div key={app._id} className="bg-gray-800 border border-gray-700 rounded-lg p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="grow">
                    {(() => { const cid = app.candidate?._id || app.candidate; return (
                      <div className="flex items-center gap-2 mb-1">
                        {cid ? (
                          <button
                            onClick={() => navigate(`/candidate/${cid}`)}
                            className="text-lg font-semibold text-white hover:text-blue-300 text-left"
                          >
                            {app.candidateDetails?.name || app.candidate?.name || "Candidate"}
                          </button>
                        ) : (
                          <h3 className="text-lg font-semibold text-white">
                            {app.candidateDetails?.name || app.candidate?.name || "Candidate"}
                          </h3>
                        )}
                        {scores[app._id] != null && (
                          <span className="text-xs px-2 py-1 rounded bg-blue-600 text-white">
                            Match: {Math.round(scores[app._id])}
                          </span>
                        )}
                      </div>
                    ); })()}
                    <p className="text-gray-400 text-sm mb-2">
                      {app.candidateDetails?.email || app.candidate?.email} {app.candidateDetails?.phone ? `• ${app.candidateDetails.phone}` : ""}
                    </p>
                    <div className="text-gray-300 text-sm space-y-1">
                      {app.candidateDetails?.currentCompany && (
                        <p>Company: {app.candidateDetails.currentCompany}</p>
                      )}
                      {app.candidateDetails?.experience && (
                        <p>Experience: {app.candidateDetails.experience} years</p>
                      )}
                      {Array.isArray(app.candidateDetails?.skills) && app.candidateDetails.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {app.candidateDetails.skills.map((s) => (
                            <span key={s} className="px-2 py-1 text-xs bg-gray-700 text-gray-200 rounded">{s}</span>
                          ))}
                        </div>
                      )}
                      {app.coverLetter && (
                        <p className="text-gray-400 mt-2">Cover letter: <span className="text-gray-300">{app.coverLetter}</span></p>
                      )}
                    </div>
                    <div className="flex gap-3 mt-3 flex-wrap">
                      {(() => { const cid = app.candidate?._id || app.candidate; return cid ? (
                        <Link
                          to={`/candidate/${cid}`}
                          className="bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold py-2 px-3 rounded"
                        >
                          View Profile
                        </Link>
                      ) : null; })()}
                      {/* Resume controls via candidate profile already protected by access */}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400 mb-1">Status</p>
                    <span className="px-2 py-1 rounded text-xs bg-gray-700 text-gray-200">
                      {app.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 flex-wrap">
                  {[
                    "applied",
                    "shortlisted",
                    "interviewed",
                    "accepted",
                    "rejected",
                  ].map((st) => (
                    <button
                      key={st}
                      disabled={updating === app._id}
                      onClick={() => setStatus(app._id, st)}
                      className={`text-sm font-semibold py-2 px-3 rounded ${
                        app.status === st
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 text-white hover:bg-gray-600"
                      } ${updating === app._id ? "opacity-50" : ""}`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
