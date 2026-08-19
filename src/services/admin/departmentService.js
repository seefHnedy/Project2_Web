import { apiRequest } from "../../api/apiClient";
export function fetchDepartments() {
  return apiRequest("/departments", { method: "GET" });
}

export function fetchDepartment(id) {
  return apiRequest(`/departments/${id}`, { method: "GET" });
}

export function createDepartment(data) {
  return apiRequest("/departments", { method: "POST", body: data });
}

export function updateDepartment(id, data) {
  return apiRequest(`/departments/${id}`, { method: "PUT", body: data });
}

export function deleteDepartment(id) {
  return apiRequest(`/departments/${id}`, { method: "DELETE" });
}
