import { apiRequest } from "../../api/apiClient";

// حالات الاعتراض — مطابقة لـ GradeObjection::STATUS_* في الباك-إند
export const OBJECTION_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  ADJUSTED: "adjusted",
};

export const OBJECTION_STATUS_LABELS = {
  pending: "قيد المراجعة",
  confirmed: "تم التأكيد (بدون تعديل)",
  adjusted: "تم تعديل العلامة",
};

function buildQuery(params) {
  const usp = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") usp.append(key, value);
  });
  const qs = usp.toString();
  return qs ? `?${qs}` : "";
}

// GET /examinations/grade-objections — قائمة الاعتراضات مع فلاتر اختيارية (course_id, status, ...)
export function fetchGradeObjections(filters = {}) {
  return apiRequest(`/examinations/grade-objections${buildQuery(filters)}`, { method: "GET" });
}

// GET /examinations/grade-objections/{id}
export function fetchGradeObjection(id) {
  return apiRequest(`/examinations/grade-objections/${id}`, { method: "GET" });
}

// PATCH /examinations/grade-objections/{id}/resolve
// decision: "confirmed" (رفض الاعتراض والإبقاء على العلامة) أو "adjusted" (قبول الاعتراض وتعديل العلامة)
export function resolveGradeObjection(id, data) {
  return apiRequest(`/examinations/grade-objections/${id}/resolve`, { method: "PATCH", body: data });
}

// PATCH /examinations/grade-objections/{id}/resubmission
export function setObjectionResubmission(id, allowed) {
  return apiRequest(`/examinations/grade-objections/${id}/resubmission`, {
    method: "PATCH",
    body: { allowed },
  });
}

// GET /examinations/grade-objection-settings — حالة تفعيل الاعتراضات لكل مادة بالفصل الحالي
export function fetchGradeObjectionSettings(semesterId) {
  return apiRequest(
    `/examinations/grade-objection-settings${buildQuery({ semester_id: semesterId })}`,
    { method: "GET" }
  );
}

// PATCH /examinations/courses/{course}/grade-objections — تفعيل/تعطيل الاعتراضات لمادة معينة
export function toggleCourseObjections(courseId, enabled, semesterId) {
  return apiRequest(`/examinations/courses/${courseId}/grade-objections`, {
    method: "PATCH",
    body: { enabled, semester_id: semesterId },
  });
}
