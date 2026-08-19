import React, { useEffect, useState } from "react";
import { Gavel, ShieldAlert } from "lucide-react";
import "../../Admin/Dashboard/OverviewPage.css";
import "../../Admin/Students/StudentsPage.css";
import "../../../components/common/styles/controls.css";
import "../examinations.css";
import Pagination from "../../../components/common/Pagination";
import ResolveObjectionModal from "./ResolveObjectionModal";
import { useToast } from "../../../context/ToastContext";
import { fetchCourses } from "../../../services/admin/courseService";
import {
  OBJECTION_STATUS_LABELS,
  fetchGradeObjections,
  resolveGradeObjection,
} from "../../../services/examinations/gradeObjectionService";

const STATUS_FILTERS = [
  { value: "", label: "الكل" },
  { value: "pending", label: "قيد المراجعة" },
  { value: "confirmed", label: "مؤكَّدة" },
  { value: "adjusted", label: "مُعدَّلة" },
];

export default function GradeAppealsPage() {
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [courseFilter, setCourseFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [page, setPage] = useState(1);

  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeObjection, setActiveObjection] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCourses()
      .then((list) => setCourses(Array.isArray(list) ? list : []))
      .catch(() => setCourses([]));
  }, []);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await fetchGradeObjections({
        course_id: courseFilter || undefined,
        status: statusFilter || undefined,
        page,
      });
      setRows(Array.isArray(result?.items) ? result.items : []);
      setPagination(result?.pagination || { current_page: 1, last_page: 1 });
    } catch (err) {
      setError(err.message || "تعذّر تحميل قائمة الاعتراضات");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [courseFilter, statusFilter, page]);

  const handleResolve = async (id, payload) => {
    setSaving(true);
    try {
      await resolveGradeObjection(id, payload);
      toast.success(
        payload.decision === "adjusted" ? "تم تعديل العلامة وإرسال النتيجة الجديدة" : "تم تأكيد العلامة الحالية"
      );
      setActiveObjection(null);
      load();
    } catch (err) {
      toast.error(err.message || "تعذّر حفظ قرار المراجعة");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-toolbar">
        <div>
          <h1>الاعتراضات على العلامات</h1>
        </div>
      </div>

      <div className="exam-course-picker" style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <div className="form-field" style={{ minWidth: 220 }}>
          <label>المادة</label>
          <select value={courseFilter} onChange={(e) => { setPage(1); setCourseFilter(e.target.value); }}>
            <option value="">كل المواد</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.course_code} — {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field" style={{ minWidth: 180 }}>
          <label>الحالة</label>
          <select value={statusFilter} onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}>
            {STATUS_FILTERS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="overview-error">{error}</div>}

      <div className="dashboard-table-card">
        {loading ? (
          <div className="overview-loading">
            <span className="spinner dark" /> جارِ التحميل...
          </div>
        ) : rows.length === 0 ? (
          <div className="empty-state">
            <ShieldAlert size={30} />
            <p>لا توجد اعتراضات مطابقة.</p>
          </div>
        ) : (
          <>
            <div className="responsive-table">
              <table>
                <thead>
                  <tr>
                    <th>الطالب</th>
                    <th>المادة</th>
                    <th>المكوّن</th>
                    <th>العلامة الحالية</th>
                    <th>العلامة المطلوبة</th>
                    <th>الحالة</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((o) => (
                    <tr key={o.id}>
                      <td>
                        {o.student?.name}
                        <br />
                        <span style={{ fontSize: 12, color: "var(--muted)" }}>{o.student?.student_number}</span>
                      </td>
                      <td>{o.course?.course_code}</td>
                      <td>{o.grade_component?.name}</td>
                      <td>{o.current_grade ?? "—"}</td>
                      <td>{o.submitted_grade ?? "—"}</td>
                      <td>
                        <span
                          className={`status ${
                            o.status === "pending" ? "pending" : o.status === "adjusted" ? "success" : ""
                          }`}
                        >
                          {OBJECTION_STATUS_LABELS[o.status] || o.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-ghost" onClick={() => setActiveObjection(o)}>
                          <Gavel size={15} /> {o.status === "pending" ? "مراجعة" : "عرض"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination currentPage={pagination.current_page} lastPage={pagination.last_page} onChange={setPage} />
          </>
        )}
      </div>

      {activeObjection && (
        <ResolveObjectionModal
          objection={activeObjection}
          saving={saving}
          onResolve={handleResolve}
          onClose={() => setActiveObjection(null)}
        />
      )}
    </div>
  );
}
