import React, { useState } from "react";
import Modal from "../../../components/common/Modal";

export default function SemesterFormModal({ semester, saving, onSubmit, onClose }) {
  const isEdit = Boolean(semester);
  const [values, setValues] = useState({
    name: semester?.name || "",
    academic_year: semester?.academic_year || "",
    start_date: semester?.start_date || "",
    end_date: semester?.end_date || "",
    is_current: semester?.is_current || false,
  });
  const [errors, setErrors] = useState({});

  const setField = (key) => (event) =>
    setValues((current) => ({ ...current, [key]: event.target.value }));

  const validate = () => {
    const next = {};
    if (!values.name.trim()) next.name = "اسم الفصل مطلوب";
    if (!values.academic_year.trim()) next.academic_year = "السنة الدراسية مطلوبة";
    if (!values.start_date) next.start_date = "تاريخ البداية مطلوب";
    if (!values.end_date) next.end_date = "تاريخ النهاية مطلوب";
    if (values.start_date && values.end_date && values.end_date <= values.start_date) {
      next.end_date = "يجب أن يكون تاريخ النهاية بعد تاريخ البداية";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;
    onSubmit(values);
  };

  return (
    <Modal
      title={isEdit ? "تعديل الفصل الدراسي" : "إضافة فصل دراسي"}
      onClose={onClose}
      width={520}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            إلغاء
          </button>
          <button type="submit" form="semester-form" className="btn btn-primary" disabled={saving}>
            {saving ? <span className="spinner" /> : isEdit ? "حفظ التعديلات" : "إضافة الفصل"}
          </button>
        </>
      }
    >
      <form id="semester-form" onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <div className="form-field">
            <label>اسم الفصل</label>
            <input value={values.name} onChange={setField("name")} placeholder="الفصل الأول" />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>
          <div className="form-field">
            <label>السنة الدراسية</label>
            <input
              dir="ltr"
              value={values.academic_year}
              onChange={setField("academic_year")}
              placeholder="2026-2027"
            />
            {errors.academic_year && <span className="error">{errors.academic_year}</span>}
          </div>
          <div className="form-field">
            <label>تاريخ البداية</label>
            <input type="date" value={values.start_date} onChange={setField("start_date")} />
            {errors.start_date && <span className="error">{errors.start_date}</span>}
          </div>
          <div className="form-field">
            <label>تاريخ النهاية</label>
            <input type="date" value={values.end_date} onChange={setField("end_date")} />
            {errors.end_date && <span className="error">{errors.end_date}</span>}
          </div>
          <div className="form-field full" style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <input
              type="checkbox"
              style={{ minHeight: "auto", width: 18, height: 18 }}
              checked={values.is_current}
              onChange={(e) => setValues((current) => ({ ...current, is_current: e.target.checked }))}
              id="is_current"
            />
            <label htmlFor="is_current" style={{ margin: 0 }}>
              اجعله الفصل الدراسي الحالي (سيتم إلغاء تفعيل بقية الفصول تلقائياً)
            </label>
          </div>
        </div>
      </form>
    </Modal>
  );
}
