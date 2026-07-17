import { apiRequest } from "../../api/apiClient";
export function fetchAllUsers() {
  return apiRequest("/v1/users", { method: "GET" });
}
