import React, { useEffect, useState } from "react";
import { GraduationCap, Pencil, Plus, Trash2 } from "lucide-react";
import "../Dashboard/OverviewPage.css";
import "../Students/StudentsPage.css";
import "../../../components/common/styles/controls.css";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import CourseFormModal from "./CourseFormModal";
import { useToast } from "../../../context/ToastContext";
import { COURSE_TYPES, createCourse, deleteCourse, fetchCourses, updateCourse } from "../../../services/admin/courseService";
import { fetchDepartments } from "../../../services/admin/departmentService";

const courseTypeLabel = (value) => COURSE_TYPES.find((t) => t.value === value)?.label || value;

export default function CoursesPage() {
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
      setRows(await fetchCourses());
    } catch (err) {
      setError(err.message || "تعذّر تحميل المقررات");
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
        await updateCourse(editing.id, values);
        toast.success("تم تحديث المقرر");
      } else {
        await createCourse(values);
        toast.success("تم إضافة المقرر");
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
      await deleteCourse(deleteTarget.id);
      toast.success("تم حذف المقرر");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.message || "تعذّر حذف المقرر");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="page-toolbar">
        <div>
          <h1>المقررات الدراسية</h1>
          <p>خطط المقررات، المتطلبات السابقة، وربطها بمناهج الأقسام</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus size={18} /> إضافة مقرر
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
            <GraduationCap size={30} />
            <p>لا توجد مقررات بعد.</p>
          </div>
        ) : (
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>الرمز</th>
                  <th>اسم المقرر</th>
                  <th>الساعات المعتمدة</th>
                  <th>النوع</th>
                  <th>الأقسام</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id}>
                    <td dir="ltr" style={{ textAlign: "right" }}>
                      {c.course_code}
                    </td>
                    <td>{c.name}</td>
                    <td>{c.credit_hours}</td>
                    <td>
                      <span className="status pending">{courseTypeLabel(c.course_type)}</span>
                    </td>
                    <td>{(c.departments || []).map((d) => d.name).join("، ") || "—"}</td>
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
        <CourseFormModal
          course={editing}
          allCourses={rows}
          departments={departments}
          saving={saving}
          onSubmit={handleSubmit}
          onClose={() => setFormOpen(false)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`سيتم حذف مقرر "${deleteTarget.name}" بشكل نهائي.`}
          loading={deleting}
          onConfirm={confirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
