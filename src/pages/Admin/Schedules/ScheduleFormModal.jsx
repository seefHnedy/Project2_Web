import React, { useState } from "react";
import Modal from "../../../components/common/Modal";
import { DAYS_OF_WEEK, DAY_LABELS } from "../../../services/admin/scheduleService";

export default function ScheduleFormModal({ schedule, sections, classrooms, saving, onSubmit, onClose }) {
  const isEdit = Boolean(schedule);
  const [values, setValues] = useState({
    course_section_id: schedule?.course_section?.id || "",
    classroom_id: schedule?.classroom?.id || "",
    day_of_week: schedule?.day_of_week || DAYS_OF_WEEK[0],
    start_time: schedule?.start_time?.slice(0, 5) || "",
    end_time: schedule?.end_time?.slice(0, 5) || "",
  });
  const [errors, setErrors] = useState({});

  const setField = (key) => (event) =>
    setValues((current) => ({ ...current, [key]: event.target.value }));

  const validate = () => {
    const next = {};
    if (!values.course_section_id) next.course_section_id = "الرجاء اختيار الشعبة";
    if (!values.classroom_id) next.classroom_id = "الرجاء اختيار القاعة";
    if (!values.start_time) next.start_time = "وقت البداية مطلوب";
    if (!values.end_time) next.end_time = "وقت النهاية مطلوب";
    if (values.start_time && values.end_time && values.start_time >= values.end_time) {
      next.end_time = "يجب أن يكون وقت النهاية بعد وقت البداية";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;
    onSubmit({
      course_section_id: Number(values.course_section_id),
      classroom_id: Number(values.classroom_id),
      day_of_week: values.day_of_week,
      start_time: values.start_time,
      end_time: values.end_time,
    });
  };

  return (
    <Modal
      title={isEdit ? "تعديل الموعد" : "إضافة موعد للجدول"}
      onClose={onClose}
      width={520}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            إلغاء
          </button>
          <button type="submit" form="schedule-form" className="btn btn-primary" disabled={saving}>
            {saving ? <span className="spinner" /> : isEdit ? "حفظ التعديلات" : "إضافة الموعد"}
          </button>
        </>
      }
    >
      <form id="schedule-form" onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <div className="form-field full">
            <label>الشعبة</label>
            <select value={values.course_section_id} onChange={setField("course_section_id")}>
              <option value="">اختر الشعبة</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.course?.course_code} — {s.section_name}
                </option>
              ))}
            </select>
            {errors.course_section_id && <span className="error">{errors.course_section_id}</span>}
          </div>

          <div className="form-field full">
            <label>القاعة</label>
            <select value={values.classroom_id} onChange={setField("classroom_id")}>
              <option value="">اختر القاعة</option>
              {classrooms.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.building}
                </option>
              ))}
            </select>
            {errors.classroom_id && <span className="error">{errors.classroom_id}</span>}
          </div>

          <div className="form-field full">
            <label>اليوم</label>
            <select value={values.day_of_week} onChange={setField("day_of_week")}>
              {DAYS_OF_WEEK.map((d) => (
                <option key={d} value={d}>
                  {DAY_LABELS[d]}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label>وقت البداية</label>
            <input type="time" value={values.start_time} onChange={setField("start_time")} />
            {errors.start_time && <span className="error">{errors.start_time}</span>}
          </div>
          <div className="form-field">
            <label>وقت النهاية</label>
            <input type="time" value={values.end_time} onChange={setField("end_time")} />
            {errors.end_time && <span className="error">{errors.end_time}</span>}
          </div>
        </div>
      </form>
    </Modal>
  );
}
