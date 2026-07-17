import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import Modal from "../../../components/common/Modal";
import {
  COURSE_TYPES,
  STUDY_SEMESTERS,
  STUDY_SEMESTER_LABELS,
  STUDY_YEARS,
  STUDY_YEAR_LABELS,
} from "../../../services/admin/courseService";

export default function CourseFormModal({ course, allCourses, departments, saving, onSubmit, onClose }) {
  const isEdit = Boolean(course);

  const [values, setValues] = useState({
    course_code: course?.course_code || "",
    name: course?.name || "",
    credit_hours: course?.credit_hours ?? "",
    contact_hours: course?.contact_hours ?? "",
    max_absences: course?.max_absences ?? "",
    course_type: course?.course_type || "",
    prerequisites: (course?.prerequisites || []).map((p) => p.id),
  });

  const [deptRows, setDeptRows] = useState(
    course?.departments?.length
      ? course.departments.map((d) => ({
          department_id: d.id,
          study_year: d.study_year,
          study_semester: d.study_semester,
        }))
      : [{ department_id: "", study_year: STUDY_YEARS[0], study_semester: STUDY_SEMESTERS[0] }]
  );

  const [errors, setErrors] = useState({});

  const setField = (key) => (event) =>
    setValues((current) => ({ ...current, [key]: event.target.value }));

  const togglePrereq = (id) => {
    setValues((current) => {
      const exists = current.prerequisites.includes(id);
      return {
        ...current,
        prerequisites: exists
          ? current.prerequisites.filter((p) => p !== id)
          : [...current.prerequisites, id],
      };
    });
  };

  const updateDeptRow = (index, key, val) => {
    setDeptRows((rows) => rows.map((row, i) => (i === index ? { ...row, [key]: val } : row)));
  };

  const addDeptRow = () => {
    setDeptRows((rows) => [
      ...rows,
      { department_id: "", study_year: STUDY_YEARS[0], study_semester: STUDY_SEMESTERS[0] },
    ]);
  };

  const removeDeptRow = (index) => {
    setDeptRows((rows) => rows.filter((_, i) => i !== index));
  };

  const otherCourses = allCourses.filter((c) => c.id !== course?.id);

  const validate = () => {
    const next = {};
    if (!values.course_code.trim()) next.course_code = "رمز المقرر مطلوب";
    if (!values.name.trim()) next.name = "اسم المقرر مطلوب";
    if (!values.credit_hours) next.credit_hours = "الساعات المعتمدة مطلوبة";
    if (!values.contact_hours) next.contact_hours = "ساعات الاتصال مطلوبة";
    if (values.max_absences === "") next.max_absences = "الحد الأقصى للغياب مطلوب";
    if (!values.course_type) next.course_type = "الرجاء اختيار نوع المقرر";
    if (deptRows.length === 0 || deptRows.some((r) => !r.department_id)) {
      next.departments = "أضف قسماً واحداً على الأقل واختره";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;
    onSubmit({
      course_code: values.course_code,
      name: values.name,
      credit_hours: Number(values.credit_hours),
      contact_hours: Number(values.contact_hours),
      max_absences: Number(values.max_absences),
      course_type: values.course_type,
      prerequisites: values.prerequisites,
      departments: deptRows.map((r) => ({
        department_id: Number(r.department_id),
        study_year: r.study_year,
        study_semester: r.study_semester,
      })),
    });
  };

  return (
    <Modal
      title={isEdit ? "تعديل المقرر" : "إضافة مقرر جديد"}
      onClose={onClose}
      width={720}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            إلغاء
          </button>
          <button type="submit" form="course-form" className="btn btn-primary" disabled={saving}>
            {saving ? <span className="spinner" /> : isEdit ? "حفظ التعديلات" : "إضافة المقرر"}
          </button>
        </>
      }
    >
      <form id="course-form" onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <div className="form-field">
            <label>رمز المقرر</label>
            <input dir="ltr" value={values.course_code} onChange={setField("course_code")} placeholder="CS201" />
            {errors.course_code && <span className="error">{errors.course_code}</span>}
          </div>
          <div className="form-field">
            <label>اسم المقرر</label>
            <input value={values.name} onChange={setField("name")} placeholder="هياكل البيانات" />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>
          <div className="form-field">
            <label>الساعات المعتمدة</label>
            <input type="number" value={values.credit_hours} onChange={setField("credit_hours")} placeholder="3" />
            {errors.credit_hours && <span className="error">{errors.credit_hours}</span>}
          </div>
          <div className="form-field">
            <label>ساعات الاتصال الأسبوعية</label>
            <input type="number" value={values.contact_hours} onChange={setField("contact_hours")} placeholder="4" />
            {errors.contact_hours && <span className="error">{errors.contact_hours}</span>}
          </div>
          <div className="form-field">
            <label>الحد الأقصى للغياب</label>
            <input type="number" value={values.max_absences} onChange={setField("max_absences")} placeholder="5" />
            {errors.max_absences && <span className="error">{errors.max_absences}</span>}
          </div>
          <div className="form-field">
            <label>نوع المقرر</label>
            <select value={values.course_type} onChange={setField("course_type")}>
              <option value="">اختر النوع</option>
              {COURSE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            {errors.course_type && <span className="error">{errors.course_type}</span>}
          </div>

          {otherCourses.length > 0 && (
            <div className="form-field full">
              <label>المتطلبات السابقة (اختياري)</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "10px 4px" }}>
                {otherCourses.map((c) => {
                  const active = values.prerequisites.includes(c.id);
                  return (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => togglePrereq(c.id)}
                      className="btn"
                      style={{
                        padding: "8px 14px",
                        borderRadius: 999,
                        fontSize: 13,
                        background: active ? "var(--primary)" : "#f2f4f7",
                        color: active ? "#fff" : "var(--text)",
                      }}
                    >
                      {c.course_code} — {c.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="form-field full">
            <label>ربط المقرر بمناهج الأقسام</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {deptRows.map((row, index) => (
                <div
                  key={index}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr auto",
                    gap: 8,
                    alignItems: "center",
                    background: "var(--bg)",
                    padding: 10,
                    borderRadius: 12,
                  }}
                >
                  <select
                    value={row.department_id}
                    onChange={(e) => updateDeptRow(index, "department_id", e.target.value)}
                  >
                    <option value="">اختر القسم</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={row.study_year}
                    onChange={(e) => updateDeptRow(index, "study_year", e.target.value)}
                  >
                    {STUDY_YEARS.map((y) => (
                      <option key={y} value={y}>
                        {STUDY_YEAR_LABELS[y]}
                      </option>
                    ))}
                  </select>
                  <select
                    value={row.study_semester}
                    onChange={(e) => updateDeptRow(index, "study_semester", e.target.value)}
                  >
                    {STUDY_SEMESTERS.map((s) => (
                      <option key={s} value={s}>
                        {STUDY_SEMESTER_LABELS[s]}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-ghost btn-icon danger-hover"
                    onClick={() => removeDeptRow(index)}
                    aria-label="حذف الصف"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-ghost"
                onClick={addDeptRow}
                style={{ alignSelf: "flex-start" }}
              >
                <Plus size={16} /> إضافة قسم آخر
              </button>
            </div>
            {errors.departments && <span className="error">{errors.departments}</span>}
          </div>
        </div>
      </form>
    </Modal>
  );
}
