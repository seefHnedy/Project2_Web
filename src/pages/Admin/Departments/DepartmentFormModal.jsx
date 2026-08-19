import React, { useState } from "react";
import Modal from "../../../components/common/Modal";

export default function DepartmentFormModal({ department, saving, onSubmit, onClose }) {
  const isEdit = Boolean(department);
  const [values, setValues] = useState({
    name: department?.name || "",
    code: department?.code || "",
  });
  const [errors, setErrors] = useState({});

  const setField = (key) => (event) =>
    setValues((current) => ({ ...current, [key]: event.target.value }));

  const validate = () => {
    const next = {};
    if (!values.name.trim()) next.name = "اسم القسم مطلوب";
    if (!values.code.trim()) next.code = "رمز القسم مطلوب";
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
      title={isEdit ? "تعديل القسم" : "إضافة قسم جديد"}
      onClose={onClose}
      width={440}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            إلغاء
          </button>
          <button type="submit" form="department-form" className="btn btn-primary" disabled={saving}>
            {saving ? <span className="spinner" /> : isEdit ? "حفظ التعديلات" : "إضافة القسم"}
          </button>
        </>
      }
    >
      <form id="department-form" onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label>اسم القسم</label>
          <input value={values.name} onChange={setField("name")} placeholder="مثال: هندسة البرمجيات" />
          {errors.name && <span className="error">{errors.name}</span>}
        </div>
        <div className="form-field">
          <label>رمز القسم</label>
          <input dir="ltr" value={values.code} onChange={setField("code")} placeholder="SWE" />
          {errors.code && <span className="error">{errors.code}</span>}
        </div>
      </form>
    </Modal>
  );
}
