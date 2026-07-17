import React, { useState } from "react";
import Modal from "../../../components/common/Modal";
import { SECTION_TYPES } from "../../../services/admin/courseSectionService";

export default function CourseSectionFormModal({ section, courses, staff, saving, onSubmit, onClose }) {
  const isEdit = Boolean(section);
  const [values, setValues] = useState({
    course_id: section?.course?.id || "",
    instructor_id: section?.instructor?.id || "",
    section_name: section?.section_name || "",
    capacity: section?.capacity ?? "",
    section_type: section?.section_type || "",
  });
  const [errors, setErrors] = useState({});

  const setField = (key) => (event) =>
    setValues((current) => ({ ...current, [key]: event.target.value }));

  // فلترة المدرّسين حسب نوع الشعبة (قاعدة العمل بالباك-إند)
  const eligibleStaff = staff.filter((s) => {
    if (!values.section_type) return true;
    if (values.section_type === "theory") return s.staff_type === "doctor";
    return s.staff_type === "lab_instructor";
  });

  const validate = () => {
    const next = {};
    if (!values.course_id) next.course_id = "الرجاء اختيار المقرر";
    if (!values.section_type) next.section_type = "الرجاء اختيار نوع الشعبة";
    if (!values.instructor_id) next.instructor_id = "الرجاء اختيار المدرّس";
    if (!values.section_name.trim()) next.section_name = "اسم الشعبة مطلوب";
    if (!values.capacity || Number(values.capacity) < 1) next.capacity = "السعة يجب أن تكون أكبر من صفر";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;
    onSubmit({
      course_id: Number(values.course_id),
      instructor_id: Number(values.instructor_id),
      section_name: values.section_name,
      capacity: Number(values.capacity),
      section_type: values.section_type,
    });
  };

  return (
    <Modal
      title={isEdit ? "تعديل الشعبة" : "إضافة شعبة جديدة"}
      onClose={onClose}
      width={560}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            إلغاء
          </button>
          <button type="submit" form="course-section-form" className="btn btn-primary" disabled={saving}>
            {saving ? <span className="spinner" /> : isEdit ? "حفظ التعديلات" : "إضافة الشعبة"}
          </button>
        </>
      }
    >
      <form id="course-section-form" onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <div className="form-field full">
            <label>المقرر</label>
            <select value={values.course_id} onChange={setField("course_id")}>
              <option value="">اختر المقرر</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.course_code} — {c.name}
                </option>
              ))}
            </select>
            {errors.course_id && <span className="error">{errors.course_id}</span>}
          </div>

          <div className="form-field">
            <label>نوع الشعبة</label>
            <select
              value={values.section_type}
              onChange={(e) => setValues((c) => ({ ...c, section_type: e.target.value, instructor_id: "" }))}
            >
              <option value="">اختر النوع</option>
              {SECTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            {errors.section_type && <span className="error">{errors.section_type}</span>}
          </div>

          <div className="form-field">
            <label>اسم الشعبة</label>
            <input value={values.section_name} onChange={setField("section_name")} placeholder="A" />
            {errors.section_name && <span className="error">{errors.section_name}</span>}
          </div>

          <div className="form-field full">
            <label>المدرّس المسؤول</label>
            <select value={values.instructor_id} onChange={setField("instructor_id")}>
              <option value="">اختر المدرّس</option>
              {eligibleStaff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.user?.first_name} {s.user?.last_name}
                </option>
              ))}
            </select>
            {values.section_type && eligibleStaff.length === 0 && (
              <span className="hint">لا يوجد مدرّسون بالنوع المطلوب لهذا النوع من الشعب بعد.</span>
            )}
            {errors.instructor_id && <span className="error">{errors.instructor_id}</span>}
          </div>

          <div className="form-field full">
            <label>السعة (عدد الطلاب)</label>
            <input type="number" value={values.capacity} onChange={setField("capacity")} placeholder="30" />
            {errors.capacity && <span className="error">{errors.capacity}</span>}
          </div>
        </div>
      </form>
    </Modal>
  );
}
