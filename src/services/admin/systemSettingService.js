import { apiRequest } from "../../api/apiClient";
const PLACEHOLDER_ID = 1;

export function fetchSettings() {
  return apiRequest(`/systemsettings/${PLACEHOLDER_ID}`, { method: "GET" });
}

export function createSettings(data) {
  return apiRequest("/systemsettings", { method: "POST", body: data });
}

export function updateSettings(data) {
  return apiRequest(`/systemsettings/${PLACEHOLDER_ID}`, { method: "PUT", body: data });
}
