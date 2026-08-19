import { apiRequest } from "../../api/apiClient";

export function fetchHourPurchases() {
  return apiRequest("/hourpurchases", { method: "GET" });
}

export function fetchHourPurchase(id) {
  return apiRequest(`/hourpurchases/${id}`, { method: "GET" });
}

export function createHourPurchase(data) {
  return apiRequest("/hourpurchases", { method: "POST", body: data });
}
