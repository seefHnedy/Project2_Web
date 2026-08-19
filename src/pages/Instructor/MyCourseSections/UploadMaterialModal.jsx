import React, { useState } from "react";
import Modal from "../../../components/common/Modal";

export default function UploadMaterialModal({ section, saving, onSubmit, onClose }) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const next = {};
    if (!title.trim()) next.title = "عنوان الملف مطلوب";
    if (!file) next.file = "الرجاء اختيار ملف";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;
    onSubmit({ course_section_id: section.id, title, file });
  };

  return (
    <Modal
      title={`رفع محاضرة — ${section.course_name}`}
      onClose={onClose}
      width={460}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>إلغاء</button>
          <button type="submit" form="upload-material-form" className="btn btn-primary" disabled={saving}>
            {saving ? <span className="spinner" /> : "رفع الملف"}
          </button>
        </>
      }
    >
      <form id="upload-material-form" onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label>عنوان الملف</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="محاضرة 1 - مقدمة" />
          {errors.title && <span className="error">{errors.title}</span>}
        </div>
        <div className="form-field">
          <label>الملف (حتى 20 ميغابايت)</label>
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          {errors.file && <span className="error">{errors.file}</span>}
        </div>
      </form>
    </Modal>
  );
}
