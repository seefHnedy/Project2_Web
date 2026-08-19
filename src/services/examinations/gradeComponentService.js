import { apiRequest } from "../../api/apiClient";

export const SECTION_TYPES = [
  { value: "theory", label: "نظري" },
  { value: "practical", label: "عملي" },
  { value: "project", label: "مشروع" },
];

export const SECTION_TYPE_LABELS = SECTION_TYPES.reduce((acc, t) => {
  acc[t.value] = t.label;
  return acc;
}, {});

export function getApplicableSectionTypes(course) {
  const type = course?.course_type;
  if (type === "theory") return ["theory"];
  if (type === "project") return ["project"];
  if (type === "theory_practical") return ["theory", "practical"];
  return ["theory", "practical", "project"];
}

export function fetchGradeComponents(courseId) {
  return apiRequest(`/courses/${courseId}/grade-components`, { method: "GET" });
}

export function createGradeComponent(courseId, data) {
  return apiRequest(`/courses/${courseId}/grade-components`, { method: "POST", body: data });
}

export function updateGradeComponent(gradeComponentId, data) {
  return apiRequest(`/grade-components/${gradeComponentId}`, { method: "PUT", body: data });
}

export function deleteGradeComponent(gradeComponentId) {
  return apiRequest(`/grade-components/${gradeComponentId}`, { method: "DELETE" });
}
