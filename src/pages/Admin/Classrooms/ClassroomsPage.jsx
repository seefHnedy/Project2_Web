import React, { useEffect, useState } from "react";
import { DoorOpen, Pencil, Plus, Trash2 } from "lucide-react";
import "../Dashboard/OverviewPage.css";
import "../Students/StudentsPage.css";
import "../../../components/common/styles/controls.css";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import ClassroomFormModal from "./ClassroomFormModal";
import { useToast } from "../../../context/ToastContext";
import {
  createClassroom,
  deleteClassroom,
  fetchClassrooms,
  updateClassroom,
} from "../../../services/admin/classroomService";

export default function ClassroomsPage() {
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
      setRows(await fetchClassrooms());
    } catch (err) {
      setError(err.message || "تعذّر تحميل القاعات");
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
        await updateClassroom(editing.id, values);
        toast.success("تم تحديث القاعة");
      } else {
        await createClassroom(values);
        toast.success("تم إضافة القاعة");
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
      await deleteClassroom(deleteTarget.id);
      toast.success("تم حذف القاعة");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.message || "تعذّر حذف القاعة");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="page-toolbar">
        <div>
          <h1>القاعات الدراسية</h1>
          <p>القاعات المتاحة للجدولة الأسبوعية للشعب</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus size={18} /> إضافة قاعة
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
            <DoorOpen size={30} />
            <p>لا توجد قاعات بعد. أضف أول قاعة.</p>
          </div>
        ) : (
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>اسم القاعة</th>
                  <th>المبنى</th>
                  <th>الطابق</th>
                  <th>السعة</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c.building}</td>
                    <td>{c.floor ?? "—"}</td>
                    <td>{c.capacity} مقعد</td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="btn btn-ghost btn-icon"
                          onClick={() => {
                            setEditing(c);
                            setFormOpen(true);
                          }}
                          aria-label="تعديل"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="btn btn-ghost btn-icon danger-hover"
                          onClick={() => setDeleteTarget(c)}
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
        <ClassroomFormModal
          classroom={editing}
          saving={saving}
          onSubmit={handleSubmit}
          onClose={() => setFormOpen(false)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`سيتم حذف قاعة "${deleteTarget.name}" بشكل نهائي.`}
          loading={deleting}
          onConfirm={confirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
