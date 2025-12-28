import React, { useState } from "react";
import { candidateProfileAPI } from "../../services/apiClient";

const ProfileSummary = ({ profile, setProfile, isOwnProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [summary, setSummary] = useState(profile.summary || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const response = await candidateProfileAPI.updateProfileSummary(summary);
      setProfile(response.data.profile);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      console.error("Error saving summary:", err);
      setError("Failed to save summary");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setSummary(profile.summary || "");
    setIsEditing(false);
    setError(null);
  };

  if (!isOwnProfile && !profile.summary) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Professional Summary
        </h2>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Professional Summary
          </label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Write a brief professional summary about yourself..."
            className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
            rows="5"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="text-gray-700 whitespace-pre-wrap">
          {profile.summary || (
            <p className="text-gray-400 italic">No summary added yet</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileSummary;
