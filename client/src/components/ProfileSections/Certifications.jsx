import React, { useState } from "react";
import { candidateProfileAPI } from "../../services/apiClient";

const Certifications = ({ profile, setProfile, isOwnProfile }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    issuingOrganization: "",
    year: new Date().getFullYear(),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const resetForm = () => {
    setFormData({
      name: "",
      issuingOrganization: "",
      year: new Date().getFullYear(),
    });
    setEditingId(null);
    setError(null);
  };

  const handleAdd = async () => {
    if (!formData.name || !formData.issuingOrganization) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setIsLoading(true);
      const response = await candidateProfileAPI.addCertification(formData);
      setProfile(response.data.profile);
      resetForm();
      setIsAdding(false);
    } catch (err) {
      console.error("Error adding certification:", err);
      setError("Failed to add certification");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!formData.name || !formData.issuingOrganization) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setIsLoading(true);
      const response = await candidateProfileAPI.updateCertification(
        editingId,
        formData
      );
      setProfile(response.data.profile);
      resetForm();
    } catch (err) {
      console.error("Error updating certification:", err);
      setError("Failed to update certification");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this certification?")) {
      try {
        setIsLoading(true);
        const response = await candidateProfileAPI.deleteCertification(id);
        setProfile(response.data.profile);
      } catch (err) {
        console.error("Error deleting certification:", err);
        setError("Failed to delete certification");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const certifications = profile.certifications || [];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  if (!isOwnProfile && certifications.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Certifications & Licenses
        </h2>
        {isOwnProfile && !isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            + Add Certification
          </button>
        )}
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {/* Add/Edit Form */}
      {isOwnProfile && (isAdding || editingId) && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Certification Name *
            </label>
            <input
              type="text"
              placeholder="e.g., AWS Solutions Architect Associate"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issuing Organization *
            </label>
            <input
              type="text"
              placeholder="e.g., Amazon Web Services (AWS)"
              value={formData.issuingOrganization}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  issuingOrganization: e.target.value,
                })
              }
              className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year Obtained
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

      {/* Certification List */}
      {certifications.length > 0 ? (
        <div className="space-y-4">
          {certifications.map((cert) => (
            <div
              key={cert._id}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-sm"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="grow">
                  <h3 className="font-semibold text-gray-900">{cert.name}</h3>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Organization:</span>{" "}
                    {cert.issuingOrganization}
                  </p>
                  <p className="text-xs text-gray-500">
                    <span className="font-medium">Year:</span> {cert.year}
                  </p>
                </div>
                {isOwnProfile && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setFormData(cert);
                        setEditingId(cert._id);
                      }}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cert._id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">{cert.year}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 italic">
          {isOwnProfile ? "No certifications added yet" : "No certifications"}
        </p>
      )}
    </div>
  );
};

export default Certifications;
