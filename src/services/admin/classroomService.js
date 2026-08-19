import { apiRequest } from "../../api/apiClient";
export function fetchClassrooms() {
  return apiRequest("/classrooms", { method: "GET" });
}

export function fetchClassroom(id) {
  return apiRequest(`/classrooms/${id}`, { method: "GET" });
}

export function createClassroom(data) {
  return apiRequest("/classrooms", { method: "POST", body: data });
}
export function updateClassroom(id, data) {
  return apiRequest(`/classrooms/${id}`, { method: "PUT", body: data });
}

export function deleteClassroom(id) {
  return apiRequest(`/classrooms/${id}`, { method: "DELETE" });
}
