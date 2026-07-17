import { apiRequest } from "../../api/apiClient";
export function fetchSemesters() {
  return apiRequest("/semesters", { method: "GET" });
}

export function fetchSemester(id) {
  return apiRequest(`/semesters/${id}`, { method: "GET" });
}

export function createSemester(data) {
  return apiRequest("/semesters", { method: "POST", body: data });
}

export function updateSemester(id, data) {
  return apiRequest(`/semesters/${id}`, { method: "PUT", body: data });
}

export function deleteSemester(id) {
  return apiRequest(`/semesters/${id}`, { method: "DELETE" });
}
