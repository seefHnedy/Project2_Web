import React, { useEffect, useState } from "react";
import { Coins, Plus } from "lucide-react";
import "../../Admin/Dashboard/OverviewPage.css";
import "../../Admin/Students/StudentsPage.css";
import "../../../components/common/styles/controls.css";
import HourPurchaseFormModal from "./HourPurchaseFormModal";
import { useToast } from "../../../context/ToastContext";
import { fetchStudents } from "../../../services/admin/studentService";
import { createHourPurchase, fetchHourPurchases } from "../../../services/finance/hourPurchaseService";

async function fetchAllStudents() {
  let page = 1;
  let all = [];
  while (true) {
    const res = await fetchStudents(page);
    all = all.concat(res.data || []);
    if (!res.last_page || page >= res.last_page) break;
    page += 1;
  }
  return all;
}

export default function HourPurchasesPage() {
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
      const list = await fetchHourPurchases();
      setRows(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.message || "تعذّر تحميل عمليات الشراء");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    fetchAllStudents()
      .then(setStudents)
      .catch(() => setStudents([]));
  }, []);

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      await createHourPurchase(values);
      toast.success("تم تسجيل عملية الشراء بنجاح");
      setFormOpen(false);
      load();
    } catch (err) {
      const status = err?.status;
      const rawMessage = err.message || "";
      const looksLikeValidationFailure =
        status === 422 || status === 500 || /invalid|balance/i.test(rawMessage);
      toast.error(
        looksLikeValidationFailure
          ? "ليس لديك رصيد كافٍ لإتمام العملية"
          : rawMessage || "فشلت عملية الشراء"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-toolbar">
        <div>
          <h1>شراء الساعات المعتمدة</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setFormOpen(true)}>
          <Plus size={18} /> تسجيل عملية شراء
        </button>
      </div>

      {error && <div className="overview-error">{error}</div>}

      <div className="dashboard-table-card">
        {loading ? (
          <div className="overview-loading"><span className="spinner dark" /> جارِ التحميل...</div>
        ) : rows.length === 0 ? (
          <div className="empty-state">
            <Coins size={30} />
            <p>لا توجد عمليات شراء بعد.</p>
          </div>
        ) : (
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>الطالب</th>
                  <th>عدد الساعات</th>
                  <th>سعر الساعة</th>
                  <th>المبلغ الكلي</th>
                  <th>التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id}>
                    <td>
                      {p.student?.user?.first_name} {p.student?.user?.last_name}
                      {p.student?.student_number ? ` (${p.student.student_number})` : ""}
                    </td>
                    <td>{p.credit_hours}</td>
                    <td>{p.price_per_hour}</td>
                    <td>{p.total_amount}</td>
                    <td dir="ltr" style={{ textAlign: "right" }}>
                      {p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {formOpen && (
        <HourPurchaseFormModal
          students={students}
          saving={saving}
          onSubmit={handleSubmit}
          onClose={() => setFormOpen(false)}
        />
      )}
    </div>
  );
}
