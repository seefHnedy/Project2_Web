import { apiRequest } from "../../api/apiClient";

export function fetchNotifications(status = "all") {
  return apiRequest(`/notifications?status=${status}`, { method: "GET" });
}

export function fetchUnreadCount() {
  return apiRequest("/notifications/unread-count", { method: "GET" });
}

export function markNotificationAsRead(id) {
  return apiRequest(`/notifications/${id}/read`, { method: "PATCH" });
}

export function markAllNotificationsAsRead() {
  return apiRequest("/notifications/read-all", { method: "PATCH" });
}

export function deleteNotification(id) {
  return apiRequest(`/notifications/${id}`, { method: "DELETE" });
}
