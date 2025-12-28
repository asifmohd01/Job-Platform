import React, { useState } from "react";
import { candidateProfileAPI } from "../../services/apiClient";

const SocialLinks = ({ profile, setProfile, isOwnProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    linkedin: profile.socialLinks?.linkedin || "",
    github: profile.socialLinks?.github || "",
    portfolio: profile.socialLinks?.portfolio || "",
    other: profile.socialLinks?.other || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const response = await candidateProfileAPI.updateSocialLinks(formData);
      setProfile(response.data.profile);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      console.error("Error updating social links:", err);
      setError("Failed to save links");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      linkedin: profile.socialLinks?.linkedin || "",
      github: profile.socialLinks?.github || "",
      portfolio: profile.socialLinks?.portfolio || "",
      other: profile.socialLinks?.other || "",
    });
    setIsEditing(false);
    setError(null);
  };

  const hasData =
    profile.socialLinks?.linkedin ||
    profile.socialLinks?.github ||
    profile.socialLinks?.portfolio ||
    profile.socialLinks?.other;

  if (!isOwnProfile && !hasData) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Social Links</h2>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              LinkedIn URL
            </label>
            <input
              type="url"
              placeholder="https://linkedin.com/in/yourprofile"
              value={formData.linkedin}
              onChange={(e) =>
                setFormData({ ...formData, linkedin: e.target.value })
              }
              className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GitHub URL
            </label>
            <input
              type="url"
              placeholder="https://github.com/yourprofile"
              value={formData.github}
              onChange={(e) =>
                setFormData({ ...formData, github: e.target.value })
              }
              className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Portfolio URL
            </label>
            <input
              type="url"
              placeholder="https://yourportfolio.com"
              value={formData.portfolio}
              onChange={(e) =>
                setFormData({ ...formData, portfolio: e.target.value })
              }
              className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Other Link
            </label>
            <input
              type="url"
              placeholder="Any other relevant link"
              value={formData.other}
              onChange={(e) =>
                setFormData({ ...formData, other: e.target.value })
              }
              className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded text-base"
            />
          </div>
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
        <div className="space-y-3">
          {formData.linkedin && (
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">LinkedIn:</span>
              <a
                href={formData.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline text-sm truncate"
              >
                {formData.linkedin}
              </a>
            </div>
          )}
          {formData.github && (
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">GitHub:</span>
              <a
                href={formData.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline text-sm truncate"
              >
                {formData.github}
              </a>
            </div>
          )}
          {formData.portfolio && (
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">Portfolio:</span>
              <a
                href={formData.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline text-sm truncate"
              >
                {formData.portfolio}
              </a>
            </div>
          )}
          {formData.other && (
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">Other:</span>
              <a
                href={formData.other}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline text-sm truncate"
              >
                {formData.other}
              </a>
            </div>
          )}
          {!hasData && (
            <p className="text-gray-400 italic">
              {isOwnProfile ? "No social links added yet" : "No social links"}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SocialLinks;
