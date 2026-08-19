import React from "react";
import { AlertTriangle } from "lucide-react";
import Modal from "./Modal";

export default function ConfirmDialog({
  title = "تأكيد الحذف",
  message,
  confirmLabel = "حذف نهائياً",
  loading = false,
  onConfirm,
  onClose,
}) {
  return (
    <Modal
      title={title}
      onClose={onClose}
      width={420}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            إلغاء
          </button>
          <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? <span className="spinner" /> : confirmLabel}
          </button>
        </>
      }
    >
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div
          style={{
            width: 42,
            height: 42,
            minWidth: 42,
            borderRadius: 14,
            background: "var(--danger-soft)",
            color: "var(--danger)",
            display: "grid",
            placeItems: "center",
          }}
        >
          <AlertTriangle size={22} />
        </div>
        <p style={{ margin: 0, lineHeight: 1.8, color: "var(--muted)" }}>{message}</p>
      </div>
    </Modal>
  );
}
