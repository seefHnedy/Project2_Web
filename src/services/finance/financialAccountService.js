import { apiRequest } from "../../api/apiClient";

export function fetchFinancialAccount(studentId) {
  return apiRequest(`/financialaccounts/${studentId}`, { method: "GET" });
}
