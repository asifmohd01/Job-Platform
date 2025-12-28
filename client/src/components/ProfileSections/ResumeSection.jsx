import React, { useState, useRef, useEffect } from "react";
import { candidateProfileAPI } from "../../services/apiClient";

const ResumeSection = ({ profile, setProfile, isOwnProfile, candidateId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size
    const maxSize = 6 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File size exceeds 6MB limit");
      return;
    }

    // Check file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/rtf",
      "text/rtf",
    ];
    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file format. Supported: PDF, DOC, DOCX, RTF");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await candidateProfileAPI.uploadResume(file);
      setProfile(response.data.profile);
      setIsEditing(false);
    } catch (err) {
      console.error("Error uploading resume:", err);
      setError("Failed to upload resume");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteResume = async () => {
    if (window.confirm("Are you sure you want to delete your resume?")) {
      try {
        setIsLoading(true);
        const response = await candidateProfileAPI.deleteResume();
        setProfile(response.data.profile);
        setError(null);
      } catch (err) {
        console.error("Error deleting resume:", err);
        setError("Failed to delete resume");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Viewer state: fetch resume via backend (includes Authorization) and display inside SPA
  const [pdfUrl, setPdfUrl] = useState(null);
  const [showViewer, setShowViewer] = useState(false);

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const handleView = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const id = candidateId || profile._id;
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Not authorized, token missing");
        return;
      }

      const res = await fetch(`/api/candidate-profile/resume/view/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Status ${res.status}`);
      }

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      setPdfUrl(objectUrl);
      setShowViewer(true);
    } catch (err) {
      console.error("Error fetching resume for view:", err);
      setError(err.message || "Failed to load resume");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const id = candidateId || profile._id;
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Not authorized, token missing");
        return;
      }

      const res = await fetch(`/api/candidate-profile/resume/download/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Status ${res.status}`);
      }

      const blob = await res.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = profile?.resume?.fileName || "resume";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error("Error downloading resume:", err);
      setError(err.message || "Failed to download resume");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOwnProfile && !profile.resume) {
    return null;
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Resume</h2>
          {isOwnProfile && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                isEditing
                  ? "bg-gray-200 text-gray-800"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isEditing ? "Cancel" : "Edit"}
            </button>
          )}
        </div>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        {isEditing ? (
          <div className="space-y-4">
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500"
              onClick={() => fileInputRef.current?.click()}
            >
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h24a4 4 0 004-4V20m-10-6l-6-6m6 6v12"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="mt-2 text-sm font-medium text-gray-600">
                Upload your resume
              </p>
              <p className="text-xs text-gray-500">
                PDF, DOC, DOCX, RTF up to 6MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.rtf"
                onChange={handleFileChange}
                disabled={isLoading}
                className="hidden"
              />
            </div>
          </div>
        ) : profile.resume ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
                </svg>
                <div className="grow">
                  <p className="font-medium text-gray-900">
                    {profile.resume.fileName}
                  </p>
                  <p className="text-xs text-gray-500">Resume uploaded</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleView}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  View
                </button>
                <button
                  onClick={handleDownload}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors whitespace-nowrap"
                >
                  Download
                </button>
                {isOwnProfile && (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors whitespace-nowrap"
                    >
                      Replace
                    </button>
                    <button
                      onClick={handleDeleteResume}
                      disabled={isLoading}
                      className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 transition-colors whitespace-nowrap"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-400 italic">No resume uploaded</p>
        )}
      </div>
      {showViewer && pdfUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-11/12 h-5/6 rounded shadow-lg overflow-hidden">
            <div className="flex justify-end p-2">
              <button
                onClick={() => setShowViewer(false)}
                className="px-3 py-1 bg-gray-200 rounded"
              >
                Close
              </button>
            </div>
            <iframe
              src={pdfUrl}
              title="Resume Viewer"
              className="w-full h-full"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ResumeSection;
