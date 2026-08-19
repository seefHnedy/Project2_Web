import { apiRequest } from "../../api/apiClient";

export const AUDIENCE_TYPE_LABELS = {
  all_my_students: "كل طلابي (في الشعب التي أدرّسها)",
  all_students: "كل الطلاب",
  study_years: "سنوات دراسية محددة",
  courses: "مواد محددة",
  sections: "شعب محددة",
};
export function fetchManagedAnnouncements(page = 1, perPage = 20) {
  return apiRequest(`/announcements/manage?page=${page}&per_page=${perPage}`, { method: "GET" });
}
export function fetchAudienceOptions() {
  return apiRequest("/announcements/audience-options", { method: "GET" });
}

export function fetchAnnouncement(id) {
  return apiRequest(`/announcements/${id}`, { method: "GET" });
}

function buildFormData(data) {
  const fd = new FormData();
  if (data.title !== undefined) fd.append("title", data.title ?? "");
  if (data.body !== undefined && data.body !== null) fd.append("body", data.body);
  if (data.media instanceof File) fd.append("media", data.media);
  if (data.remove_media) fd.append("remove_media", "1");
  if (data.audience_type) fd.append("audience_type", data.audience_type);
  (data.audience_ids || []).forEach((id) => fd.append("audience_ids[]", id));
  return fd;
}

export function createAnnouncement(data) {
  return apiRequest("/announcements", { method: "POST", body: buildFormData(data), isForm: true });
}
export function updateAnnouncement(id, data) {
  const fd = buildFormData(data);
  fd.append("_method", "PATCH");
  return apiRequest(`/announcements/${id}`, { method: "POST", body: fd, isForm: true });
}

export function deleteAnnouncement(id) {
  return apiRequest(`/announcements/${id}`, { method: "DELETE" });
}
