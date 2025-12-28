import React, { useState } from "react";
import { candidateProfileAPI } from "../../services/apiClient";

const Projects = ({ profile, setProfile, isOwnProfile }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    techStack: [],
    githubLink: "",
    liveLink: "",
  });
  const [newTech, setNewTech] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      techStack: [],
      githubLink: "",
      liveLink: "",
    });
    setEditingId(null);
    setNewTech("");
    setError(null);
  };

  const addTech = () => {
    if (newTech && !formData.techStack.includes(newTech)) {
      setFormData({
        ...formData,
        techStack: [...formData.techStack, newTech],
      });
      setNewTech("");
    }
  };

  const removeTech = (tech) => {
    setFormData({
      ...formData,
      techStack: formData.techStack.filter((t) => t !== tech),
    });
  };

  const handleAdd = async () => {
    if (!formData.name || !formData.description) {
      setError("Please fill in project name and description");
      return;
    }

    try {
      setIsLoading(true);
      const response = await candidateProfileAPI.addProject(formData);
      setProfile(response.data.profile);
      resetForm();
      setIsAdding(false);
    } catch (err) {
      console.error("Error adding project:", err);
      setError("Failed to add project");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!formData.name || !formData.description) {
      setError("Please fill in project name and description");
      return;
    }

    try {
      setIsLoading(true);
      const response = await candidateProfileAPI.updateProject(
        editingId,
        formData
      );
      setProfile(response.data.profile);
      resetForm();
    } catch (err) {
      console.error("Error updating project:", err);
      setError("Failed to update project");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        setIsLoading(true);
        const response = await candidateProfileAPI.deleteProject(id);
        setProfile(response.data.profile);
      } catch (err) {
        console.error("Error deleting project:", err);
        setError("Failed to delete project");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const projects = profile.projects || [];

  if (!isOwnProfile && projects.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Projects</h2>
        {isOwnProfile && !isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            + Add Project
          </button>
        )}
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {/* Add/Edit Form */}
      {isOwnProfile && (isAdding || editingId) && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Name *
            </label>
            <input
              type="text"
              placeholder="e.g., E-commerce Platform"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              placeholder="Describe your project, its features and impact..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded text-base"
              rows="3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tech Stack
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="e.g., React, Node.js, MongoDB"
                value={newTech}
                onChange={(e) => setNewTech(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addTech()}
                className="flex-1 px-4 py-2 text-gray-900 border border-gray-300 rounded text-base"
              />
              <button
                onClick={addTech}
                className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.techStack.map((tech) => (
                <div
                  key={tech}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full"
                >
                  <span className="text-sm">{tech}</span>
                  <button
                    onClick={() => removeTech(tech)}
                    className="ml-1 font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GitHub Link
            </label>
            <input
              type="url"
              placeholder="https://github.com/username/project"
              value={formData.githubLink}
              onChange={(e) =>
                setFormData({ ...formData, githubLink: e.target.value })
              }
              className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Live Demo Link
            </label>
            <input
              type="url"
              placeholder="https://project-demo.com"
              value={formData.liveLink}
              onChange={(e) =>
                setFormData({ ...formData, liveLink: e.target.value })
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

      {/* Project List */}
      {projects.length > 0 ? (
        <div className="space-y-4">
          {projects.map((project) => (
            <div
              key={project._id}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{project.name}</h3>
                {isOwnProfile && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setFormData(project);
                        setEditingId(project._id);
                      }}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(project._id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-700 mb-3">
                {project.description}
              </p>
              {project.techStack && project.techStack.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-600 mb-2">Tech Stack:</p>
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {(project.githubLink || project.liveLink) && (
                <div className="flex gap-2 pt-2">
                  {project.githubLink && (
                    <a
                      href={project.githubLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      GitHub
                    </a>
                  )}
                  {project.liveLink && (
                    <a
                      href={project.liveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      Live Demo
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 italic">
          {isOwnProfile ? "No projects added yet" : "No projects"}
        </p>
      )}
    </div>
  );
};

export default Projects;
