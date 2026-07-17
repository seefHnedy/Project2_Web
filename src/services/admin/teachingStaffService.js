import { apiRequest } from "../../api/apiClient";
export function fetchTeachingStaff() {
  return apiRequest("/teaching-staff", { method: "GET" });
}

export function fetchTeachingStaffMember(id) {
  return apiRequest(`/teaching-staff/${id}`, { method: "GET" });
}

export function createTeachingStaff(data) {
  return apiRequest("/teaching-staff", { method: "POST", body: data });
}

export function updateTeachingStaff(id, data) {
  return apiRequest(`/teaching-staff/${id}`, { method: "PUT", body: data });
}

export function deleteTeachingStaff(id) {
  return apiRequest(`/teaching-staff/${id}`, { method: "DELETE" });
}

export const STAFF_TYPES = [
  { value: "doctor", label: "دكتور" },
  { value: "lab_instructor", label: "معيد مخبري" },
];
