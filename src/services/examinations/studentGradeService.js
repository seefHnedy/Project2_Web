import { apiRequest } from "../../api/apiClient";

export function validateGradeComponents(courseId) {
  return apiRequest(`/courses/${courseId}/validate-grade-components`, { method: "GET" });
}

export function fetchStudentGrades(courseId, sectionType) {
  return apiRequest(`/courses/${courseId}/${sectionType}/student-grades`, { method: "GET" });
}

export function saveStudentGrades(payload) {
  return apiRequest("/student-grades", { method: "POST", body: payload });
}
