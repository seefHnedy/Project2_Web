import React, { useState } from "react";
import Modal from "../../../components/common/Modal";

export default function GradeComponentFormModal({ component, sectionType, nextDisplayOrder, saving, onSubmit, onClose }) {
  const isEdit = Boolean(component);
  const [values, setValues] = useState({
    name: component?.name || "",
    max_grade: component?.max_grade ?? "",
    display_order: component?.display_order ?? nextDisplayOrder,
  });
  const [errors, setErrors] = useState({});

  const setField = (key) => (event) =>
    setValues((current) => ({ ...current, [key]: event.target.value }));

  const validate = () => {
    const next = {};
    if (!values.name.trim()) next.name = "اسم المكوّن مطلوب";
    if (!values.max_grade || Number(values.max_grade) < 1) next.max_grade = "العلامة العظمى يجب أن تكون أكبر من صفر";
    if (!values.display_order || Number(values.display_order) < 1) next.display_order = "ترتيب العرض يجب أن يكون أكبر من صفر";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;
    onSubmit({
      name: values.name,
      max_grade: Number(values.max_grade),
      display_order: Number(values.display_order),
      section_type: sectionType,
    });
  };

  return (
    <Modal
      title={isEdit ? "تعديل مكوّن العلامة" : "إضافة مكوّن علامة جديد"}
      onClose={onClose}
      width={460}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>إلغاء</button>
          <button type="submit" form="grade-component-form" className="btn btn-primary" disabled={saving}>
            {saving ? <span className="spinner" /> : isEdit ? "حفظ التعديلات" : "إضافة المكوّن"}
          </button>
        </>
      }
    >
      <form id="grade-component-form" onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label>اسم المكوّن</label>
          <input value={values.name} onChange={setField("name")} placeholder="مثال: Quiz / Mid / Final" />
          {errors.name && <span className="error">{errors.name}</span>}
        </div>
        <div className="form-field">
          <label>العلامة العظمى</label>
          <input type="number" value={values.max_grade} onChange={setField("max_grade")} placeholder="20" />
          {errors.max_grade && <span className="error">{errors.max_grade}</span>}
        </div>
        <div className="form-field">
          <label>ترتيب العرض</label>
          <input type="number" value={values.display_order} onChange={setField("display_order")} placeholder="1" />
          {errors.display_order && <span className="error">{errors.display_order}</span>}
        </div>
      </form>
    </Modal>
  );
}
