import { apiRequest } from "../../api/apiClient";

export function fetchSchedules() {
  return apiRequest("/sectionschedules", { method: "GET" });
}

export function fetchSchedule(id) {
  return apiRequest(`/sectionschedules/${id}`, { method: "GET" });
}

export function createSchedule(data) {
  return apiRequest("/sectionschedules", { method: "POST", body: data });
}

export function updateSchedule(id, data) {
  return apiRequest(`/sectionschedules/${id}`, { method: "PUT", body: data });
}

export function deleteSchedule(id) {
  return apiRequest(`/sectionschedules/${id}`, { method: "DELETE" });
}

export const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const DAY_LABELS = {
  Sunday: "الأحد",
  Monday: "الإثنين",
  Tuesday: "الثلاثاء",
  Wednesday: "الأربعاء",
  Thursday: "الخميس",
  Friday: "الجمعة",
  Saturday: "السبت",
};
