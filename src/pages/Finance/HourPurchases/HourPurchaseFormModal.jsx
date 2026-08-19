import React, { useEffect, useMemo, useState } from "react";
import Modal from "../../../components/common/Modal";
import { fetchFinancialAccount } from "../../../services/finance/financialAccountService";
import { fetchSettings } from "../../../services/admin/systemSettingService";

export default function HourPurchaseFormModal({ students, saving, onSubmit, onClose }) {
  const [values, setValues] = useState({ student_id: "", credit_hours: "" });
  const [errors, setErrors] = useState({});
  const [account, setAccount] = useState(null);
  const [accountLoading, setAccountLoading] = useState(false)
  const [pricePerHour, setPricePerHour] = useState(null);

  useEffect(() => {
    fetchSettings()
      .then((data) => setPricePerHour(Number(data?.credit_hour_price) || 0))
      .catch(() => setPricePerHour(null));
  }, []);

  useEffect(() => {
    if (!values.student_id) {
      setAccount(null);
      return;
    }
    setAccountLoading(true);
    fetchFinancialAccount(values.student_id)
      .then((data) => setAccount(data))
      .catch(() => setAccount(null))
      .finally(() => setAccountLoading(false));
  }, [values.student_id]);

  const setField = (key) => (event) =>
    setValues((current) => ({ ...current, [key]: event.target.value }));

  const totalCost = useMemo(() => {
    if (pricePerHour == null || !values.credit_hours) return null;
    const hours = Number(values.credit_hours);
    if (Number.isNaN(hours) || hours <= 0) return null;
    return pricePerHour * hours;
  }, [pricePerHour, values.credit_hours]);

  const hasInsufficientBalance = useMemo(() => {
    if (!account || totalCost == null) return false;
    return Number(account.available_balance) < totalCost;
  }, [account, totalCost]);

  const validate = () => {
    const next = {};
    if (!values.student_id) next.student_id = "الرجاء اختيار الطالب";
    if (!values.credit_hours || Number(values.credit_hours) < 1) next.credit_hours = "عدد الساعات يجب أن يكون 1 أو أكثر";
    if (!next.student_id && !next.credit_hours && hasInsufficientBalance) {
      next.credit_hours = "ليس لديك رصيد كافٍ لإتمام العملية";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;
    onSubmit({ student_id: Number(values.student_id), credit_hours: Number(values.credit_hours) });
  };

  return (
    <Modal
      title="تسجيل عملية شراء ساعات معتمدة"
      onClose={onClose}
      width={480}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>إلغاء</button>
          <button
            type="submit"
            form="hour-purchase-form"
            className="btn btn-primary"
            disabled={saving || hasInsufficientBalance}
          >
            {saving ? <span className="spinner" /> : "تسجيل الشراء"}
          </button>
        </>
      }
    >
      <form id="hour-purchase-form" onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label>الطالب</label>
          <select value={values.student_id} onChange={setField("student_id")}>
            <option value="">اختر الطالب</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.student_number} — {s.user?.first_name} {s.user?.last_name}
              </option>
            ))}
          </select>
          {errors.student_id && <span className="error">{errors.student_id}</span>}
        </div>

        {values.student_id && (
          <div className="hint" style={{ marginBottom: 14 }}>
            {accountLoading
              ? "جارِ تحميل الرصيد..."
              : account
              ? `الرصيد المتاح: ${account.available_balance} — الساعات المتبقية: ${account.remaining_credit_hours}`
              : "تعذّر تحميل بيانات الرصيد"}
          </div>
        )}

        <div className="form-field">
          <label>عدد الساعات المعتمدة</label>
          <input type="number" min="1" value={values.credit_hours} onChange={setField("credit_hours")} placeholder="3" />
          {errors.credit_hours && <span className="error">{errors.credit_hours}</span>}
        </div>

        {totalCost != null && (
          <div className="form-field">
            <span className="hint">
              الكلفة الإجمالية المتوقعة: {totalCost}
              {account && !hasInsufficientBalance ? " — الرصيد كافٍ" : ""}
            </span>
            {hasInsufficientBalance && <span className="error">ليس لديك رصيد كافٍ لإتمام العملية</span>}
          </div>
        )}
      </form>
    </Modal>
  );
}
