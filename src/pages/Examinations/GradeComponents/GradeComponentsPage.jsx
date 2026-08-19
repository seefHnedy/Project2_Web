import React, { useEffect, useMemo, useState } from "react";
import { ClipboardList, Pencil, Plus, Trash2 } from "lucide-react";
import "../../Admin/Dashboard/OverviewPage.css";
import "../../Admin/Students/StudentsPage.css";
import "../../../components/common/styles/controls.css";
import "../examinations.css";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import GradeComponentFormModal from "./GradeComponentFormModal";
import { useToast } from "../../../context/ToastContext";
import { fetchCourses } from "../../../services/admin/courseService";
import {
  SECTION_TYPE_LABELS,
  createGradeComponent,
  deleteGradeComponent,
  fetchGradeComponents,
  getApplicableSectionTypes,
  updateGradeComponent,
} from "../../../services/examinations/gradeComponentService";

export default function GradeComponentsPage() {
  const toast = useToast();

  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [courseId, setCourseId] = useState("");

  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCourses()
      .then((list) => setCourses(Array.isArray(list) ? list : []))
      .catch(() => setCourses([]))
      .finally(() => setCoursesLoading(false));
  }, []);

  const selectedCourse = useMemo(
    () => courses.find((c) => String(c.id) === String(courseId)) || null,
    [courses, courseId]
  );

  const applicableTypes = useMemo(
    () => (selectedCourse ? getApplicableSectionTypes(selectedCourse) : []),
    [selectedCourse]
  );

  const loadComponents = async (cId) => {
    if (!cId) return;
    setLoading(true);
    setError("");
    try {
      const list = await fetchGradeComponents(cId);
      setComponents(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.message || "تعذّر تحميل مكوّنات العلامة");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setComponents([]);
    if (courseId && applicableTypes.length) {
      setActiveTab(applicableTypes[0]);
      loadComponents(courseId);
    } else {
      setActiveTab("");
    }
  }, [courseId]);

  const tabComponents = useMemo(
    () => components.filter((c) => c.section_type === activeTab).sort((a, b) => a.display_order - b.display_order),
    [components, activeTab]
  );

  const subtotalFor = (type) =>
    components.filter((c) => c.section_type === type).reduce((sum, c) => sum + Number(c.max_grade || 0), 0);

  const overallTotal = components.reduce((sum, c) => sum + Number(c.max_grade || 0), 0);

  const openCreate = () => {
    setEditingComponent(null);
    setFormOpen(true);
  };

  const openEdit = (component) => {
    setEditingComponent(component);
    setFormOpen(true);
  };

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      if (editingComponent) {
        await updateGradeComponent(editingComponent.id, values);
        toast.success("تم تحديث المكوّن");
      } else {
        await createGradeComponent(courseId, values);
        toast.success("تم إضافة المكوّن بنجاح");
      }
      setFormOpen(false);
      loadComponents(courseId);
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
      await deleteGradeComponent(deleteTarget.id);
      toast.success("تم حذف المكوّن");
      setDeleteTarget(null);
      loadComponents(courseId);
    } catch (err) {
      toast.error(err.message || "تعذّر حذف المكوّن");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="page-toolbar">
        <div>
          <h1>مكوّنات العلامة</h1>
        </div>
      </div>

      <div className="exam-course-picker">
        <div className="form-field">
          <label>المادة</label>
          <select value={courseId} onChange={(e) => setCourseId(e.target.value)} disabled={coursesLoading}>
            <option value="">{coursesLoading ? "جارِ تحميل المواد..." : "اختر المادة"}</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.course_code} — {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!courseId ? (
        <div className="dashboard-table-card">
          <div className="empty-state">
            <ClipboardList size={30} />
            <p>اختر مادة أولاً لعرض/إدارة مكوّنات العلامة الخاصة بها.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="total-banner neutral">
            <span>
              المجموع الكلي لكل مكوّنات المادة حالياً: <strong>{overallTotal}</strong> / 100
            </span>
          </div>

          <div className="section-tabs">
            {applicableTypes.map((type) => (
              <button key={type} type="button" className={`section-tab ${activeTab === type ? "active" : ""}`} onClick={() => setActiveTab(type)}>
                {SECTION_TYPE_LABELS[type] || type}
                <span className="tab-sum">({subtotalFor(type)})</span>
              </button>
            ))}
          </div>

          <div className="page-toolbar">
            <div />
            <button className="btn btn-primary" onClick={openCreate}>
              <Plus size={18} /> إضافة مكوّن لـ{SECTION_TYPE_LABELS[activeTab] || activeTab}
            </button>
          </div>

          {error && <div className="overview-error">{error}</div>}

          <div className="dashboard-table-card">
            {loading ? (
              <div className="overview-loading"><span className="spinner dark" /> جارِ التحميل...</div>
            ) : tabComponents.length === 0 ? (
              <div className="empty-state">
                <ClipboardList size={30} />
                <p>لا توجد مكوّنات بعد لهذا القسم. أضف أول مكوّن.</p>
              </div>
            ) : (
              <div className="responsive-table">
                <table>
                  <thead>
                    <tr>
                      <th>الترتيب</th>
                      <th>اسم المكوّن</th>
                      <th>العلامة العظمى</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {tabComponents.map((c) => (
                      <tr key={c.id}>
                        <td>{c.display_order}</td>
                        <td>{c.name}</td>
                        <td>{c.max_grade}</td>
                        <td>
                          <div className="row-actions">
                            <button className="btn btn-ghost btn-icon" onClick={() => openEdit(c)} aria-label="تعديل">
                              <Pencil size={16} />
                            </button>
                            <button className="btn btn-ghost btn-icon danger-hover" onClick={() => setDeleteTarget(c)} aria-label="حذف">
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
        </>
      )}

      {formOpen && (
        <GradeComponentFormModal
          component={editingComponent}
          sectionType={activeTab}
          nextDisplayOrder={tabComponents.length + 1}
          saving={saving}
          onSubmit={handleSubmit}
          onClose={() => setFormOpen(false)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`سيتم حذف المكوّن "${deleteTarget.name}" بشكل نهائي.`}
          loading={deleting}
          onConfirm={confirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
