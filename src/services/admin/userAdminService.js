import { apiRequest } from "../../api/apiClient";

export function fetchAllUsers() {
  return apiRequest("/v1/users", { method: "GET" });
}

export function createUser(data) {
  return apiRequest("/v1/users", { method: "POST", body: data });
}

export function updateUser(id, data) {
  return apiRequest(`/v1/users/${id}`, { method: "PUT", body: data });
}

export function deleteUser(id) {
  return apiRequest(`/v1/users/${id}`, { method: "DELETE" });
}

export function fetchRoles() {
  return apiRequest("/v1/roles", { method: "GET" });
}
