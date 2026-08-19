import { apiRequest } from "../api/apiClient";
export function login(username, password) {
  return apiRequest("/login", {
    method: "POST",
    auth: false,
    body: { username, password },
  });
}

export function logout() {
  return apiRequest("/logout", { method: "POST" });
}

export function fetchMe() {
  return apiRequest("/me", { method: "GET" });
}

