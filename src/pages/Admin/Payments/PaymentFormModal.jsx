import React, { useState } from "react";
import Modal from "../../../components/common/Modal";

export default function PaymentFormModal({ students, saving, onSubmit, onClose }) {
  const [values, setValues] = useState({
    student_id: "",
    amount: "",
    reference_number: "",
    payment_date: new Date().toISOString().slice(0, 10),
  });
  const [errors, setErrors] = useState({});

  const setField = (key) => (event) =>
    setValues((current) => ({ ...current, [key]: event.target.value }));

  const validate = () => {
    const next = {};
    if (!values.student_id) next.student_id = "الرجاء اختيار الطالب";
    if (!values.amount || Number(values.amount) <= 0) next.amount = "المبلغ يجب أن يكون أكبر من صفر";
    if (!values.reference_number.trim()) next.reference_number = "رقم المرجع مطلوب";
    if (!values.payment_date) next.payment_date = "تاريخ الدفع مطلوب";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;
    onSubmit({
      student_id: Number(values.student_id),
      amount: Number(values.amount),
      reference_number: values.reference_number,
      payment_date: values.payment_date,
    });
  };

  return (
    <Modal
      title="تسجيل دفعة جديدة"
      onClose={onClose}
      width={480}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            إلغاء
          </button>
          <button type="submit" form="payment-form" className="btn btn-primary" disabled={saving}>
            {saving ? <span className="spinner" /> : "تسجيل الدفعة"}
          </button>
        </>
      }
    >
      <form id="payment-form" onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label>الطالب</label>
          <select value={values.student_id} onChange={setField("student_id")}>
            <option value="">اختر الطالب</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.user?.first_name} {s.user?.last_name} — {s.student_number}
              </option>
            ))}
          </select>
          {errors.student_id && <span className="error">{errors.student_id}</span>}
        </div>

        <div className="form-field">
          <label>المبلغ</label>
          <input type="number" value={values.amount} onChange={setField("amount")} placeholder="500000" />
          {errors.amount && <span className="error">{errors.amount}</span>}
        </div>

        <div className="form-field">
          <label>رقم المرجع</label>
          <input
            dir="ltr"
            value={values.reference_number}
            onChange={setField("reference_number")}
            placeholder="TRX-2026-0001"
          />
          {errors.reference_number && <span className="error">{errors.reference_number}</span>}
        </div>

        <div className="form-field">
          <label>تاريخ الدفع</label>
          <input type="date" value={values.payment_date} onChange={setField("payment_date")} />
          {errors.payment_date && <span className="error">{errors.payment_date}</span>}
        </div>
      </form>
    </Modal>
  );
}
