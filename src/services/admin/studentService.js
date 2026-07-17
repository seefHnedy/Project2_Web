import { apiRequest } from "../../api/apiClient";
export async function fetchStudents(page = 1) {
  const raw = await apiRequest(`/students?page=${page}`, { method: "GET" });

  if (Array.isArray(raw)) {
    return { data: raw, current_page: 1, last_page: 1, total: raw.length };
  }

  if (raw && Array.isArray(raw.data)) {
    const meta = raw.meta && typeof raw.meta === "object" ? raw.meta : raw;
    return {
      data: raw.data,
      current_page: meta.current_page || page,
      last_page: meta.last_page || 1,
      total: meta.total ?? raw.data.length,
    };
  }

  return { data: [], current_page: 1, last_page: 1, total: 0 };
}

export function fetchStudent(id) {
  return apiRequest(`/students/${id}`, { method: "GET" });
}

export function createStudent(data) {
  return apiRequest("/students", { method: "POST", body: data });
}

export function updateStudent(id, data) {
  return apiRequest(`/students/${id}`, { method: "PUT", body: data });
}

export function deleteStudent(id) {
  return apiRequest(`/students/${id}`, { method: "DELETE" });
}
