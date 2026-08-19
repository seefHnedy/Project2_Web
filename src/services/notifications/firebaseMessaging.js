
import { firebaseConfig, isFirebaseConfigured, VAPID_KEY } from "../../firebase/firebaseConfig";
import { registerDeviceToken, unregisterDeviceToken } from "./deviceTokenService";

let currentToken = null;
let messagingInstance = null;

async function loadFirebaseSdk() {
  const [{ initializeApp, getApps }, { getMessaging, getToken, onMessage }] = await Promise.all([
    import("firebase/app"),
    import("firebase/messaging"),
  ]);
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  return { app, getMessaging, getToken, onMessage };
}

export async function initFirebaseMessaging(onForegroundMessage) {
  if (!isFirebaseConfigured()) {
    console.info("[Firebase] لم يتم ضبط إعدادات Firebase بعد — تخطي تفعيل الإشعارات (VITE_FIREBASE_*).");
    return null;
  }

  if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) {
    console.warn("[Firebase] المتصفح لا يدعم إشعارات الويب.");
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.info("[Firebase] المستخدم لم يمنح إذن الإشعارات.");
      return null;
    }

    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    const { getMessaging, getToken, onMessage } = await loadFirebaseSdk();

    messagingInstance = getMessaging();
    const token = await getToken(messagingInstance, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (!token) {
      console.warn("[Firebase] تعذّر الحصول على توكن FCM.");
      return null;
    }

    currentToken = token;

    await registerDeviceToken({
      token,
      deviceId: getOrCreateDeviceId(),
      deviceName: navigator.userAgent?.slice(0, 255),
      appVersion: null,
    });

    onMessage(messagingInstance, (payload) => {
      onForegroundMessage?.(payload);
    });

    return token;
  } catch (error) {
    console.error("[Firebase] فشل تفعيل إشعارات FCM:", error);
    return null;
  }
}

export async function teardownFirebaseMessaging() {
  if (!currentToken) return;
  try {
    await unregisterDeviceToken(currentToken);
  } catch {
    
  } finally {
    currentToken = null;
  }
}


function getOrCreateDeviceId() {
  const key = "unifyWebDeviceId";
  let id = localStorage.getItem(key);
  if (!id) {
    id = `web-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(key, id);
  }
  return id;
}
