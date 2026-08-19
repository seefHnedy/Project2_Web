import React, { useEffect, useState } from "react";
import { FileText, Trash2, Upload } from "lucide-react";
import "../../Admin/Dashboard/OverviewPage.css";
import "../../Admin/Students/StudentsPage.css";
import "../../../components/common/styles/controls.css";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import UploadMaterialModal from "./UploadMaterialModal";
import { useToast } from "../../../context/ToastContext";
import { fetchMyCourseSections } from "../../../services/instructor/myCourseSectionsService";
import {
  deleteCourseMaterial,
  fetchMaterialsForSection,
  uploadCourseMaterial,
} from "../../../services/instructor/courseMaterialService";

const SECTION_TYPE_LABELS = { theory: "نظري", practical: "عملي", project: "مشروع" };

export default function MyCourseSectionsPage() {
  const toast = useToast();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [materialsBySection, setMaterialsBySection] = useState({});
  const [expandedSection, setExpandedSection] = useState(null);

  const [uploadTarget, setUploadTarget] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchMyCourseSections()
      .then((list) => setSections(Array.isArray(list) ? list : []))
      .catch((err) => setError(err.message || "تعذّر تحميل الشعب"))
      .finally(() => setLoading(false));
  }, []);

  const loadMaterials = async (sectionId) => {
    try {
      const list = await fetchMaterialsForSection(sectionId);
      setMaterialsBySection((current) => ({ ...current, [sectionId]: Array.isArray(list) ? list : [] }));
    } catch (err) {
      toast.error(err.message || "تعذّر تحميل الملفات");
    }
  };

  const toggleSection = (sectionId) => {
    if (expandedSection === sectionId) {
      setExpandedSection(null);
      return;
    }
    setExpandedSection(sectionId);
    if (!materialsBySection[sectionId]) loadMaterials(sectionId);
  };

  const handleUpload = async (values) => {
    setUploading(true);
    try {
      await uploadCourseMaterial(values);
      toast.success("تم رفع الملف بنجاح");
      setUploadTarget(null);
     
      setExpandedSection(values.course_section_id);
      await loadMaterials(values.course_section_id);
    } catch (err) {
      toast.error(err.message || "تعذّر رفع الملف");
    } finally {
      setUploading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCourseMaterial(deleteTarget.material.id);
      toast.success("تم حذف الملف");
      setDeleteTarget(null);
      loadMaterials(deleteTarget.sectionId);
    } catch (err) {
      toast.error(err.message || "تعذّر حذف الملف");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="page-toolbar">
        <div>
          <h1>شعبي الدراسية</h1>
        </div>
      </div>

      {error && <div className="overview-error">{error}</div>}

      {loading ? (
        <div className="overview-loading"><span className="spinner dark" /> جارِ التحميل...</div>
      ) : sections.length === 0 ? (
        <div className="dashboard-table-card">
          <div className="empty-state">
            <FileText size={30} />
            <p>لا توجد شعب مسندة إليك حالياً.</p>
          </div>
        </div>
      ) : (
        sections.map((s) => (
          <div className="dashboard-table-card" key={s.id} style={{ marginBottom: 14 }}>
            <div className="page-toolbar" style={{ marginBottom: expandedSection === s.id ? 16 : 0 }}>
              <div style={{ cursor: "pointer" }} onClick={() => toggleSection(s.id)}>
                <h3 style={{ margin: 0 }}>
                  {s.course_code} — {s.course_name}
                </h3>
                <p style={{ margin: "4px 0 0" }}>
                  {SECTION_TYPE_LABELS[s.section_type] || s.section_type} — شعبة {s.section_number} — {s.semester?.name}
                </p>
              </div>
              <button className="btn btn-primary" onClick={() => setUploadTarget(s)}>
                <Upload size={16} /> رفع محاضرة
              </button>
            </div>

            {expandedSection === s.id && (
              <div className="responsive-table">
                {!materialsBySection[s.id] ? (
                  <div className="overview-loading"><span className="spinner dark" /> جارِ التحميل...</div>
                ) : materialsBySection[s.id].length === 0 ? (
                  <div className="empty-state">
                    <FileText size={24} />
                    <p>لا توجد ملفات مرفوعة بعد.</p>
                  </div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>العنوان</th>
                        <th>تاريخ الرفع</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {materialsBySection[s.id].map((m) => (
                        <tr key={m.id}>
                          <td>
                            <a href={m.file_url} target="_blank" rel="noreferrer">
                              {m.title}
                            </a>
                          </td>
                          <td dir="ltr" style={{ textAlign: "right" }}>
                            {m.created_at ? new Date(m.created_at).toLocaleDateString() : "—"}
                          </td>
                          <td>
                            <button
                              className="btn btn-ghost btn-icon danger-hover"
                              onClick={() => setDeleteTarget({ material: m, sectionId: s.id })}
                              aria-label="حذف"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        ))
      )}

      {uploadTarget && (
        <UploadMaterialModal
          section={uploadTarget}
          saving={uploading}
          onSubmit={handleUpload}
          onClose={() => setUploadTarget(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`سيتم حذف الملف "${deleteTarget.material.title}" بشكل نهائي.`}
          loading={deleting}
          onConfirm={confirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
