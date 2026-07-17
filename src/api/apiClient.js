const RAW_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
export const API_BASE_URL = `${RAW_BASE.replace(/\/+$/, "")}/api`;

const AUTH_STORAGE_KEY = "smartPortalAuth";

export function getStoredAuth() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredAuth(payload) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
}

export function clearStoredAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getToken() {
  return getStoredAuth()?.token || null;
}

const UNAUTHORIZED_EVENT = "smart-portal:unauthorized";
export function onUnauthorized(handler) {
  window.addEventListener(UNAUTHORIZED_EVENT, handler);
  return () => window.removeEventListener(UNAUTHORIZED_EVENT, handler);
}

export async function apiRequest(path, { method = "GET", body, auth = true, isForm = false } = {}) {
  const headers = { Accept: "application/json" };
  if (!isForm) headers["Content-Type"] = "application/json";

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    });
  } catch (networkError) {
    throw new Error("تعذّر الاتصال بالخادم. تأكد أن سيرفر اللارافيل يعمل وأن VITE_API_BASE_URL صحيح.");
  }

  if (response.status === 401) {
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }

  let payload = null;
  const text = await response.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const message =
      payload?.message ||
      (payload?.errors && Object.values(payload.errors).flat()[0]) ||
      `حدث خطأ غير متوقع (${response.status})`;
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  if (payload && typeof payload === "object" && "success" in payload) {
    if (!payload.success) {
      const message = payload.message || "فشل الطلب";
      const error = new Error(message);
      error.payload = payload;
      throw error;
    }
    return payload.data;
  }
  return payload;
}
