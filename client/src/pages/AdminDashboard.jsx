import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { adminAPI } from "../services/apiClient";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("users");

  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/");
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, jobsRes] = await Promise.all([
        adminAPI.getUsers(),
        adminAPI.getAllJobs(),
      ]);
      setUsers(usersRes.data.users);
      setJobs(jobsRes.data.jobs);
      setError("");
    } catch (err) {
      setError("Failed to load data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId) => {
    try {
      await adminAPI.blockUser(userId);
      alert("User status updated successfully!");
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update user");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await adminAPI.deleteUser(userId);
        alert("User deleted successfully!");
        fetchData();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete user");
      }
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-500 bg-opacity-20 text-red-200 border-red-500";
      case "recruiter":
        return "bg-blue-500 bg-opacity-20 text-blue-200 border-blue-500";
      case "candidate":
        return "bg-green-500 bg-opacity-20 text-green-200 border-green-500";
      default:
        return "bg-gray-500 bg-opacity-20 text-gray-200 border-gray-500";
    }
  };

  const getStatusColor = (isBlocked) => {
    return isBlocked
      ? "bg-red-500 bg-opacity-20 text-red-200 border-red-500"
      : "bg-green-500 bg-opacity-20 text-green-200 border-green-500";
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-400">
            Manage users and monitor platform activity
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Total Users</p>
            <p className="text-4xl font-bold text-white">{users.length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Candidates</p>
            <p className="text-4xl font-bold text-green-400">
              {users.filter((u) => u.role === "candidate").length}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Recruiters</p>
            <p className="text-4xl font-bold text-blue-400">
              {users.filter((u) => u.role === "recruiter").length}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Job Postings</p>
            <p className="text-4xl font-bold text-purple-400">{jobs.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-700">
          <button
            onClick={() => setActiveTab("users")}
            className={`py-3 px-6 font-semibold transition ${
              activeTab === "users"
                ? "text-white border-b-2 border-blue-600"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("jobs")}
            className={`py-3 px-6 font-semibold transition ${
              activeTab === "jobs"
                ? "text-white border-b-2 border-blue-600"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            Jobs ({jobs.length})
          </button>
        </div>

        {/* Content */}
        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-400">
            Loading dashboard data...
          </div>
        ) : activeTab === "users" ? (
          // Users Table
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white">
                Users Management
              </h2>
            </div>

            {users.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                No users found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700 border-b border-gray-600">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {users.map((user) => (
                      <tr
                        key={user._id}
                        className="hover:bg-gray-700 transition"
                      >
                        <td className="px-6 py-4 text-white font-medium">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 text-gray-400">
                          {user.email}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(
                              user.role
                            )}`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                              user.isBlocked
                            )}`}
                          >
                            {user.isBlocked ? "Blocked" : "Active"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-sm">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleBlockUser(user._id)}
                              className={`px-3 py-1 rounded text-xs font-semibold transition ${
                                user.isBlocked
                                  ? "bg-green-600 hover:bg-green-700 text-white"
                                  : "bg-yellow-600 hover:bg-yellow-700 text-white"
                              }`}
                            >
                              {user.isBlocked ? "Unblock" : "Block"}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="px-3 py-1 rounded text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          // Jobs Table
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white">Job Postings</h2>
            </div>

            {jobs.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                No jobs found.
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {jobs.map((job) => (
                  <div
                    key={job._id}
                    className="p-6 hover:bg-gray-700 transition"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">
                          {job.title}
                        </h3>
                        <p className="text-blue-400 font-semibold">
                          {job.company?.name || "Company"}
                        </p>
                      </div>
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {job.jobType}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 mb-2 text-sm text-gray-400">
                      <div>📍 {job.location}</div>
                      <div>💰 {job.salary}</div>
                      <div>📊 {job.jobType}</div>
                      <div>
                        📅 {new Date(job.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
