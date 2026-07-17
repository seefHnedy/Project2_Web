import React, { useEffect, useState } from "react";
import { Building2, Pencil, Plus, Trash2 } from "lucide-react";
import "../Dashboard/OverviewPage.css";
import "../Students/StudentsPage.css";
import "../../../components/common/styles/controls.css";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import DepartmentFormModal from "./DepartmentFormModal";
import { useToast } from "../../../context/ToastContext";
import {
  createDepartment,
  deleteDepartment,
  fetchDepartments,
  updateDepartment,
} from "../../../services/admin/departmentService";

export default function DepartmentsPage() {
  const toast = useToast();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const list = await fetchDepartments();
      setDepartments(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.message || "تعذّر تحميل الأقسام");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingDept(null);
    setFormOpen(true);
  };

  const openEdit = (dept) => {
    setEditingDept(dept);
    setFormOpen(true);
  };

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      if (editingDept) {
        await updateDepartment(editingDept.id, values);
        toast.success("تم تحديث القسم");
      } else {
        await createDepartment(values);
        toast.success("تم إضافة القسم بنجاح");
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
      await deleteDepartment(deleteTarget.id);
      toast.success("تم حذف القسم");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.message || "تعذّر حذف القسم — تأكد من عدم ارتباط طلاب به");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="page-toolbar">
        <div>
          <h1>إدارة الأقسام</h1>
          <p>الأقسام الأكاديمية المرتبطة بالطلاب داخل نظام Unify</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} /> إضافة قسم
        </button>
      </div>

      {error && <div className="overview-error">{error}</div>}

      <div className="dashboard-table-card">
        {loading ? (
          <div className="overview-loading">
            <span className="spinner dark" /> جارِ التحميل...
          </div>
        ) : departments.length === 0 ? (
          <div className="empty-state">
            <Building2 size={30} />
            <p>لا توجد أقسام بعد. أضف أول قسم أكاديمي.</p>
          </div>
        ) : (
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>اسم القسم</th>
                  <th>الرمز</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {departments.map((d) => (
                  <tr key={d.id}>
                    <td>{d.name}</td>
                    <td>
                      <span className="status pending">{d.code}</span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className="btn btn-ghost btn-icon" onClick={() => openEdit(d)} aria-label="تعديل">
                          <Pencil size={16} />
                        </button>
                        <button
                          className="btn btn-ghost btn-icon danger-hover"
                          onClick={() => setDeleteTarget(d)}
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
        <DepartmentFormModal
          department={editingDept}
          saving={saving}
          onSubmit={handleSubmit}
          onClose={() => setFormOpen(false)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`سيتم حذف قسم "${deleteTarget.name}" بشكل نهائي. لن يكون الحذف ممكناً إذا كان هناك طلاب مرتبطون بهذا القسم.`}
          loading={deleting}
          onConfirm={confirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
