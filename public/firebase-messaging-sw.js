/* eslint-disable no-undef */
// Service Worker لإشعارات Firebase Cloud Messaging في الخلفية (عندما يكون تبويب الموقع مغلقاً/غير مفتوح).
//
// ملاحظة مهمة: ملفات مجلد public/ لا تمر عبر Vite build، لذلك لا يمكن قراءة متغيرات
// .env (import.meta.env) هنا مباشرة. إعدادات Firebase أدناه هي إعدادات SDK عامة
// (Public Web App Config) وليست أسراراً — يمكن نسخها بأمان من نفس القيم الموجودة
// في ملف .env (VITE_FIREBASE_*). عدّل القيم بالأسفل عند تفعيل Firebase فعلياً.
importScripts("https://www.gstatic.com/firebasejs/10.13.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "REPLACE_WITH_VITE_FIREBASE_API_KEY",
  authDomain: "REPLACE_WITH_VITE_FIREBASE_AUTH_DOMAIN",
  projectId: "REPLACE_WITH_VITE_FIREBASE_PROJECT_ID",
  storageBucket: "REPLACE_WITH_VITE_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "REPLACE_WITH_VITE_FIREBASE_MESSAGING_SENDER_ID",
  appId: "REPLACE_WITH_VITE_FIREBASE_APP_ID",
});

const messaging = firebase.messaging();

// يُستدعى تلقائياً عند وصول إشعار والتطبيق في الخلفية.
// قابل للتوسعة لاحقاً: يمكن قراءة payload.data.screen لتوجيه المستخدم عند الضغط على الإشعار.
messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || payload.data || {};
  self.registration.showNotification(title || "إشعار جديد", {
    body: body || "",
    icon: "/vite.svg",
    data: payload.data || {},
  });
});

// عند الضغط على الإشعار — فتح/تركيز نافذة التطبيق (قابل للتوسعة للتوجيه حسب "screen")
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      if (windowClients.length > 0) {
        return windowClients[0].focus();
      }
      return clients.openWindow("/dashboard");
    })
  );
});
