import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { useAuth } from "./context/AuthContext";
import MainLayout from "./components/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import JobsPage from "./pages/JobsPage";
import JobDetailsPage from "./pages/JobDetailsPage";
import CandidateDashboard from "./pages/CandidateDashboard";
import MyApplications from "./pages/MyApplications";
import SavedJobs from "./pages/SavedJobs";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import CandidateProfile from "./pages/CandidateProfile";
import PostJob from "./pages/PostJob";
import MyJobs from "./pages/MyJobs";
import JobApplications from "./pages/JobApplications";

export default function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <MainLayout>
              <HomePage />
            </MainLayout>
          }
        />
        <Route
          path="/login"
          element={user ? <Navigate to="/" /> : <LoginPage />}
        />
        <Route
          path="/jobs"
          element={
            <MainLayout>
              <JobsPage />
            </MainLayout>
          }
        />
        <Route
          path="/jobs/:id"
          element={
            <MainLayout>
              <JobDetailsPage />
            </MainLayout>
          }
        />

        {/* Protected Routes - Candidate */}
        <Route
          path="/candidate-dashboard"
          element={
            <ProtectedRoute role="candidate">
              <MainLayout>
                <CandidateDashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate-dashboard/my-applications"
          element={
            <ProtectedRoute role="candidate">
              <MainLayout>
                <MyApplications />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/saved"
          element={
            <ProtectedRoute role="candidate">
              <MainLayout>
                <SavedJobs />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute role="candidate">
              <MainLayout>
                <CandidateProfile />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/:candidateId"
          element={
            <MainLayout>
              <CandidateProfile />
            </MainLayout>
          }
        />

        {/* Protected Routes - Recruiter */}
        <Route
          path="/recruiter-dashboard"
          element={
            <ProtectedRoute role="recruiter">
              <MainLayout>
                <RecruiterDashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruiter-dashboard/post-job"
          element={
            <ProtectedRoute role="recruiter">
              <MainLayout>
                <PostJob />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruiter-dashboard/post-job/:jobId"
          element={
            <ProtectedRoute role="recruiter">
              <MainLayout>
                <PostJob />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruiter-dashboard/my-jobs"
          element={
            <ProtectedRoute role="recruiter">
              <MainLayout>
                <MyJobs />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruiter-dashboard/job/:jobId/applications"
          element={
            <ProtectedRoute role="recruiter">
              <MainLayout>
                <JobApplications />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin routes removed */}

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}
