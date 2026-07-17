import React, { useState } from "react";
import Modal from "../../../components/common/Modal";
import { STAFF_TYPES } from "../../../services/admin/teachingStaffService";

export default function TeachingStaffFormModal({ member, departments, saving, onSubmit, onClose }) {
  const isEdit = Boolean(member);
  const [values, setValues] = useState({
    username: member?.user?.username || "",
    first_name: member?.user?.first_name || "",
    last_name: member?.user?.last_name || "",
    email: member?.user?.email || "",
    phone: member?.user?.phone || "",
    password: "",
    staff_type: member?.staff_type || "",
    departments: (member?.departments || []).map((d) => d.id),
  });
  const [errors, setErrors] = useState({});

  const setField = (key) => (event) =>
    setValues((current) => ({ ...current, [key]: event.target.value }));

  const toggleDepartment = (id) => {
    setValues((current) => {
      const exists = current.departments.includes(id);
      return {
        ...current,
        departments: exists
          ? current.departments.filter((d) => d !== id)
          : [...current.departments, id],
      };
    });
  };

  const validate = () => {
    const next = {};
    if (!values.username.trim()) next.username = "اسم المستخدم مطلوب";
    if (!values.first_name.trim()) next.first_name = "الاسم الأول مطلوب";
    if (!values.last_name.trim()) next.last_name = "اسم العائلة مطلوب";
    if (!values.email.trim()) next.email = "البريد الإلكتروني مطلوب";
    if (!values.phone.trim()) next.phone = "رقم الهاتف مطلوب";
    if (!values.staff_type) next.staff_type = "الرجاء اختيار النوع";
    if (values.departments.length === 0) next.departments = "اختر قسماً واحداً على الأقل";
    if (!isEdit && (!values.password || values.password.length < 8)) {
      next.password = "كلمة المرور 8 أحرف على الأقل";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;
    const payload = { ...values };
    if (isEdit) delete payload.password;
    onSubmit(payload);
  };

  return (
    <Modal
      title={isEdit ? "تعديل عضو الهيئة التدريسية" : "إضافة عضو هيئة تدريسية"}
      onClose={onClose}
      width={640}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            إلغاء
          </button>
          <button type="submit" form="teaching-staff-form" className="btn btn-primary" disabled={saving}>
            {saving ? <span className="spinner" /> : isEdit ? "حفظ التعديلات" : "إضافة العضو"}
          </button>
        </>
      }
    >
      <form id="teaching-staff-form" onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <div className="form-field">
            <label>اسم المستخدم</label>
            <input dir="ltr" value={values.username} onChange={setField("username")} placeholder="jsmith" />
            {errors.username && <span className="error">{errors.username}</span>}
          </div>
          <div className="form-field">
            <label>النوع</label>
            <select value={values.staff_type} onChange={setField("staff_type")}>
              <option value="">اختر النوع</option>
              {STAFF_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            {errors.staff_type && <span className="error">{errors.staff_type}</span>}
          </div>
          <div className="form-field">
            <label>الاسم الأول</label>
            <input value={values.first_name} onChange={setField("first_name")} />
            {errors.first_name && <span className="error">{errors.first_name}</span>}
          </div>
          <div className="form-field">
            <label>اسم العائلة</label>
            <input value={values.last_name} onChange={setField("last_name")} />
            {errors.last_name && <span className="error">{errors.last_name}</span>}
          </div>
          <div className="form-field">
            <label>البريد الإلكتروني</label>
            <input dir="ltr" type="email" value={values.email} onChange={setField("email")} />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>
          <div className="form-field">
            <label>رقم الهاتف</label>
            <input dir="ltr" value={values.phone} onChange={setField("phone")} />
            {errors.phone && <span className="error">{errors.phone}</span>}
          </div>
          {!isEdit && (
            <div className="form-field full">
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

          <div className="form-field full">
            <label>الأقسام المرتبطة</label>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                padding: "10px 4px",
              }}
            >
              {departments.map((d) => {
                const active = values.departments.includes(d.id);
                return (
                  <button
                    type="button"
                    key={d.id}
                    onClick={() => toggleDepartment(d.id)}
                    className="btn"
                    style={{
                      padding: "8px 14px",
                      borderRadius: 999,
                      fontSize: 13,
                      background: active ? "var(--primary)" : "#f2f4f7",
                      color: active ? "#fff" : "var(--text)",
                    }}
                  >
                    {d.name}
                  </button>
                );
              })}
            </div>
            {errors.departments && <span className="error">{errors.departments}</span>}
          </div>
        </div>
      </form>
    </Modal>
  );
}
