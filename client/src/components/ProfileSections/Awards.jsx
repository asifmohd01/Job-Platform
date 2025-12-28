import React, { useState } from "react";
import { candidateProfileAPI } from "../../services/apiClient";

const Awards = ({ profile, setProfile, isOwnProfile }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    awardedBy: "",
    year: new Date().getFullYear(),
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const resetForm = () => {
    setFormData({
      title: "",
      awardedBy: "",
      year: new Date().getFullYear(),
      description: "",
    });
    setEditingId(null);
    setError(null);
  };

  const handleAdd = async () => {
    if (!formData.title || !formData.awardedBy) {
      setError("Please fill in award title and issuer");
      return;
    }

    try {
      setIsLoading(true);
      const response = await candidateProfileAPI.addAward(formData);
      setProfile(response.data.profile);
      resetForm();
      setIsAdding(false);
    } catch (err) {
      console.error("Error adding award:", err);
      setError("Failed to add award");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!formData.title || !formData.awardedBy) {
      setError("Please fill in award title and issuer");
      return;
    }

    try {
      setIsLoading(true);
      const response = await candidateProfileAPI.updateAward(
        editingId,
        formData
      );
      setProfile(response.data.profile);
      resetForm();
    } catch (err) {
      console.error("Error updating award:", err);
      setError("Failed to update award");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this award?")) {
      try {
        setIsLoading(true);
        const response = await candidateProfileAPI.deleteAward(id);
        setProfile(response.data.profile);
      } catch (err) {
        console.error("Error deleting award:", err);
        setError("Failed to delete award");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const awards = profile.awards || [];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  if (!isOwnProfile && awards.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Awards & Recognition
        </h2>
        {isOwnProfile && !isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            + Add Award
          </button>
        )}
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {/* Add/Edit Form */}
      {isOwnProfile && (isAdding || editingId) && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Award Title *
            </label>
            <input
              type="text"
              placeholder="e.g., Best Employee of the Year"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Awarded By *
            </label>
            <input
              type="text"
              placeholder="e.g., Company Name or Organization"
              value={formData.awardedBy}
              onChange={(e) =>
                setFormData({ ...formData, awardedBy: e.target.value })
              }
              className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <select
              value={formData.year}
              onChange={(e) =>
                setFormData({ ...formData, year: e.target.value })
              }
              className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded text-base"
            >
              <option value="">Select Year</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              placeholder="Describe the award and your accomplishment..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded text-base"
              rows="3"
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

      {/* Awards List */}
      {awards.length > 0 ? (
        <div className="space-y-4">
          {awards.map((award) => (
            <div
              key={award._id}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-sm"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="grow">
                  <h3 className="font-semibold text-gray-900">{award.title}</h3>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Awarded By:</span>{" "}
                    {award.awardedBy}
                  </p>
                  <p className="text-xs text-gray-500">
                    <span className="font-medium">Year:</span> {award.year}
                  </p>
                </div>
                {isOwnProfile && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setFormData(award);
                        setEditingId(award._id);
                      }}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(award._id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
              {award.description && (
                <p className="text-sm text-gray-700 mt-2">
                  {award.description}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 italic">
          {isOwnProfile ? "No awards added yet" : "No awards"}
        </p>
      )}
    </div>
  );
};

export default Awards;
