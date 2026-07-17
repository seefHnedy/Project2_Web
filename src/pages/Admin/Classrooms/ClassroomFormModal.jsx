import React, { useState } from "react";
import Modal from "../../../components/common/Modal";

export default function ClassroomFormModal({ classroom, saving, onSubmit, onClose }) {
  const isEdit = Boolean(classroom);
  const [values, setValues] = useState({
    name: classroom?.name || "",
    building: classroom?.building || "",
    floor: classroom?.floor ?? "",
    capacity: classroom?.capacity ?? "",
  });
  const [errors, setErrors] = useState({});

  const setField = (key) => (event) =>
    setValues((current) => ({ ...current, [key]: event.target.value }));

  const validate = () => {
    const next = {};
    if (!values.name.trim()) next.name = "اسم القاعة مطلوب";
    if (!values.building.trim()) next.building = "المبنى مطلوب";
    if (!values.capacity || Number(values.capacity) < 1) next.capacity = "السعة يجب أن تكون أكبر من صفر";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;
    onSubmit({
      name: values.name,
      building: values.building,
      floor: values.floor === "" ? null : Number(values.floor),
      capacity: Number(values.capacity),
    });
  };

  return (
    <Modal
      title={isEdit ? "تعديل القاعة" : "إضافة قاعة جديدة"}
      onClose={onClose}
      width={480}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            إلغاء
          </button>
          <button type="submit" form="classroom-form" className="btn btn-primary" disabled={saving}>
            {saving ? <span className="spinner" /> : isEdit ? "حفظ التعديلات" : "إضافة القاعة"}
          </button>
        </>
      }
    >
      <form id="classroom-form" onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <div className="form-field full">
            <label>اسم القاعة</label>
            <input value={values.name} onChange={setField("name")} placeholder="مثال: A101" />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>
          <div className="form-field">
            <label>المبنى</label>
            <input value={values.building} onChange={setField("building")} placeholder="المبنى الرئيسي" />
            {errors.building && <span className="error">{errors.building}</span>}
          </div>
          <div className="form-field">
            <label>الطابق (اختياري)</label>
            <input type="number" value={values.floor} onChange={setField("floor")} placeholder="1" />
          </div>
          <div className="form-field full">
            <label>السعة (عدد المقاعد)</label>
            <input type="number" value={values.capacity} onChange={setField("capacity")} placeholder="40" />
            {errors.capacity && <span className="error">{errors.capacity}</span>}
          </div>
        </div>
      </form>
    </Modal>
  );
}
