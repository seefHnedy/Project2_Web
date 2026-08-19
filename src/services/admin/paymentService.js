import { apiRequest } from "../../api/apiClient";

export function fetchPayments() {
  return apiRequest("/payments", { method: "GET" });
}

export function fetchPayment(id) {
  return apiRequest(`/payments/${id}`, { method: "GET" });
}

export function createPayment(data) {
  return apiRequest("/payments", { method: "POST", body: data });
}
