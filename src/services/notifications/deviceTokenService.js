import { apiRequest } from "../../api/apiClient";


export function registerDeviceToken({ token, deviceId, deviceName, appVersion }) {
  return apiRequest("/device-tokens", {
    method: "POST",
    body: {
      token,
      platform: "web",
      device_id: deviceId,
      device_name: deviceName,
      app_version: appVersion,
    },
  });
}

export function unregisterDeviceToken(token) {
  return apiRequest("/device-tokens", { method: "DELETE", body: { token } });
}
