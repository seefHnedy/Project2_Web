import { apiRequest } from "../../api/apiClient";
export function fetchCourseSections() {
  return apiRequest("/coursesections", { method: "GET" });
}

export function fetchCourseSection(id) {
  return apiRequest(`/coursesections/${id}`, { method: "GET" });
}

export function createCourseSection(data) {
  return apiRequest("/coursesections", { method: "POST", body: data });
}

export function updateCourseSection(id, data) {
  return apiRequest(`/coursesections/${id}`, { method: "PUT", body: data });
}

export function deleteCourseSection(id) {
  return apiRequest(`/coursesections/${id}`, { method: "DELETE" });
}

export const SECTION_TYPES = [
  { value: "theory", label: "نظري (يتطلب دكتور)" },
  { value: "practical", label: "عملي (يتطلب معيد مخبري)" },
  { value: "project", label: "مشروع (يتطلب معيد مخبري)" },
];
