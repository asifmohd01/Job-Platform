import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { useAuth } from "./context/AuthContext";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import JobsPage from "./pages/JobsPage";
import JobDetailsPage from "./pages/JobDetailsPage";
import CandidateDashboard from "./pages/CandidateDashboard";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import AdminDashboard from "./pages/AdminDashboard";

// Navbar Component
function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <a
          href="/"
          className="text-2xl font-bold text-blue-500 hover:text-blue-400"
        >
          JobPortal
        </a>

        <div className="flex items-center gap-6">
          {user?.role === "candidate" && (
            <a
              href="/jobs"
              className="text-gray-300 hover:text-white transition"
            >
              Browse Jobs
            </a>
          )}

          {user ? (
            <>
              {user.role === "candidate" && (
                <a
                  href="/candidate-dashboard"
                  className="text-gray-300 hover:text-white transition"
                >
                  My Applications
                </a>
              )}
              {user.role === "recruiter" && (
                <>
                  <a
                    href="/jobs"
                    className="text-gray-300 hover:text-white transition"
                  >
                    Browse Jobs
                  </a>
                  <a
                    href="/recruiter-dashboard"
                    className="text-gray-300 hover:text-white transition"
                  >
                    Post Jobs
                  </a>
                </>
              )}
              {user.role === "admin" && (
                <a
                  href="/admin-dashboard"
                  className="text-gray-300 hover:text-white transition"
                >
                  Admin Panel
                </a>
              )}

              <div className="flex items-center gap-4 pl-4 border-l border-gray-700">
                <span className="text-gray-300 text-sm">
                  {user.name}{" "}
                  <span className="text-gray-500">({user.role})</span>
                </span>
                <button
                  onClick={logout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <a
                href="/jobs"
                className="text-gray-300 hover:text-white transition"
              >
                Browse Jobs
              </a>
              <a
                href="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              >
                Login
              </a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route
          path="/login"
          element={user ? <Navigate to="/" /> : <LoginPage />}
        />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailsPage />} />

        {/* Protected Routes - Candidate */}
        <Route
          path="/candidate-dashboard"
          element={
            user && user.role === "candidate" ? (
              <CandidateDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Protected Routes - Recruiter */}
        <Route
          path="/recruiter-dashboard"
          element={
            user && user.role === "recruiter" ? (
              <RecruiterDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Protected Routes - Admin */}
        <Route
          path="/admin-dashboard"
          element={
            user && user.role === "admin" ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}
