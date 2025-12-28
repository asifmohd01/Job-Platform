import axios from "axios";

// Use relative API path so Vite can proxy in development and avoid CORS
const API_URL = "/api";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    if (!config.headers) config.headers = {};
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (name, email, password, role) =>
    apiClient.post("/auth/register", { name, email, password, role }),
  login: (email, password) =>
    apiClient.post("/auth/login", { email, password }),
  me: () => apiClient.get("/auth/me"),
};

export const jobsAPI = {
  getJobs: (filters = {}) => apiClient.get("/jobs", { params: filters }),
  getJobById: (id) => apiClient.get(`/jobs/${id}`),
  createJob: (data) => apiClient.post("/jobs", data),
  updateJob: (id, data) => apiClient.put(`/jobs/${id}`, data),
  deleteJob: (id) => apiClient.delete(`/jobs/${id}`),
  getMyJobs: () => apiClient.get("/jobs/recruiter/my-jobs"),
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

export const adminAPI = {
  getUsers: () => apiClient.get("/admin/users"),
  blockUser: (id) => apiClient.put(`/admin/users/${id}/block`),
  deleteUser: (id) => apiClient.delete(`/admin/users/${id}`),
  getAllJobs: () => apiClient.get("/admin/jobs"),
};

export const candidateProfileAPI = {
  // Get candidate's own profile
  getMyProfile: () => apiClient.get("/candidate-profile/my-profile"),
  
  // Get any candidate's profile (read-only for recruiters)
  getCandidateProfile: (candidateId) =>
    apiClient.get(`/candidate-profile/${candidateId}`),
  
  // Profile summary
  updateProfileSummary: (summary) =>
    apiClient.patch("/candidate-profile/update/summary", { summary }),
  
  // Resume operations
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append("resume", file);
    return apiClient.post("/candidate-profile/resume/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  deleteResume: () => apiClient.delete("/candidate-profile/resume"),
  
  // Work experience
  addWorkExperience: (data) =>
    apiClient.post("/candidate-profile/work-experience", data),
  updateWorkExperience: (experienceId, data) =>
    apiClient.patch(`/candidate-profile/work-experience/${experienceId}`, data),
  deleteWorkExperience: (experienceId) =>
    apiClient.delete(`/candidate-profile/work-experience/${experienceId}`),
  
  // Skills
  addSkill: (skill) => apiClient.post("/candidate-profile/skills", { skill }),
  removeSkill: (skill) =>
    apiClient.delete("/candidate-profile/skills", { data: { skill } }),
  
  // Education
  addEducation: (data) =>
    apiClient.post("/candidate-profile/education", data),
  updateEducation: (educationId, data) =>
    apiClient.patch(`/candidate-profile/education/${educationId}`, data),
  deleteEducation: (educationId) =>
    apiClient.delete(`/candidate-profile/education/${educationId}`),
  
  // Job preferences
  updateJobPreferences: (data) =>
    apiClient.patch("/candidate-profile/job-preferences", data),
  
  // Personal details
  updatePersonalDetails: (data) =>
    apiClient.patch("/candidate-profile/personal-details", data),
  
  // Certifications
  addCertification: (data) =>
    apiClient.post("/candidate-profile/certifications", data),
  updateCertification: (certificationId, data) =>
    apiClient.patch(`/candidate-profile/certifications/${certificationId}`, data),
  deleteCertification: (certificationId) =>
    apiClient.delete(`/candidate-profile/certifications/${certificationId}`),
  
  // Projects
  addProject: (data) => apiClient.post("/candidate-profile/projects", data),
  updateProject: (projectId, data) =>
    apiClient.patch(`/candidate-profile/projects/${projectId}`, data),
  deleteProject: (projectId) =>
    apiClient.delete(`/candidate-profile/projects/${projectId}`),
  
  // Awards
  addAward: (data) => apiClient.post("/candidate-profile/awards", data),
  updateAward: (awardId, data) =>
    apiClient.patch(`/candidate-profile/awards/${awardId}`, data),
  deleteAward: (awardId) =>
    apiClient.delete(`/candidate-profile/awards/${awardId}`),
  
  // Social links
  updateSocialLinks: (data) =>
    apiClient.patch("/candidate-profile/social-links", data),
  
  // Languages
  addLanguage: (data) => apiClient.post("/candidate-profile/languages", data),
  updateLanguage: (languageId, data) =>
    apiClient.patch(`/candidate-profile/languages/${languageId}`, data),
  deleteLanguage: (languageId) =>
    apiClient.delete(`/candidate-profile/languages/${languageId}`),
};

export default apiClient;
