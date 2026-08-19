import { apiRequest } from "../../api/apiClient";
export function fetchCourses() {
  return apiRequest("/courses", { method: "GET" });
}

export function fetchCourse(id) {
  return apiRequest(`/courses/${id}`, { method: "GET" });
}

export function createCourse(data) {
  return apiRequest("/courses", { method: "POST", body: data });
}

export function updateCourse(id, data) {
  return apiRequest(`/courses/${id}`, { method: "PUT", body: data });
}

export function deleteCourse(id) {
  return apiRequest(`/courses/${id}`, { method: "DELETE" });
}

export const COURSE_TYPES = [
  { value: "theory", label: "نظري" },
  { value: "theory_practical", label: "نظري وعملي" },
  { value: "project", label: "مشروع" },
];

export const STUDY_YEARS = [
  "First Year",
  "Second Year",
  "Third Year",
  "Fourth Year",
  "Fifth Year",
];

export const STUDY_YEAR_LABELS = {
  "First Year": "السنة الأولى",
  "Second Year": "السنة الثانية",
  "Third Year": "السنة الثالثة",
  "Fourth Year": "السنة الرابعة",
  "Fifth Year": "السنة الخامسة",
};

export const STUDY_SEMESTERS = ["First Semester", "Second Semester"];

export const STUDY_SEMESTER_LABELS = {
  "First Semester": "الفصل الأول",
  "Second Semester": "الفصل الثاني",
};
