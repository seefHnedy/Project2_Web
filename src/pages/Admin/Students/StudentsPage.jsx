import React, { useEffect, useState } from "react";
import { GraduationCap, Pencil, Plus, Trash2, Wifi } from "lucide-react";
import "../Dashboard/OverviewPage.css";
import "./StudentsPage.css";
import "../../../components/common/styles/controls.css";
import Pagination from "../../../components/common/Pagination";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import StudentFormModal from "./StudentFormModal";
import { useToast } from "../../../context/ToastContext";
import {
  createStudent,
  deleteStudent,
  fetchStudents,
  updateStudent,
} from "../../../services/admin/studentService";
import { fetchDepartments } from "../../../services/admin/departmentService";

export default function StudentsPage() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [pageData, setPageData] = useState({ data: [], current_page: 1, last_page: 1, total: 0 });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadStudents = async (targetPage = page) => {
    setLoading(true);
    setError("");
    try {
      const result = await fetchStudents(targetPage);
      setPageData(result);
    } catch (err) {
      setError(err.message || "تعذّر تحميل قائمة الطلاب");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments()
      .then((list) => setDepartments(Array.isArray(list) ? list : []))
      .catch(() => setDepartments([]));
  }, []);

  useEffect(() => {
    loadStudents(page);
  }, [page]);

  const openCreate = () => {
    setEditingStudent(null);
    setFormOpen(true);
  };

  const openEdit = (student) => {
    setEditingStudent(student);
    setFormOpen(true);
  };

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      if (editingStudent) {
        const { password, ...rest } = values;
        await updateStudent(editingStudent.id, rest);
        toast.success("تم تحديث بيانات الطالب");
      } else {
        await createStudent(values);
        toast.success("تم إضافة الطالب بنجاح");
      }
      setFormOpen(false);
      loadStudents(page);
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
      await deleteStudent(deleteTarget.id);
      toast.success("تم حذف الطالب");
      setDeleteTarget(null);
      const isLastRowOnPage = (pageData?.data?.length || 0) === 1 && page > 1;
      loadStudents(isLastRowOnPage ? page - 1 : page);
      if (isLastRowOnPage) setPage(page - 1);
    } catch (err) {
      toast.error(err.message || "تعذّر حذف الطالب");
    } finally {
      setDeleting(false);
    }
  };

  const studentRows = Array.isArray(pageData?.data) ? pageData.data : [];

  return (
    <div>
      <div className="page-toolbar">
        <div>
          <h1>إدارة الطلاب</h1>
          <p>إضافة الطلاب، ربطهم بالأقسام، وإدارة بطاقات NFC الخاصة بالحضور</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} /> إضافة طالب
        </button>
      </div>

      {error && <div className="overview-error">{error}</div>}

      <div className="dashboard-table-card">
        {loading ? (
          <div className="overview-loading">
            <span className="spinner dark" /> جارِ التحميل...
          </div>
        ) : studentRows.length === 0 ? (
          <div className="empty-state">
            <GraduationCap size={30} />
            <p>لا يوجد طلاب مطابقون بعد. ابدأ بإضافة أول طالب.</p>
          </div>
        ) : (
          <>
            <div className="responsive-table">
              <table>
                <thead>
                  <tr>
                    <th>الاسم</th>
                    <th>الرقم الجامعي</th>
                    <th>البريد الإلكتروني</th>
                    <th>القسم</th>
                    <th>NFC</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {studentRows.map((s) => (
                    <tr key={s.id}>
                      <td>
                        {s.user?.first_name} {s.user?.last_name}
                      </td>
                      <td>{s.student_number}</td>
                      <td dir="ltr" style={{ textAlign: "right" }}>
                        {s.user?.email}
                      </td>
                      <td>{s.department?.name || "—"}</td>
                      <td>
                        <span className={`status ${s.nfc_uid ? "success" : "pending"}`}>
                          <Wifi size={12} style={{ marginInlineEnd: 4 }} />
                          {s.nfc_uid ? "مفعّلة" : "غير مفعّلة"}
                        </span>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button className="btn btn-ghost btn-icon" onClick={() => openEdit(s)} aria-label="تعديل">
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
            <Pagination currentPage={pageData.current_page} lastPage={pageData.last_page} onChange={setPage} />
          </>
        )}
      </div>

      {formOpen && (
        <StudentFormModal
          student={editingStudent}
          departments={departments}
          saving={saving}
          onSubmit={handleSubmit}
          onClose={() => setFormOpen(false)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`سيتم حذف الطالب "${deleteTarget.user?.first_name} ${deleteTarget.user?.last_name}" وكل بياناته المرتبطة بشكل نهائي.`}
          loading={deleting}
          onConfirm={confirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
