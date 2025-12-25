import axios from "axios";

const API_URL = "http://localhost:5000/api";

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
    config.headers.Authorization = `Bearer ${token}`;
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
};

export const applicationsAPI = {
  apply: (jobId, formData) =>
    apiClient.post(`/applications/${jobId}/apply`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getMyApplications: () => apiClient.get(`/applications/me/my-applications`),
  getApplicationsForJob: (jobId) => apiClient.get(`/applications/${jobId}`),
};

export const adminAPI = {
  getUsers: () => apiClient.get("/admin/users"),
  blockUser: (id) => apiClient.put(`/admin/users/${id}/block`),
  deleteUser: (id) => apiClient.delete(`/admin/users/${id}`),
  getAllJobs: () => apiClient.get("/admin/jobs"),
};

export default apiClient;
