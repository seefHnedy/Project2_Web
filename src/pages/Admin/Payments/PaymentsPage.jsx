import React, { useEffect, useState } from "react";
import { Banknote, Plus } from "lucide-react";
import "../Dashboard/OverviewPage.css";
import "../Students/StudentsPage.css";
import "../../../components/common/styles/controls.css";
import PaymentFormModal from "./PaymentFormModal";
import { useToast } from "../../../context/ToastContext";
import { createPayment, fetchPayments } from "../../../services/admin/paymentService";
import { fetchStudents } from "../../../services/admin/studentService";

export default function PaymentsPage() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setRows(await fetchPayments());
    } catch (err) {
      setError(err.message || "تعذّر تحميل الدفعات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    
    fetchStudents(1)
      .then((page) => setStudents(page?.data || []))
      .catch(() => setStudents([]));
    load();
  }, []);

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      await createPayment(values);
      toast.success("تم تسجيل الدفعة بنجاح");
      setFormOpen(false);
      load();
    } catch (err) {
      toast.error(err.message || "فشلت عملية تسجيل الدفعة");
    } finally {
      setSaving(false);
    }
  };

  const totalAmount = rows.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  return (
    <div>
      <div className="page-toolbar">
        <div>
          <h1>الدفعات المالية</h1>
          <p>سجل رسوم الطلاب — عرض وتسجيل فقط (لا يدعم الباك-إند التعديل/الحذف بعد)</p>
        </div>
        <button className="btn btn-primary" onClick={() => setFormOpen(true)}>
          <Plus size={18} /> تسجيل دفعة
        </button>
      </div>

      {error && <div className="overview-error">{error}</div>}

      {!loading && rows.length > 0 && (
        <div className="stat-card" style={{ marginTop: 18, maxWidth: 320 }}>
          <div className="stat-icon">
            <Banknote size={24} />
          </div>
          <div>
            <h2>{totalAmount.toLocaleString("ar")} </h2>
            <p>إجمالي الدفعات المسجّلة</p>
          </div>
        </div>
      )}

      <div className="dashboard-table-card" style={{ marginTop: 18 }}>
        {loading ? (
          <div className="overview-loading">
            <span className="spinner dark" /> جارِ التحميل...
          </div>
        ) : rows.length === 0 ? (
          <div className="empty-state">
            <Banknote size={30} />
            <p>لا توجد دفعات مسجّلة بعد.</p>
          </div>
        ) : (
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>الطالب</th>
                  <th>المبلغ</th>
                  <th>رقم المرجع</th>
                  <th>تاريخ الدفع</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id}>
                    <td>
                      {p.student?.user?.first_name} {p.student?.user?.last_name}
                    </td>
                    <td>{Number(p.amount).toLocaleString("ar")}</td>
                    <td dir="ltr" style={{ textAlign: "right" }}>
                      {p.reference_number}
                    </td>
                    <td>{p.payment_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {formOpen && (
        <PaymentFormModal
          students={students}
          saving={saving}
          onSubmit={handleSubmit}
          onClose={() => setFormOpen(false)}
        />
      )}
    </div>
  );
}
