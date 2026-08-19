import { apiRequest } from "../../api/apiClient";

export function fetchMaterialsForSection(courseSectionId) {
  return apiRequest(`/course-sections/${courseSectionId}/materials`, { method: "GET" });
}


export function uploadCourseMaterial({ course_section_id, title, file }) {
  const formData = new FormData();
  formData.append("course_section_id", course_section_id);
  formData.append("title", title);
  formData.append("file", file);
  return apiRequest("/coursematerials", { method: "POST", body: formData, isForm: true });
}

export function deleteCourseMaterial(id) {
  return apiRequest(`/coursematerials/${id}`, { method: "DELETE" });
}
