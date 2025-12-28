import React, { useState } from "react";
import { candidateProfileAPI } from "../../services/apiClient";

const PersonalDetails = ({ profile, setProfile, isOwnProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    country: profile.personalDetails?.country || "",
    nationality: profile.personalDetails?.nationality || "",
    workPermitStatus: profile.personalDetails?.workPermitStatus || "",
    speciallyAbled: profile.personalDetails?.speciallyAbled || false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const response = await candidateProfileAPI.updatePersonalDetails(
        formData
      );
      setProfile(response.data.profile);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      console.error("Error updating personal details:", err);
      setError("Failed to save details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      country: profile.personalDetails?.country || "",
      nationality: profile.personalDetails?.nationality || "",
      workPermitStatus: profile.personalDetails?.workPermitStatus || "",
      speciallyAbled: profile.personalDetails?.speciallyAbled || false,
    });
    setIsEditing(false);
    setError(null);
  };

  const hasData =
    profile.personalDetails?.country ||
    profile.personalDetails?.nationality ||
    profile.personalDetails?.workPermitStatus;

  if (!isOwnProfile && !hasData) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Personal Details
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <input
              type="text"
              placeholder="Enter your country"
              value={formData.country}
              onChange={(e) =>
                setFormData({ ...formData, country: e.target.value })
              }
              className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nationality
            </label>
            <input
              type="text"
              placeholder="Enter your nationality"
              value={formData.nationality}
              onChange={(e) =>
                setFormData({ ...formData, nationality: e.target.value })
              }
              className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Work Permit Status
            </label>
            <select
              value={formData.workPermitStatus}
              onChange={(e) =>
                setFormData({ ...formData, workPermitStatus: e.target.value })
              }
              className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded text-base"
            >
              <option value="">Select Work Permit Status</option>
              <option value="Citizen">Citizen</option>
              <option value="Permanent Resident">Permanent Resident</option>
              <option value="Work Visa">Work Visa</option>
              <option value="Sponsored">Sponsored</option>
            </select>
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.speciallyAbled}
              onChange={(e) =>
                setFormData({ ...formData, speciallyAbled: e.target.checked })
              }
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">Specially Abled</span>
          </label>
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
        <div className="grid grid-cols-2 gap-4">
          {formData.country && (
            <div>
              <p className="text-sm text-gray-600">Country</p>
              <p className="font-medium text-gray-900">{formData.country}</p>
            </div>
          )}
          {formData.nationality && (
            <div>
              <p className="text-sm text-gray-600">Nationality</p>
              <p className="font-medium text-gray-900">
                {formData.nationality}
              </p>
            </div>
          )}
          {formData.workPermitStatus && (
            <div>
              <p className="text-sm text-gray-600">Work Permit Status</p>
              <p className="font-medium text-gray-900">
                {formData.workPermitStatus}
              </p>
            </div>
          )}
          {formData.speciallyAbled && (
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-medium text-gray-900">Specially Abled</p>
            </div>
          )}
          {!hasData && (
            <p className="col-span-2 text-gray-400 italic">
              {isOwnProfile
                ? "No personal details added yet"
                : "No personal details"}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default PersonalDetails;
