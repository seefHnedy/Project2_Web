import { apiRequest } from "../../api/apiClient";

export function fetchMyCourseSections() {
  return apiRequest("/my-course-sections", { method: "GET" });
}
