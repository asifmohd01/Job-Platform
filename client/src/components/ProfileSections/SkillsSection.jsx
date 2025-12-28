import React, { useState } from "react";
import { candidateProfileAPI } from "../../services/apiClient";

const SkillsSection = ({ profile, setProfile, isOwnProfile }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAddSkill = async () => {
    if (!newSkill.trim()) {
      setError("Please enter a skill");
      return;
    }

    try {
      setIsLoading(true);
      const response = await candidateProfileAPI.addSkill(newSkill.trim());
      setProfile(response.data.profile);
      setNewSkill("");
      setIsAdding(false);
      setError(null);
    } catch (err) {
      console.error("Error adding skill:", err);
      setError("Failed to add skill");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveSkill = async (skill) => {
    try {
      setIsLoading(true);
      const response = await candidateProfileAPI.removeSkill(skill);
      setProfile(response.data.profile);
    } catch (err) {
      console.error("Error removing skill:", err);
      setError("Failed to remove skill");
    } finally {
      setIsLoading(false);
    }
  };

  const skills = profile.skills || [];

  if (!isOwnProfile && skills.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Skills</h2>
        {isOwnProfile && !isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            + Add Skill
          </button>
        )}
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {/* Add Skill Form */}
      {isOwnProfile && isAdding && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add New Skill
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter a skill (e.g., React, Python, etc.)"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddSkill()}
              className="flex-1 px-4 py-2 text-gray-900 border border-gray-300 rounded text-base"
              autoFocus
            />
            <button
              onClick={handleAddSkill}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              {isLoading ? "Adding..." : "Add"}
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewSkill("");
              }}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Skills List */}
      {skills.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <div
              key={skill}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full"
            >
              <span className="text-sm font-medium">{skill}</span>
              {isOwnProfile && (
                <button
                  onClick={() => handleRemoveSkill(skill)}
                  className="ml-1 text-blue-600 hover:text-blue-800 font-bold"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 italic">
          {isOwnProfile ? "No skills added yet" : "No skills"}
        </p>
      )}
    </div>
  );
};

export default SkillsSection;
