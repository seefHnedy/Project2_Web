import React, { useState } from "react";
import { CheckCircle2, PenLine } from "lucide-react";
import Modal from "../../../components/common/Modal";
import { OBJECTION_STATUS_LABELS } from "../../../services/examinations/gradeObjectionService";

export default function ResolveObjectionModal({ objection, saving, onResolve, onClose }) {
  const [decision, setDecision] = useState(null);
  const [newGrade, setNewGrade] = useState(
    objection.submitted_grade != null ? String(objection.submitted_grade) : ""
  );
  const [responseNote, setResponseNote] = useState("");
  const [error, setError] = useState("");

  const isResolved = objection.status !== "pending";

  const handleConfirm = () => {
    setError("");
    onResolve(objection.id, { decision: "confirmed", response_note: responseNote || undefined });
  };

  const handleAdjust = () => {
    if (newGrade === "" || Number.isNaN(Number(newGrade)) || Number(newGrade) < 0) {
      setError("الرجاء إدخال علامة جديدة صحيحة");
      return;
    }
    if (objection.grade_component?.max_grade != null && Number(newGrade) > Number(objection.grade_component.max_grade)) {
      setError(`لا يمكن أن تتجاوز العلامة الحد الأقصى (${objection.grade_component.max_grade})`);
      return;
    }
    setError("");
    onResolve(objection.id, {
      decision: "adjusted",
      new_grade: Number(newGrade),
      response_note: responseNote || undefined,
    });
  };

  return (
    <Modal title="مراجعة الاعتراض" onClose={onClose} width={560}>
      <div className="form-grid">
        <div className="form-field full">
          <label>الطالب</label>
          <div className="hint">
            {objection.student?.name} ({objection.student?.student_number})
          </div>
        </div>
        <div className="form-field full">
          <label>المادة / المكوّن</label>
          <div className="hint">
            {objection.course?.course_code} — {objection.course?.name} / {objection.grade_component?.name}
          </div>
        </div>
        <div className="form-field">
          <label>العلامة الحالية</label>
          <div className="hint">{objection.current_grade ?? "—"}</div>
        </div>
        <div className="form-field">
          <label>العلامة المطلوبة من الطالب</label>
          <div className="hint">{objection.submitted_grade ?? "—"}</div>
        </div>
        <div className="form-field full">
          <label>تفاصيل الاعتراض المقدَّم من الطالب</label>
          <div className="hint" style={{ lineHeight: 1.8 }}>
            {objection.details || "لا يوجد تفاصيل إضافية"}
          </div>
        </div>

        {isResolved ? (
          <div className="form-field full">
            <label>الحالة</label>
            <div className="hint">
              {OBJECTION_STATUS_LABELS[objection.status] || objection.status}
              {objection.status === "adjusted" ? ` — العلامة الجديدة: ${objection.resolved_grade}` : ""}
            </div>
            {objection.response_note && <div className="hint">ملاحظة: {objection.response_note}</div>}
          </div>
        ) : (
          <>
            <div className="form-field full">
              <label>ملاحظة الرد (اختياري)</label>
              <textarea
                rows={3}
                value={responseNote}
                onChange={(e) => setResponseNote(e.target.value)}
                style={{
                  minHeight: 80,
                  border: "1px solid var(--line)",
                  borderRadius: 13,
                  padding: 10,
                  fontFamily: "inherit",
                  fontSize: 14,
                }}
                placeholder="سبب القرار (يظهر للطالب)"
              />
            </div>

            {decision === "adjusted" && (
              <div className="form-field full">
                <label>العلامة الجديدة</label>
                <input
                  type="number"
                  min="0"
                  max={objection.grade_component?.max_grade || undefined}
                  value={newGrade}
                  onChange={(e) => setNewGrade(e.target.value)}
                />
              </div>
            )}

            {error && (
              <div className="form-field full">
                <span className="error">{error}</span>
              </div>
            )}
          </>
        )}
      </div>

      {!isResolved && (
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            إغلاق
          </button>
          {decision !== "adjusted" ? (
            <>
              <button type="button" className="btn btn-ghost" onClick={() => setDecision("adjusted")} disabled={saving}>
                <PenLine size={16} /> تعديل العلامة
              </button>
              <button type="button" className="btn btn-primary" onClick={handleConfirm} disabled={saving}>
                {saving ? <span className="spinner" /> : <CheckCircle2 size={16} />} تأكيد العلامة الحالية
              </button>
            </>
          ) : (
            <button type="button" className="btn btn-primary" onClick={handleAdjust} disabled={saving}>
              {saving ? <span className="spinner" /> : <CheckCircle2 size={16} />} حفظ العلامة الجديدة وإرسالها
            </button>
          )}
        </div>
      )}
    </Modal>
  );
}
