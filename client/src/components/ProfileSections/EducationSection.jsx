import React, { useState } from "react";
import { candidateProfileAPI } from "../../services/apiClient";

const EducationSection = ({ profile, setProfile, isOwnProfile }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    degree: "",
    institute: "",
    yearOfCompletion: new Date().getFullYear(),
    cgpa: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const resetForm = () => {
    setFormData({
      degree: "",
      institute: "",
      yearOfCompletion: new Date().getFullYear(),
      cgpa: "",
    });
    setEditingId(null);
    setError(null);
  };

  const handleAdd = async () => {
    if (!formData.degree || !formData.institute) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setIsLoading(true);
      const response = await candidateProfileAPI.addEducation(formData);
      setProfile(response.data.profile);
      resetForm();
      setIsAdding(false);
    } catch (err) {
      console.error("Error adding education:", err);
      setError("Failed to add education");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!formData.degree || !formData.institute) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setIsLoading(true);
      const response = await candidateProfileAPI.updateEducation(
        editingId,
        formData
      );
      setProfile(response.data.profile);
      resetForm();
    } catch (err) {
      console.error("Error updating education:", err);
      setError("Failed to update education");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this education?")) {
      try {
        setIsLoading(true);
        const response = await candidateProfileAPI.deleteEducation(id);
        setProfile(response.data.profile);
      } catch (err) {
        console.error("Error deleting education:", err);
        setError("Failed to delete education");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const educations = profile.education || [];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  if (!isOwnProfile && educations.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Education</h2>
        {isOwnProfile && !isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            + Add Education
          </button>
        )}
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {/* Add/Edit Form */}
      {isOwnProfile && (isAdding || editingId) && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Degree *
            </label>
            <input
              type="text"
              placeholder="e.g., Bachelor of Science in Computer Science"
              value={formData.degree}
              onChange={(e) =>
                setFormData({ ...formData, degree: e.target.value })
              }
              className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Institute/University *
            </label>
            <input
              type="text"
              placeholder="e.g., University of Technology"
              value={formData.institute}
              onChange={(e) =>
                setFormData({ ...formData, institute: e.target.value })
              }
              className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year of Completion
            </label>
            <select
              value={formData.yearOfCompletion}
              onChange={(e) =>
                setFormData({ ...formData, yearOfCompletion: e.target.value })
              }
              className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded text-base"
            >
              <option value="">Select Year of Completion</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CGPA / Percentage
            </label>
            <input
              type="text"
              placeholder="e.g., 3.8 or 85%"
              value={formData.cgpa || ""}
              onChange={(e) =>
                setFormData({ ...formData, cgpa: e.target.value })
              }
              className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded text-base"
            />
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

      {/* Education List */}
      {educations.length > 0 ? (
        <div className="space-y-4">
          {educations.map((edu) => (
            <div
              key={edu._id}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-sm"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="grow">
                  <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                  <p className="text-sm text-gray-600">{edu.institute}</p>
                  <p className="text-sm text-gray-500">
                    Year: {edu.yearOfCompletion}
                  </p>
                  {edu.cgpa && (
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">CGPA:</span> {edu.cgpa}
                    </p>
                  )}
                </div>
                {isOwnProfile && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setFormData(edu);
                        setEditingId(edu._id);
                      }}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(edu._id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">{edu.yearOfCompletion}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 italic">
          {isOwnProfile ? "No education added yet" : "No education"}
        </p>
      )}
    </div>
  );
};

export default EducationSection;
