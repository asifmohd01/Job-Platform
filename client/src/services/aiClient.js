// AI client scaffold (frontend) - Version-0
// Exposes a simple switchable API to call AI providers via backend endpoints
import apiClient from "./apiClient";

export const aiAPI = {
  // placeholder - in future call backend route /api/ai with provider and payload
  call: (provider, payload) =>
    apiClient.post(`/ai/call`, { provider, payload }),
};

export default aiAPI;
