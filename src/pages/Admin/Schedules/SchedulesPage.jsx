import React, { useEffect, useState } from "react";
import { CalendarRange, Pencil, Plus, Trash2 } from "lucide-react";
import "../Dashboard/OverviewPage.css";
import "../Students/StudentsPage.css";
import "../../../components/common/styles/controls.css";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import ScheduleFormModal from "./ScheduleFormModal";
import { useToast } from "../../../context/ToastContext";
import {
  DAY_LABELS,
  createSchedule,
  deleteSchedule,
  fetchSchedules,
  updateSchedule,
} from "../../../services/admin/scheduleService";
import { fetchCourseSections } from "../../../services/admin/courseSectionService";
import { fetchClassrooms } from "../../../services/admin/classroomService";

export default function SchedulesPage() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [sections, setSections] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
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
      setRows(await fetchSchedules());
    } catch (err) {
      setError(err.message || "تعذّر تحميل الجدول الزمني");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseSections()
      .then((list) => setSections(Array.isArray(list) ? list : []))
      .catch(() => setSections([]));
    fetchClassrooms()
      .then((list) => setClassrooms(Array.isArray(list) ? list : []))
      .catch(() => setClassrooms([]));
    load();
  }, []);

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      if (editing) {
        await updateSchedule(editing.id, values);
        toast.success("تم تحديث الموعد");
      } else {
        await createSchedule(values);
        toast.success("تم إضافة الموعد للجدول");
      }
      setFormOpen(false);
      load();
    } catch (err) {
      toast.error(err.message || "فشلت العملية — تأكد من عدم وجود تعارض بالمواعيد");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteSchedule(deleteTarget.id);
      toast.success("تم حذف الموعد");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.message || "تعذّر حذف الموعد");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="page-toolbar">
        <div>
          <h1>الجدول الزمني للشعب</h1>
          <p>الباك-إند يمنع تلقائياً تعارض القاعة أو المدرّس أو الشعبة بنفس الوقت</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus size={18} /> إضافة موعد
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
            <p>لا توجد مواعيد بعد.</p>
          </div>
        ) : (
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>الشعبة</th>
                  <th>القاعة</th>
                  <th>اليوم</th>
                  <th>الوقت</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => (
                  <tr key={s.id}>
                    <td>
                      {s.course_section?.course?.course_code} — {s.course_section?.section_name}
                    </td>
                    <td>{s.classroom?.name}</td>
                    <td>{DAY_LABELS[s.day_of_week] || s.day_of_week}</td>
                    <td dir="ltr" style={{ textAlign: "right" }}>
                      {s.start_time} – {s.end_time}
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
        <ScheduleFormModal
          schedule={editing}
          sections={sections}
          classrooms={classrooms}
          saving={saving}
          onSubmit={handleSubmit}
          onClose={() => setFormOpen(false)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          message="سيتم حذف هذا الموعد من الجدول الزمني بشكل نهائي."
          loading={deleting}
          onConfirm={confirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
