import React, { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, Users } from "lucide-react";
import "../Dashboard/OverviewPage.css";
import "../Students/StudentsPage.css";
import "../../../components/common/styles/controls.css";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import TeachingStaffFormModal from "./TeachingStaffFormModal";
import { useToast } from "../../../context/ToastContext";
import { STAFF_TYPES } from "../../../services/admin/teachingStaffService";
import {
  createTeachingStaff,
  deleteTeachingStaff,
  fetchTeachingStaff,
  updateTeachingStaff,
} from "../../../services/admin/teachingStaffService";
import { fetchDepartments } from "../../../services/admin/departmentService";

const staffTypeLabel = (value) => STAFF_TYPES.find((t) => t.value === value)?.label || value;

export default function TeachingStaffPage() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [departments, setDepartments] = useState([]);
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
      setRows(await fetchTeachingStaff());
    } catch (err) {
      setError(err.message || "تعذّر تحميل الهيئة التدريسية");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments()
      .then((list) => setDepartments(Array.isArray(list) ? list : []))
      .catch(() => setDepartments([]));
    load();
  }, []);

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      if (editing) {
        const { password, ...rest } = values;
        await updateTeachingStaff(editing.id, rest);
        toast.success("تم تحديث بيانات عضو الهيئة التدريسية");
      } else {
        await createTeachingStaff(values);
        toast.success("تم إضافة عضو هيئة تدريسية");
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
      await deleteTeachingStaff(deleteTarget.id);
      toast.success("تم حذف عضو الهيئة التدريسية");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.message || "تعذّر الحذف");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="page-toolbar">
        <div>
          <h1>الهيئة التدريسية</h1>
          <p>الدكاترة والمعيدون المخبريون المسؤولون عن شعب المقررات</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus size={18} /> إضافة عضو
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
            <Users size={30} />
            <p>لا يوجد أعضاء هيئة تدريسية بعد.</p>
          </div>
        ) : (
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>البريد الإلكتروني</th>
                  <th>النوع</th>
                  <th>الأقسام</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t.id}>
                    <td>
                      {t.user?.first_name} {t.user?.last_name}
                    </td>
                    <td dir="ltr" style={{ textAlign: "right" }}>
                      {t.user?.email}
                    </td>
                    <td>
                      <span className="status pending">{staffTypeLabel(t.staff_type)}</span>
                    </td>
                    <td>{(t.departments || []).map((d) => d.name).join("، ") || "—"}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="btn btn-ghost btn-icon"
                          onClick={() => {
                            setEditing(t);
                            setFormOpen(true);
                          }}
                          aria-label="تعديل"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="btn btn-ghost btn-icon danger-hover"
                          onClick={() => setDeleteTarget(t)}
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
        <TeachingStaffFormModal
          member={editing}
          departments={departments}
          saving={saving}
          onSubmit={handleSubmit}
          onClose={() => setFormOpen(false)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`سيتم حذف "${deleteTarget.user?.first_name} ${deleteTarget.user?.last_name}" وحسابه بشكل نهائي.`}
          loading={deleting}
          onConfirm={confirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
