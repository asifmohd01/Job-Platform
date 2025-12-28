import React, { useState } from "react";
import { candidateProfileAPI } from "../../services/apiClient";

const JobPreferences = ({ profile, setProfile, isOwnProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    preferredJobTitles: profile.jobPreferences?.preferredJobTitles || [],
    preferredLocations: profile.jobPreferences?.preferredLocations || [],
  });
  const [newTitle, setNewTitle] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const jobTitleSuggestions = [
    "Full Stack Developer",
    "Frontend Developer",
    "Backend Developer",
    "Data Scientist",
    "Product Manager",
    "UI/UX Designer",
    "DevOps Engineer",
    "QA Engineer",
  ];

  const locationSuggestions = [
    "New York, NY",
    "San Francisco, CA",
    "Los Angeles, CA",
    "Chicago, IL",
    "Remote",
    "Hybrid",
  ];

  const addJobTitle = () => {
    if (newTitle && !formData.preferredJobTitles.includes(newTitle)) {
      setFormData({
        ...formData,
        preferredJobTitles: [...formData.preferredJobTitles, newTitle],
      });
      setNewTitle("");
    }
  };

  const addLocation = () => {
    if (newLocation && !formData.preferredLocations.includes(newLocation)) {
      setFormData({
        ...formData,
        preferredLocations: [...formData.preferredLocations, newLocation],
      });
      setNewLocation("");
    }
  };

  const removeJobTitle = (title) => {
    setFormData({
      ...formData,
      preferredJobTitles: formData.preferredJobTitles.filter(
        (t) => t !== title
      ),
    });
  };

  const removeLocation = (location) => {
    setFormData({
      ...formData,
      preferredLocations: formData.preferredLocations.filter(
        (l) => l !== location
      ),
    });
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const response = await candidateProfileAPI.updateJobPreferences(formData);
      setProfile(response.data.profile);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      console.error("Error updating job preferences:", err);
      setError("Failed to save preferences");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      preferredJobTitles: profile.jobPreferences?.preferredJobTitles || [],
      preferredLocations: profile.jobPreferences?.preferredLocations || [],
    });
    setIsEditing(false);
    setError(null);
  };

  const hasData =
    (profile.jobPreferences?.preferredJobTitles?.length || 0) > 0 ||
    (profile.jobPreferences?.preferredLocations?.length || 0) > 0;

  if (!isOwnProfile && !hasData) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Job Preferences</h2>
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
        <div className="space-y-6">
          {/* Job Titles */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">
              Preferred Job Titles
            </h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="e.g., Full Stack Developer"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                list="jobTitleList"
                className="flex-1 px-4 py-2 text-gray-900 border border-gray-300 rounded text-base"
                onKeyPress={(e) => e.key === "Enter" && addJobTitle()}
              />
              <datalist id="jobTitleList">
                {jobTitleSuggestions.map((title) => (
                  <option key={title} value={title} />
                ))}
              </datalist>
              <button
                onClick={addJobTitle}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.preferredJobTitles.map((title) => (
                <div
                  key={title}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full"
                >
                  <span className="text-sm">{title}</span>
                  <button
                    onClick={() => removeJobTitle(title)}
                    className="ml-1 font-bold hover:text-blue-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Locations */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">
              Preferred Locations
            </h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="e.g., New York, NY or Remote"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                list="locationList"
                className="flex-1 px-4 py-2 text-gray-900 border border-gray-300 rounded text-base"
                onKeyPress={(e) => e.key === "Enter" && addLocation()}
              />
              <datalist id="locationList">
                {locationSuggestions.map((location) => (
                  <option key={location} value={location} />
                ))}
              </datalist>
              <button
                onClick={addLocation}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.preferredLocations.map((location) => (
                <div
                  key={location}
                  className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full"
                >
                  <span className="text-sm">{location}</span>
                  <button
                    onClick={() => removeLocation(location)}
                    className="ml-1 font-bold hover:text-green-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
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
        <div className="space-y-6">
          {/* Display Job Titles */}
          {formData.preferredJobTitles.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">
                Preferred Job Titles
              </h3>
              <div className="flex flex-wrap gap-2">
                {formData.preferredJobTitles.map((title) => (
                  <span
                    key={title}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {title}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Display Locations */}
          {formData.preferredLocations.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">
                Preferred Locations
              </h3>
              <div className="flex flex-wrap gap-2">
                {formData.preferredLocations.map((location) => (
                  <span
                    key={location}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {location}
                  </span>
                ))}
              </div>
            </div>
          )}

          {formData.preferredJobTitles.length === 0 &&
            formData.preferredLocations.length === 0 && (
              <p className="text-gray-400 italic">
                {isOwnProfile
                  ? "No job preferences added yet"
                  : "No job preferences"}
              </p>
            )}
        </div>
      )}
    </div>
  );
};

export default JobPreferences;
