import React, { useState } from "react";
import Modal from "../../../components/common/Modal";

const emptyForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  password: "",
  student_number: "",
  department_id: "",
  nfc_uid: "",
};

export default function StudentFormModal({ student, departments, saving, onSubmit, onClose }) {
  const isEdit = Boolean(student);
  const [values, setValues] = useState(
    isEdit
      ? {
          first_name: student.user?.first_name || "",
          last_name: student.user?.last_name || "",
          email: student.user?.email || "",
          phone: student.user?.phone || "",
          password: "",
          student_number: student.student_number || "",
          department_id: student.department?.id || "",
          nfc_uid: student.nfc_uid || "",
        }
      : emptyForm
  );
  const [errors, setErrors] = useState({});

  const setField = (key) => (event) =>
    setValues((current) => ({ ...current, [key]: event.target.value }));

  const validate = () => {
    const next = {};
    if (!values.first_name.trim()) next.first_name = "الاسم الأول مطلوب";
    if (!values.last_name.trim()) next.last_name = "اسم العائلة مطلوب";
    if (!values.email.trim()) next.email = "البريد الإلكتروني مطلوب";
    if (!values.phone.trim()) next.phone = "رقم الهاتف مطلوب";
    if (!values.student_number.trim()) next.student_number = "الرقم الجامعي مطلوب";
    if (!values.department_id) next.department_id = "الرجاء اختيار القسم";
    if (!isEdit && (!values.password || values.password.length < 8)) {
      next.password = "كلمة المرور 8 أحرف على الأقل";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;
    const payload = { ...values, department_id: Number(values.department_id) };
    if (isEdit) {
      delete payload.password;
      
      if (!payload.nfc_uid) delete payload.nfc_uid;
    } else {
      payload.nfc_uid = payload.nfc_uid || null;
    }
    onSubmit(payload);
  };

  return (
    <Modal
      title={isEdit ? "تعديل بيانات الطالب" : "إضافة طالب جديد"}
      onClose={onClose}
      width={620}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            إلغاء
          </button>
          <button type="submit" form="student-form" className="btn btn-primary" disabled={saving}>
            {saving ? <span className="spinner" /> : isEdit ? "حفظ التعديلات" : "إضافة الطالب"}
          </button>
        </>
      }
    >
      <form id="student-form" onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <div className="form-field">
            <label>الاسم الأول</label>
            <input value={values.first_name} onChange={setField("first_name")} placeholder="مثال: أحمد" />
            {errors.first_name && <span className="error">{errors.first_name}</span>}
          </div>

          <div className="form-field">
            <label>اسم العائلة</label>
            <input value={values.last_name} onChange={setField("last_name")} placeholder="مثال: خالد" />
            {errors.last_name && <span className="error">{errors.last_name}</span>}
          </div>

          <div className="form-field">
            <label>البريد الإلكتروني</label>
            <input
              type="email"
              dir="ltr"
              value={values.email}
              onChange={setField("email")}
              placeholder="student@university.edu"
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="form-field">
            <label>رقم الهاتف</label>
            <input dir="ltr" value={values.phone} onChange={setField("phone")} placeholder="+963 9xx xxx xxx" />
            {errors.phone && <span className="error">{errors.phone}</span>}
          </div>

          <div className="form-field">
            <label>الرقم الجامعي</label>
            <input value={values.student_number} onChange={setField("student_number")} placeholder="2026xxxxx" />
            {errors.student_number && <span className="error">{errors.student_number}</span>}
          </div>

          <div className="form-field">
            <label>القسم</label>
            <select value={values.department_id} onChange={setField("department_id")}>
              <option value="">اختر القسم</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            {errors.department_id && <span className="error">{errors.department_id}</span>}
          </div>

          <div className="form-field">
            <label>معرّف بطاقة NFC (اختياري)</label>
            <input dir="ltr" value={values.nfc_uid} onChange={setField("nfc_uid")} placeholder="04:A2:1B:..." />
          </div>

          {!isEdit && (
            <div className="form-field">
              <label>كلمة المرور</label>
              <input
                type="password"
                value={values.password}
                onChange={setField("password")}
                placeholder="8 أحرف على الأقل"
              />
              {errors.password && <span className="error">{errors.password}</span>}
            </div>
          )}
        </div>

        {isEdit && (
          <p className="hint" style={{ marginTop: 4 }}>
            لا يمكن تغيير كلمة المرور من هذه الشاشة — استخدم صفحة "نسيت كلمة المرور" من شاشة الدخول.
          </p>
        )}
      </form>
    </Modal>
  );
}
