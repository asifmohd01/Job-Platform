import axios from "axios";

// Configurable API base; set VITE_API_URL (e.g., http://localhost:5001/api). Defaults to "/api" for Vite proxy.
const API_URL = import.meta.env?.VITE_API_URL || "/api";

// Authenticated client
const apiClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach token automatically
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login on 401
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Public client for auth (no token interceptor)
const publicClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

export const authAPI = {
  register: (name, email, password, role) =>
    publicClient.post("/auth/register", { name, email, password, role }),
  login: (email, password) =>
    publicClient.post("/auth/login", { email, password }),
  me: () => apiClient.get("/auth/me"),
};

export const jobsAPI = {
  getJobs: (filters = {}) => apiClient.get("/jobs", { params: filters }),
  getJobById: (id) => apiClient.get(`/jobs/${id}`),
  createJob: (data) => apiClient.post("/jobs", data),
  updateJob: (id, data) => apiClient.put(`/jobs/${id}`, data),
  deleteJob: (id) => apiClient.delete(`/jobs/${id}`),
  getMyJobs: () => apiClient.get("/jobs/recruiter/my-jobs"),
  markFilled: (id) => apiClient.put(`/jobs/${id}`, { status: "filled" }),
  markOpen: (id) => apiClient.put(`/jobs/${id}`, { status: "open" }),
  // Candidate saved jobs
  getSavedJobs: () => apiClient.get("/jobs/me/saved"),
  saveJob: (id) => apiClient.post(`/jobs/${id}/save`),
  unsaveJob: (id) => apiClient.delete(`/jobs/${id}/save`),
};

export const applicationsAPI = {
  apply: (jobId, formData) =>
    apiClient.post(`/applications/${jobId}/apply`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getMyApplications: () => apiClient.get(`/applications/me/my-applications`),
  getApplicationsForJob: (jobId) => apiClient.get(`/applications/${jobId}`),
  getJobApplications: (jobId) =>
    apiClient.get(`/applications/job/${jobId}/applications`),
  getRecruiterApplications: () =>
    apiClient.get("/applications/recruiter/all-applications"),
  updateApplicationStatus: (applicationId, status) =>
    apiClient.put(`/applications/${applicationId}/status`, { status }),
};

export const recruiterAPI = {
  updateCompanyProfile: (data) =>
    apiClient.put("/recruiter/company-profile", data),
  getCompanyProfile: () => apiClient.get("/recruiter/company-profile"),
  getRecruiterDashboard: () => apiClient.get("/recruiter/dashboard"),
};

export const candidateProfileAPI = {
  getMyProfile: () => apiClient.get("/candidate-profile/my-profile"),
  getCandidateProfile: (candidateId) =>
    apiClient.get(`/candidate-profile/${candidateId}`),
  updateProfileSummary: (summary) =>
    apiClient.patch("/candidate-profile/update/summary", { summary }),
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append("resume", file);
    return apiClient.post("/candidate-profile/resume/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  deleteResume: () => apiClient.delete("/candidate-profile/resume"),
  addWorkExperience: (data) =>
    apiClient.post("/candidate-profile/work-experience", data),
  updateWorkExperience: (experienceId, data) =>
    apiClient.patch(`/candidate-profile/work-experience/${experienceId}`, data),
  deleteWorkExperience: (experienceId) =>
    apiClient.delete(`/candidate-profile/work-experience/${experienceId}`),
  addSkill: (skill) => apiClient.post("/candidate-profile/skills", { skill }),
  removeSkill: (skill) =>
    apiClient.delete("/candidate-profile/skills", { data: { skill } }),
  addEducation: (data) =>
    apiClient.post("/candidate-profile/education", data),
  updateEducation: (educationId, data) =>
    apiClient.patch(`/candidate-profile/education/${educationId}`, data),
  deleteEducation: (educationId) =>
    apiClient.delete(`/candidate-profile/education/${educationId}`),
  updateJobPreferences: (data) =>
    apiClient.patch("/candidate-profile/job-preferences", data),
  updatePersonalDetails: (data) =>
    apiClient.patch("/candidate-profile/personal-details", data),
  addCertification: (data) =>
    apiClient.post("/candidate-profile/certifications", data),
  updateCertification: (certificationId, data) =>
    apiClient.patch(`/candidate-profile/certifications/${certificationId}`, data),
  deleteCertification: (certificationId) =>
    apiClient.delete(`/candidate-profile/certifications/${certificationId}`),
  addProject: (data) => apiClient.post("/candidate-profile/projects", data),
  updateProject: (projectId, data) =>
    apiClient.patch(`/candidate-profile/projects/${projectId}`, data),
  deleteProject: (projectId) =>
    apiClient.delete(`/candidate-profile/projects/${projectId}`),
  addAward: (data) => apiClient.post("/candidate-profile/awards", data),
  updateAward: (awardId, data) =>
    apiClient.patch(`/candidate-profile/awards/${awardId}`, data),
  deleteAward: (awardId) =>
    apiClient.delete(`/candidate-profile/awards/${awardId}`),
  updateSocialLinks: (data) =>
    apiClient.patch("/candidate-profile/social-links", data),
  addLanguage: (data) => apiClient.post("/candidate-profile/languages", data),
  updateLanguage: (languageId, data) =>
    apiClient.patch(`/candidate-profile/languages/${languageId}`, data),
  deleteLanguage: (languageId) =>
    apiClient.delete(`/candidate-profile/languages/${languageId}`),
};

export default apiClient;
