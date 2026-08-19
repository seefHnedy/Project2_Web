import React, { useEffect, useRef, useState } from "react";
import { Bell, Check } from "lucide-react";
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../../services/notifications/notificationService";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  const refreshUnreadCount = () => {
    fetchUnreadCount()
      .then((res) => setUnreadCount(res?.count || 0))
      .catch(() => {});
  };

  useEffect(() => {
    refreshUnreadCount();
  }, []);

  
  useEffect(() => {
    window.addEventListener("unify:notification-received", refreshUnreadCount);
    return () => window.removeEventListener("unify:notification-received", refreshUnreadCount);
  }, []);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const load = () => {
    setLoading(true);
    fetchNotifications("all")
      .then((res) => setItems(res?.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  const toggleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next) load();
  };

  const handleMarkRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setItems((current) => current.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      /* ignore */
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsAsRead();
      setItems((current) => current.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      
    }
  };

  return (
    <div style={{ position: "relative" }} ref={ref}>
      <button
        onClick={toggleOpen}
        aria-label="الإشعارات"
        style={{
          position: "relative",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: 8,
          display: "flex",
        }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: 2,
              right: 2,
              background: "var(--danger)",
              color: "#fff",
              borderRadius: "999px",
              fontSize: 10,
              fontWeight: 800,
              minWidth: 16,
              height: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 3px",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: 320,
            maxWidth: "calc(100vw - 24px)",
            maxHeight: 380,
            overflowY: "auto",
            overflowX: "hidden",
            background: "var(--white)",
            border: "1px solid var(--line)",
            borderRadius: 16,
            boxShadow: "var(--shadow-md, 0 10px 30px rgba(0,0,0,0.12))",
            zIndex: 50,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderBottom: "1px solid var(--line)" }}>
            <strong style={{ fontSize: 13.5 }}>الإشعارات</strong>
            {unreadCount > 0 && (
              <button onClick={handleMarkAll} className="btn btn-ghost" style={{ fontSize: 11.5, padding: "4px 8px" }}>
                <Check size={13} /> تحديد الكل كمقروء
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ padding: 20, textAlign: "center" }}>
              <span className="spinner dark" />
            </div>
          ) : items.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>لا توجد إشعارات</div>
          ) : (
            items.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.is_read && handleMarkRead(n.id)}
                style={{
                  padding: "10px 14px",
                  borderBottom: "1px solid var(--line)",
                  background: n.is_read ? "transparent" : "var(--bg)",
                  cursor: n.is_read ? "default" : "pointer",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, wordBreak: "break-word" }}>{n.title}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2, wordBreak: "break-word" }}>
                  {n.body}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
