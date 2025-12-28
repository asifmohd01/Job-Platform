import React, { useState } from "react";
import { candidateProfileAPI } from "../../services/apiClient";

const WorkExperience = ({ profile, setProfile, isOwnProfile }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    companyName: "",
    jobTitle: "",
    employmentType: "Full-time",
    startDate: "",
    endDate: "",
    currentlyWorking: false,
    industry: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const resetForm = () => {
    setFormData({
      companyName: "",
      jobTitle: "",
      employmentType: "Full-time",
      startDate: "",
      endDate: "",
      currentlyWorking: false,
      industry: "",
      description: "",
    });
    setEditingId(null);
    setError(null);
  };

  const handleAdd = async () => {
    if (!formData.companyName || !formData.jobTitle || !formData.startDate) {
      setError("Please fill in required fields");
      return;
    }

    try {
      setIsLoading(true);
      const response = await candidateProfileAPI.addWorkExperience(formData);
      setProfile(response.data.profile);
      resetForm();
      setIsAdding(false);
    } catch (err) {
      console.error("Error adding work experience:", err);
      setError("Failed to add work experience");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!formData.companyName || !formData.jobTitle || !formData.startDate) {
      setError("Please fill in required fields");
      return;
    }

    try {
      setIsLoading(true);
      const response = await candidateProfileAPI.updateWorkExperience(
        editingId,
        formData
      );
      setProfile(response.data.profile);
      resetForm();
    } catch (err) {
      console.error("Error updating work experience:", err);
      setError("Failed to update work experience");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this experience?")) {
      try {
        setIsLoading(true);
        const response = await candidateProfileAPI.deleteWorkExperience(id);
        setProfile(response.data.profile);
      } catch (err) {
        console.error("Error deleting work experience:", err);
        setError("Failed to delete work experience");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const calculateDuration = (startDate, endDate, currentlyWorking) => {
    if (!startDate) return "";
    const start = new Date(startDate);
    const end = currentlyWorking ? new Date() : new Date(endDate);
    const months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (years > 0 && remainingMonths > 0)
      return `${years}y ${remainingMonths}m`;
    if (years > 0) return `${years}y`;
    if (remainingMonths > 0) return `${remainingMonths}m`;
    return "< 1m";
  };

  const experiences = profile.workExperience || [];

  if (!isOwnProfile && experiences.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Work Experience</h2>
        {isOwnProfile && !isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            + Add Experience
          </button>
        )}
      </div>

      {error && <p className="text-red-300 text-sm mb-4">{error}</p>}

      {/* Add/Edit Form */}
      {isOwnProfile && (isAdding || editingId) && (
        <div className="mb-6 p-4 bg-gray-700 rounded-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Company Name *
            </label>
            <input
              type="text"
              placeholder="e.g., Tech Corp"
              value={formData.companyName}
              onChange={(e) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
              className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded text-base"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Job Title *
              </label>
              <input
                type="text"
                placeholder="e.g., Senior Engineer"
                value={formData.jobTitle}
                onChange={(e) =>
                  setFormData({ ...formData, jobTitle: e.target.value })
                }
                className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Employment Type
              </label>
              <select
                value={formData.employmentType}
                onChange={(e) =>
                  setFormData({ ...formData, employmentType: e.target.value })
                }
                className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded text-base"
              >
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Freelance</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Industry
            </label>
            <input
              type="text"
              placeholder="e.g., Information Technology"
              value={formData.industry}
              onChange={(e) =>
                setFormData({ ...formData, industry: e.target.value })
              }
              className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded text-base"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded text-base"
              />
            </div>
            {!formData.currentlyWorking && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded text-base"
                />
              </div>
            )}
          </div>
          <label className="flex items-center gap-2 p-2 text-gray-300">
            <input
              type="checkbox"
              checked={formData.currentlyWorking}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  currentlyWorking: e.target.checked,
                })
              }
            />
            <span className="text-sm">I currently work here</span>
          </label>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              placeholder="Describe your responsibilities and achievements..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded text-base"
              rows="3"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={editingId ? handleEdit : handleAdd}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Experience List */}
      {experiences.length > 0 ? (
        <div className="space-y-4">
          {experiences.map((exp) => (
            <div
              key={exp._id}
              className="p-4 border border-gray-700 rounded-lg hover:bg-gray-700"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="grow">
                  <h3 className="font-semibold text-white">
                    {exp.jobTitle}
                  </h3>
                  <p className="text-sm text-gray-300">
                    <span className="font-medium text-gray-200">Company:</span>{" "}
                    {exp.companyName}
                  </p>
                  {exp.industry && (
                    <p className="text-xs text-gray-400">
                      <span className="font-medium text-gray-300">Industry:</span>{" "}
                      {exp.industry}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">
                    <span className="font-medium text-gray-300">Type:</span>{" "}
                    {exp.employmentType}
                  </p>
                  <p className="text-xs text-gray-400">
                    <span className="font-medium text-gray-300">Duration:</span>{" "}
                    {calculateDuration(
                      exp.startDate,
                      exp.endDate,
                      exp.currentlyWorking
                    )}
                  </p>
                </div>
                {isOwnProfile && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setFormData(exp);
                        setEditingId(exp._id);
                      }}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(exp._id)}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-400 mb-2">
                {new Date(exp.startDate).toLocaleDateString()} -{" "}
                {exp.currentlyWorking
                  ? "Present"
                  : new Date(exp.endDate).toLocaleDateString()}{" "}
                (
                {calculateDuration(
                  exp.startDate,
                  exp.endDate,
                  exp.currentlyWorking
                )}
                )
              </p>
              {exp.description && (
                <p className="text-sm text-gray-300">{exp.description}</p>
              )}
              <span className="inline-block mt-2 text-xs bg-gray-700 text-gray-200 px-2 py-1 rounded">
                {exp.employmentType}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 italic">
          {isOwnProfile ? "No work experience added yet" : "No work experience"}
        </p>
      )}
    </div>
  );
};

export default WorkExperience;
