import React, { useEffect, useState } from "react";
import { CalendarRange, Pencil, Trash2, Plus } from "lucide-react";
import "../Dashboard/OverviewPage.css";
import "../Students/StudentsPage.css";
import "../../../components/common/styles/controls.css";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import CourseSectionFormModal from "./CourseSectionFormModal";
import { useToast } from "../../../context/ToastContext";
import {
  SECTION_TYPES,
  createCourseSection,
  deleteCourseSection,
  fetchCourseSections,
  updateCourseSection,
} from "../../../services/admin/courseSectionService";
import { fetchCourses } from "../../../services/admin/courseService";
import { fetchTeachingStaff } from "../../../services/admin/teachingStaffService";

const typeLabel = (value) => SECTION_TYPES.find((t) => t.value === value)?.label.split(" (")[0] || value;

export default function CourseSectionsPage() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [courses, setCourses] = useState([]);
  const [staff, setStaff] = useState([]);
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
      setRows(await fetchCourseSections());
    } catch (err) {
      setError(err.message || "تعذّر تحميل شعب المقررات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses()
      .then((list) => setCourses(Array.isArray(list) ? list : []))
      .catch(() => setCourses([]));
    fetchTeachingStaff()
      .then((list) => setStaff(Array.isArray(list) ? list : []))
      .catch(() => setStaff([]));
    load();
  }, []);

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      if (editing) {
        await updateCourseSection(editing.id, values);
        toast.success("تم تحديث الشعبة");
      } else {
        await createCourseSection(values);
        toast.success("تم إضافة الشعبة");
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
      await deleteCourseSection(deleteTarget.id);
      toast.success("تم حذف الشعبة");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.message || "تعذّر حذف الشعبة");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="page-toolbar">
        <div>
          <h1>شعب المقررات</h1>
          <p>شعبة نظرية تُسند لدكتور، وشعبة عملية أو مشروع تُسند لمعيد مخبري (يتحقق منها الباك-إند تلقائياً)</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus size={18} /> إضافة شعبة
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
            <p>لا توجد شعب بعد.</p>
          </div>
        ) : (
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>المقرر</th>
                  <th>اسم الشعبة</th>
                  <th>المدرّس</th>
                  <th>النوع</th>
                  <th>السعة</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => (
                  <tr key={s.id}>
                    <td>
                      {s.course?.course_code} — {s.course?.name}
                    </td>
                    <td>{s.section_name}</td>
                    <td>
                      {s.instructor?.user?.first_name} {s.instructor?.user?.last_name}
                    </td>
                    <td>
                      <span className="status pending">{typeLabel(s.section_type)}</span>
                    </td>
                    <td>{s.capacity}</td>
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
        <CourseSectionFormModal
          section={editing}
          courses={courses}
          staff={staff}
          saving={saving}
          onSubmit={handleSubmit}
          onClose={() => setFormOpen(false)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`سيتم حذف شعبة "${deleteTarget.section_name}" بشكل نهائي.`}
          loading={deleting}
          onConfirm={confirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
