import React, { useEffect, useState } from "react";
import { CalendarRange, Pencil, Plus, Trash2 } from "lucide-react";
import "../Dashboard/OverviewPage.css";
import "../Students/StudentsPage.css";
import "../../../components/common/styles/controls.css";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import SemesterFormModal from "./SemesterFormModal";
import { useToast } from "../../../context/ToastContext";
import {
  createSemester,
  deleteSemester,
  fetchSemesters,
  updateSemester,
} from "../../../services/admin/semesterService";

export default function SemestersPage() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setRows(await fetchSemesters());
    } catch (err) {
      setError(err.message || "تعذّر تحميل الفصول الدراسية");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      if (editing) {
        await updateSemester(editing.id, values);
        toast.success("تم تحديث الفصل الدراسي");
      } else {
        await createSemester(values);
        toast.success("تم إضافة الفصل الدراسي");
      }
      setFormOpen(false);
      load();
    } catch (err) {
      toast.error(err.message || "فشلت العملية");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteSemester(deleteTarget.id);
      toast.success("تم حذف الفصل الدراسي");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.message || "تعذّر حذف الفصل الدراسي");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="page-toolbar">
        <div>
          <h1>الفصول الدراسية</h1>
          <p>فصل واحد فقط يمكن أن يكون "الفصل الحالي" بأي وقت</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus size={18} /> إضافة فصل دراسي
        </button>
      </div>

      {error && <div className="overview-error">{error}</div>}

      <div className="dashboard-table-card">
        {loading ? (
          <div className="overview-loading">
            <span className="spinner dark" /> جارِ التحميل...
          </div>
        ) : rows.length === 0 ? (
          <div className="empty-state">
            <CalendarRange size={30} />
            <p>لا توجد فصول دراسية بعد.</p>
          </div>
        ) : (
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>السنة الدراسية</th>
                  <th>البداية</th>
                  <th>النهاية</th>
                  <th>الحالة</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{s.academic_year}</td>
                    <td>{s.start_date}</td>
                    <td>{s.end_date}</td>
                    <td>
                      <span className={`status ${s.is_current ? "success" : "pending"}`}>
                        {s.is_current ? "الفصل الحالي" : "غير نشط"}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="btn btn-ghost btn-icon"
                          onClick={() => {
                            setEditing(s);
                            setFormOpen(true);
                          }}
                          aria-label="تعديل"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="btn btn-ghost btn-icon danger-hover"
                          onClick={() => setDeleteTarget(s)}
                          aria-label="حذف"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {formOpen && (
        <SemesterFormModal
          semester={editing}
          saving={saving}
          onSubmit={handleSubmit}
          onClose={() => setFormOpen(false)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`سيتم حذف الفصل الدراسي "${deleteTarget.name}" بشكل نهائي.`}
          loading={deleting}
          onConfirm={confirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
