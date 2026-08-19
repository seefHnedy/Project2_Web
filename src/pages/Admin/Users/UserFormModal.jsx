import React, { useState } from "react";
import Modal from "../../../components/common/Modal";

export default function UserFormModal({ user, roles, saving, onSubmit, onClose }) {
  const isEdit = Boolean(user);
  const availableRoles = isEdit ? roles : roles.filter((r) => r.name === "Examinations");

  const [values, setValues] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    username: user?.username || "",
    email: user?.email || "",
    phone: user?.phone || "",
    password: "",
    role: user?.roles?.[0] || (availableRoles.length === 1 ? availableRoles[0].name : ""),
  });
  const [errors, setErrors] = useState({});

  const setField = (key) => (event) =>
    setValues((current) => ({ ...current, [key]: event.target.value }));

  const validate = () => {
    const next = {};
    if (!values.first_name.trim()) next.first_name = "الاسم الأول مطلوب";
    if (!values.last_name.trim()) next.last_name = "اسم العائلة مطلوب";
    if (!values.username.trim()) next.username = "اسم المستخدم مطلوب";
    if (!values.email.trim()) next.email = "البريد الإلكتروني مطلوب";
    if (!isEdit && (!values.password || values.password.length < 6)) {
      next.password = "كلمة المرور 6 أحرف على الأقل مطلوبة";
    }
    if (values.password && values.password.length < 6) {
      next.password = "كلمة المرور 6 أحرف على الأقل";
    }
    if (!values.role) next.role = "الرجاء اختيار الدور الوظيفي";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;
    const payload = { ...values };
    if (isEdit && !payload.password) {
      delete payload.password;
    }
    onSubmit(payload);
  };

  return (
    <Modal
      title={isEdit ? "تعديل المستخدم" : "إضافة مستخدم جديد"}
      onClose={onClose}
      width={560}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            إلغاء
          </button>
          <button type="submit" form="user-form" className="btn btn-primary" disabled={saving}>
            {saving ? <span className="spinner" /> : isEdit ? "حفظ التعديلات" : "إضافة المستخدم"}
          </button>
        </>
      }
    >
      <form id="user-form" onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <div className="form-field">
            <label>الاسم الأول</label>
            <input value={values.first_name} onChange={setField("first_name")} placeholder="محمد" />
            {errors.first_name && <span className="error">{errors.first_name}</span>}
          </div>
          <div className="form-field">
            <label>اسم العائلة</label>
            <input value={values.last_name} onChange={setField("last_name")} placeholder="أحمد" />
            {errors.last_name && <span className="error">{errors.last_name}</span>}
          </div>
          <div className="form-field">
            <label>اسم المستخدم</label>
            <input dir="ltr" value={values.username} onChange={setField("username")} placeholder="mohammad.ahmad" />
            {errors.username && <span className="error">{errors.username}</span>}
          </div>
          <div className="form-field">
            <label>البريد الإلكتروني</label>
            <input dir="ltr" type="email" value={values.email} onChange={setField("email")} placeholder="user@unify.com" />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>
          <div className="form-field">
            <label>رقم الهاتف</label>
            <input dir="ltr" value={values.phone} onChange={setField("phone")} placeholder="09xxxxxxxx" />
          </div>
          <div className="form-field">
            <label>الدور الوظيفي</label>
            {!isEdit && availableRoles.length <= 1 ? (
              <div
                style={{
                  minHeight: 44,
                  display: "flex",
                  alignItems: "center",
                  padding: "0 14px",
                  borderRadius: 12,
                  background: "var(--bg)",
                  border: "1px solid var(--line)",
                  fontWeight: 700,
                  color: "var(--text)",
                }}
              >
                {availableRoles[0]?.name || "—"}
              </div>
            ) : (
              <select value={values.role} onChange={setField("role")}>
                <option value="">اختر الدور</option>
                {availableRoles.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            )}
            {!isEdit && (
              <span className="hint">لا يمكن إنشاء حساب Admin جديد من هنا — فقط تعديل حساب موجود.</span>
            )}
            {errors.role && <span className="error">{errors.role}</span>}
          </div>
          <div className="form-field full">
            <label>كلمة المرور</label>
            <input dir="ltr" type="password" value={values.password} onChange={setField("password")} placeholder="••••••" />
            <span className="hint">{isEdit ? "اتركها فارغة لإبقاء كلمة المرور الحالية دون تغيير." : "6 أحرف على الأقل."}</span>
            {errors.password && <span className="error">{errors.password}</span>}
          </div>
        </div>
      </form>
    </Modal>
  );
}
