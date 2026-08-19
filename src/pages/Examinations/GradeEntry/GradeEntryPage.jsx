import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, GraduationCap, Save, ShieldCheck } from "lucide-react";
import "../../Admin/Dashboard/OverviewPage.css";
import "../../Admin/Students/StudentsPage.css";
import "../../../components/common/styles/controls.css";
import "../examinations.css";
import { useToast } from "../../../context/ToastContext";
import { fetchCourses } from "../../../services/admin/courseService";
import { SECTION_TYPE_LABELS, getApplicableSectionTypes } from "../../../services/examinations/gradeComponentService";
import { fetchStudentGrades, saveStudentGrades, validateGradeComponents } from "../../../services/examinations/studentGradeService";

function componentIdOf(grade) {
  if (grade?.grade_component_id && typeof grade.grade_component_id === "object") {
    return grade.grade_component_id.id;
  }
  return grade?.grade_component_id;
}

export default function GradeEntryPage() {
  const toast = useToast();

  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [courseId, setCourseId] = useState("");

  const [checkState, setCheckState] = useState({ status: "idle", message: "" });
  const [sectionType, setSectionType] = useState("");

  const [gradeComponents, setGradeComponents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [gradesInput, setGradesInput] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveErrors, setSaveErrors] = useState([]);

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

  useEffect(() => {
    setCheckState({ status: "idle", message: "" });
    setSectionType("");
    setGradeComponents([]);
    setStudents([]);
    setGradesInput({});
    setSaveErrors([]);
  }, [courseId]);

  const runValidation = async () => {
    if (!courseId) return;
    setCheckState({ status: "checking", message: "" });
    try {
      await validateGradeComponents(courseId);
      setCheckState({ status: "ok", message: "المجموع مطابق (100) — يمكنك متابعة إدخال العلامات." });
    } catch (err) {
      setCheckState({ status: "bad", message: err.message || "لا يمكن إدخال العلامات قبل ضبط مكوّنات العلامة لتساوي 100." });
    }
  };

  const loadStudents = async (type) => {
    setLoadingStudents(true);
    setLoadError("");
    setSaveErrors([]);
    try {
      const result = await fetchStudentGrades(courseId, type);
      const components = Array.isArray(result?.grade_components) ? result.grade_components : [];
      const studentsList = Array.isArray(result?.students) ? result.students : [];
      setGradeComponents(components);
      setStudents(studentsList);

      const initial = {};
      studentsList.forEach((s) => {
        initial[s.student_course_id] = {};
        (s.grades || []).forEach((g) => {
          const compId = componentIdOf(g);
          if (compId != null && g.grade != null) {
            initial[s.student_course_id][compId] = String(g.grade);
          }
        });
      });
      setGradesInput(initial);
    } catch (err) {
      setLoadError(err.message || "تعذّر تحميل قائمة الطلاب");
      setGradeComponents([]);
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const chooseSectionType = (type) => {
    setSectionType(type);
    loadStudents(type);
  };

  const setGradeValue = (studentCourseId, componentId, value) => {
    setGradesInput((current) => ({
      ...current,
      [studentCourseId]: { ...(current[studentCourseId] || {}), [componentId]: value },
    }));
  };

  const isInvalid = (value, maxGrade) => {
    if (value === "" || value == null) return false;
    const num = Number(value);
    if (Number.isNaN(num) || num < 0) return true;
    if (maxGrade != null && num > Number(maxGrade)) return true;
    return false;
  };

  const rowTotal = (studentCourseId) => {
    const values = gradesInput[studentCourseId] || {};
    return gradeComponents.reduce((sum, comp) => {
      const v = values[comp.id];
      const num = Number(v);
      return sum + (v !== "" && v != null && !Number.isNaN(num) ? num : 0);
    }, 0);
  };

  const hasAnyInvalid = useMemo(() => {
    return students.some((s) =>
      gradeComponents.some((comp) => isInvalid((gradesInput[s.student_course_id] || {})[comp.id], comp.max_grade))
    );
  }, [students, gradeComponents, gradesInput]);

  const handleSaveAll = async () => {
    if (hasAnyInvalid) {
      toast.error("يوجد علامات غير صالحة (سالبة أو أكبر من العلامة العظمى) — الرجاء تصحيحها أولاً");
      return;
    }

    const payloadStudents = students
      .map((s) => {
        const values = gradesInput[s.student_course_id] || {};
        const grades = gradeComponents
          .filter((comp) => values[comp.id] !== "" && values[comp.id] != null)
          .map((comp) => ({ grade_component_id: comp.id, grade: Number(values[comp.id]) }));
        return grades.length ? { student_course_id: s.student_course_id, grades } : null;
      })
      .filter(Boolean);

    if (payloadStudents.length === 0) {
      toast.error("لم تُدخل أي علامة بعد");
      return;
    }

    setSaving(true);
    setSaveErrors([]);
    try {
      const result = await saveStudentGrades({
        course_id: Number(courseId),
        section_type: sectionType,
        students: payloadStudents,
      });
      const errors = Array.isArray(result?.errors) ? result.errors : [];
      setSaveErrors(errors);
      if (errors.length === 0) {
        toast.success("تم حفظ جميع العلامات بنجاح");
      } else {
        toast.error(`تم الحفظ مع وجود ${errors.length} خطأ — راجع التفاصيل أدناه`);
      }
      loadStudents(sectionType);
    } catch (err) {
      toast.error(err.message || "تعذّر حفظ العلامات");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-toolbar">
        <div>
          <h1>إدخال العلامات</h1>
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
            <GraduationCap size={30} />
            <p>اختر مادة أولاً.</p>
          </div>
        </div>
      ) : (
        <>
          <div className={`total-banner ${checkState.status === "ok" ? "ok" : checkState.status === "bad" ? "bad" : "neutral"}`}>
            <span>
              {checkState.status === "idle" && "اضغط زر التحقق للتأكد من أن مجموع مكوّنات العلامة لهذه المادة = 100 قبل إدخال العلامات."}
              {checkState.status === "checking" && "جارِ التحقق..."}
              {checkState.status !== "idle" && checkState.status !== "checking" && checkState.message}
            </span>
            <button type="button" className="btn btn-ghost" onClick={runValidation} disabled={checkState.status === "checking"}>
              {checkState.status === "checking" ? <span className="spinner" /> : <ShieldCheck size={16} />}
              التحقق من المجموع
            </button>
          </div>

          {checkState.status === "ok" && (
            <>
              <div className="section-tabs">
                {applicableTypes.map((type) => (
                  <button key={type} type="button" className={`section-tab ${sectionType === type ? "active" : ""}`} onClick={() => chooseSectionType(type)}>
                    {SECTION_TYPE_LABELS[type] || type}
                  </button>
                ))}
              </div>

              {loadError && <div className="overview-error">{loadError}</div>}

              {sectionType && (
                <div className="dashboard-table-card">
                  {loadingStudents ? (
                    <div className="overview-loading"><span className="spinner dark" /> جارِ التحميل...</div>
                  ) : students.length === 0 ? (
                    <div className="empty-state">
                      <GraduationCap size={30} />
                      <p>لا يوجد طلاب مسجلون بهذه المادة ضمن هذا القسم.</p>
                    </div>
                  ) : gradeComponents.length === 0 ? (
                    <div className="empty-state">
                      <AlertTriangle size={30} />
                      <p>لا توجد مكوّنات علامة مُعرّفة لهذا القسم بعد. أضفها أولاً من شاشة "مكوّنات العلامة".</p>
                    </div>
                  ) : (
                    <>
                      <div className="entry-toolbar">
                        <strong>عدد الطلاب: {students.length}</strong>
                        <button className="btn btn-primary" onClick={handleSaveAll} disabled={saving}>
                          {saving ? <span className="spinner" /> : <Save size={18} />}
                          حفظ كل العلامات
                        </button>
                      </div>

                      <div className="grades-table-wrap">
                        <table className="grades-table">
                          <thead>
                            <tr>
                              <th>الطالب</th>
                              {gradeComponents.slice().sort((a, b) => a.display_order - b.display_order).map((comp) => (
                                <th key={comp.id}>
                                  {comp.name}
                                  <br />
                                  <span style={{ fontWeight: 400 }}>({comp.max_grade})</span>
                                </th>
                              ))}
                              <th>المجموع</th>
                            </tr>
                          </thead>
                          <tbody>
                            {students.map((s) => (
                              <tr key={s.student_course_id}>
                                <td>{s.student_name}</td>
                                {gradeComponents.slice().sort((a, b) => a.display_order - b.display_order).map((comp) => {
                                  const value = (gradesInput[s.student_course_id] || {})[comp.id] ?? "";
                                  const invalid = isInvalid(value, comp.max_grade);
                                  return (
                                    <td key={comp.id}>
                                      <input
                                        className={`grade-input ${invalid ? "invalid" : ""}`}
                                        type="number"
                                        min="0"
                                        max={comp.max_grade}
                                        value={value}
                                        onChange={(e) => setGradeValue(s.student_course_id, comp.id, e.target.value)}
                                        disabled={saving}
                                      />
                                    </td>
                                  );
                                })}
                                <td className="row-total">{rowTotal(s.student_course_id)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {saveErrors.length > 0 && (
                        <div className="save-errors-panel">
                          <h4>حدثت أخطاء أثناء حفظ بعض الطلاب:</h4>
                          <ul>
                            {saveErrors.map((e, idx) => (
                              <li key={idx}>{e.student_name || `طالب #${e.student_course_id}`}: {e.error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
