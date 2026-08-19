import React, { useMemo, useState } from "react";
import { Trash2, UploadCloud } from "lucide-react";
import Modal from "../../components/common/Modal";
import { AUDIENCE_TYPE_LABELS } from "../../services/announcements/announcementService";

export default function AnnouncementFormModal({
  announcement,
  audienceOptions,
  saving,
  onSubmit,
  onClose,
}) {
  const isEdit = Boolean(announcement);

  const [title, setTitle] = useState(announcement?.title || "");
  const [body, setBody] = useState(announcement?.body || "");
  const [mediaFile, setMediaFile] = useState(null);
  const [removeMedia, setRemoveMedia] = useState(false);
  const [audienceType, setAudienceType] = useState(
    announcement?.audience?.type || audienceOptions?.allowed_audience_types?.[0] || ""
  );
  const [audienceIds, setAudienceIds] = useState(
    (announcement?.audience?.ids || []).map((id) => String(id))
  );
  const [errors, setErrors] = useState({});

  const needsIds = audienceType === "study_years" || audienceType === "courses" || audienceType === "sections";

  const idOptions = useMemo(() => {
    if (audienceType === "study_years") {
      return (audienceOptions?.study_years || []).map((y) => ({ value: String(y), label: `السنة ${y}` }));
    }
    if (audienceType === "courses") {
      return (audienceOptions?.courses || []).map((c) => ({
        value: String(c.id),
        label: `${c.course_code} — ${c.name}`,
      }));
    }
    if (audienceType === "sections") {
      return (audienceOptions?.sections || []).map((s) => ({
        value: String(s.id),
        label: `${s.course_code} — ${s.section_name}`,
      }));
    }
    return [];
  }, [audienceType, audienceOptions]);

  const handleAudienceTypeChange = (event) => {
    setAudienceType(event.target.value);
    setAudienceIds([]);
  };

  const handleMultiSelectChange = (event) => {
    const selected = Array.from(event.target.selectedOptions).map((o) => o.value);
    setAudienceIds(selected);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setMediaFile(file);
    if (file) setRemoveMedia(false);
  };

  const validate = () => {
    const next = {};
    if (!title.trim()) next.title = "عنوان الإعلان مطلوب";
    if (!audienceType) next.audience_type = "الرجاء اختيار الفئة المستهدفة";
    if (needsIds && audienceIds.length === 0) next.audience_ids = "الرجاء اختيار عنصر واحد على الأقل";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;
    onSubmit({
      title: title.trim(),
      body: body.trim() || null,
      media: mediaFile,
      remove_media: removeMedia,
      audience_type: audienceType,
      audience_ids: needsIds ? audienceIds.map(Number) : [],
    });
  };

  return (
    <Modal
      title={isEdit ? "تعديل الإعلان" : "إعلان جديد"}
      onClose={onClose}
      width={640}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            إلغاء
          </button>
          <button type="submit" form="announcement-form" className="btn btn-primary" disabled={saving}>
            {saving ? <span className="spinner" /> : isEdit ? "حفظ التعديلات" : "نشر الإعلان"}
          </button>
        </>
      }
    >
      <form id="announcement-form" onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <div className="form-field full">
            <label>العنوان</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان الإعلان" />
            {errors.title && <span className="error">{errors.title}</span>}
          </div>

          <div className="form-field full">
            <label>النص (اختياري)</label>
            <textarea
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              style={{
                minHeight: 100,
                border: "1px solid var(--line)",
                borderRadius: 13,
                padding: 10,
                fontFamily: "inherit",
                fontSize: 14.5,
              }}
              placeholder="نص الإعلان..."
            />
          </div>

          <div className="form-field full">
            <label>صورة أو فيديو (اختياري، ملف واحد)</label>
            <input type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm" onChange={handleFileChange} />
            {mediaFile && (
              <span className="hint">
                <UploadCloud size={13} style={{ marginInlineEnd: 4 }} />
                تم اختيار: {mediaFile.name}
              </span>
            )}
            {isEdit && announcement?.media_url && !mediaFile && (
              <label className="hint" style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                <input type="checkbox" checked={removeMedia} onChange={(e) => setRemoveMedia(e.target.checked)} />
                <Trash2 size={13} /> إزالة الوسائط الحالية المرفقة بالإعلان
              </label>
            )}
          </div>

          <div className="form-field full">
            <label>الفئة المستهدفة</label>
            <select value={audienceType} onChange={handleAudienceTypeChange}>
              <option value="">اختر الفئة المستهدفة</option>
              {(audienceOptions?.allowed_audience_types || []).map((t) => (
                <option key={t} value={t}>
                  {AUDIENCE_TYPE_LABELS[t] || t}
                </option>
              ))}
            </select>
            {errors.audience_type && <span className="error">{errors.audience_type}</span>}
          </div>

          {needsIds && (
            <div className="form-field full">
              <label>
                {audienceType === "study_years" && "السنوات الدراسية المستهدفة"}
                {audienceType === "courses" && "المواد المستهدفة"}
                {audienceType === "sections" && "الشعب المستهدفة"}
              </label>
              <select
                multiple
                size={Math.min(6, Math.max(3, idOptions.length))}
                value={audienceIds}
                onChange={handleMultiSelectChange}
                style={{ minHeight: 110, padding: 8 }}
              >
                {idOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <span className="hint">اضغط Ctrl (أو Cmd) مع النقر لاختيار أكثر من عنصر</span>
              {errors.audience_ids && <span className="error">{errors.audience_ids}</span>}
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}
