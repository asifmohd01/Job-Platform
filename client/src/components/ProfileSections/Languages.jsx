import React, { useState } from "react";
import { candidateProfileAPI } from "../../services/apiClient";

const Languages = ({ profile, setProfile, isOwnProfile }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    language: "",
    proficiencyLevel: "Intermediate",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const proficiencyLevels = [
    "Elementary",
    "Intermediate",
    "Upper Intermediate",
    "Advanced",
    "Proficient",
    "Native",
  ];

  const resetForm = () => {
    setFormData({
      language: "",
      proficiencyLevel: "Intermediate",
    });
    setEditingId(null);
    setError(null);
  };

  const handleAdd = async () => {
    if (!formData.language) {
      setError("Please enter a language");
      return;
    }

    try {
      setIsLoading(true);
      const response = await candidateProfileAPI.addLanguage(formData);
      setProfile(response.data.profile);
      resetForm();
      setIsAdding(false);
    } catch (err) {
      console.error("Error adding language:", err);
      setError("Failed to add language");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!formData.language) {
      setError("Please enter a language");
      return;
    }

    try {
      setIsLoading(true);
      const response = await candidateProfileAPI.updateLanguage(
        editingId,
        formData
      );
      setProfile(response.data.profile);
      resetForm();
    } catch (err) {
      console.error("Error updating language:", err);
      setError("Failed to update language");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this language?")) {
      try {
        setIsLoading(true);
        const response = await candidateProfileAPI.deleteLanguage(id);
        setProfile(response.data.profile);
      } catch (err) {
        console.error("Error deleting language:", err);
        setError("Failed to delete language");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const languages = profile.languages || [];

  if (!isOwnProfile && languages.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Languages</h2>
        {isOwnProfile && !isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            + Add Language
          </button>
        )}
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {/* Add/Edit Form */}
      {isOwnProfile && (isAdding || editingId) && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Language *
            </label>
            <input
              type="text"
              placeholder="e.g., English, Spanish, Mandarin"
              value={formData.language}
              onChange={(e) =>
                setFormData({ ...formData, language: e.target.value })
              }
              className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded text-base"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Proficiency Level
            </label>
            <select
              value={formData.proficiencyLevel}
              onChange={(e) =>
                setFormData({ ...formData, proficiencyLevel: e.target.value })
              }
              className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded text-base"
            >
              {proficiencyLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={editingId ? handleEdit : handleAdd}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Language List */}
      {languages.length > 0 ? (
        <div className="space-y-3">
          {languages.map((lang) => (
            <div
              key={lang._id}
              className="p-3 border border-gray-200 rounded-lg flex items-center justify-between"
            >
              <div>
                <h3 className="font-semibold text-gray-900">{lang.language}</h3>
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Proficiency:</span>{" "}
                  {lang.proficiencyLevel}
                </p>
              </div>
              {isOwnProfile && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setFormData(lang);
                      setEditingId(lang._id);
                    }}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(lang._id)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 italic">
          {isOwnProfile ? "No languages added yet" : "No languages"}
        </p>
      )}
    </div>
  );
};

export default Languages;
