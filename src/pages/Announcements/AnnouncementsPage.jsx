import React, { useEffect, useState } from "react";
import { Image as ImageIcon, Megaphone, Pencil, Plus, Trash2, Video } from "lucide-react";
import "../Admin/Dashboard/OverviewPage.css";
import "../Admin/Students/StudentsPage.css";
import "../../components/common/styles/controls.css";
import Pagination from "../../components/common/Pagination";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import AnnouncementFormModal from "./AnnouncementFormModal";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import {
  AUDIENCE_TYPE_LABELS,
  createAnnouncement,
  deleteAnnouncement,
  fetchAudienceOptions,
  fetchManagedAnnouncements,
  updateAnnouncement,
} from "../../services/announcements/announcementService";

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const isAdmin = (user?.roles || []).includes("admin");
  const toast = useToast();

  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 });
  const [audienceOptions, setAudienceOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async (targetPage = page) => {
    setLoading(true);
    setError("");
    try {
      const result = await fetchManagedAnnouncements(targetPage);
      setRows(Array.isArray(result?.items) ? result.items : []);
      setPagination(result?.pagination || { current_page: 1, last_page: 1 });
    } catch (err) {
      setError(err.message || "تعذّر تحميل الإعلانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudienceOptions()
      .then(setAudienceOptions)
      .catch(() => setAudienceOptions(null));
  }, []);

  useEffect(() => {
    load(page);
  }, [page]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (announcement) => {
    setEditing(announcement);
    setFormOpen(true);
  };

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      if (editing) {
        await updateAnnouncement(editing.id, values);
        toast.success("تم تحديث الإعلان");
      } else {
        await createAnnouncement(values);
        toast.success("تم نشر الإعلان بنجاح");
      }
      setFormOpen(false);
      load(page);
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
      await deleteAnnouncement(deleteTarget.id);
      toast.success("تم حذف الإعلان");
      setDeleteTarget(null);
      load(page);
    } catch (err) {
      toast.error(err.message || "تعذّر حذف الإعلان");
    } finally {
      setDeleting(false);
    }
  };

  const audienceLabel = (a) => {
    const type = a.audience?.type;
    if (!type) return "—";
    if (type === "all_my_students" || type === "all_students") return AUDIENCE_TYPE_LABELS[type];
    const count = a.audience?.ids?.length || 0;
    return `${AUDIENCE_TYPE_LABELS[type] || type} (${count})`;
  };

  return (
    <div>
      <div className="page-toolbar">
        <div>
          <h1>الإعلانات</h1>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} /> إعلان جديد
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
            <Megaphone size={30} />
            <p>لا توجد إعلانات بعد. ابدأ بنشر أول إعلان.</p>
          </div>
        ) : (
          <>
            <div className="responsive-table">
              <table>
                <thead>
                  <tr>
                    <th>العنوان</th>
                    <th>الوسائط</th>
                    <th>الفئة المستهدفة</th>
                    <th>عدد المستلمين</th>
                    {isAdmin && <th>الكاتب</th>}
                    <th>تاريخ النشر</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((a) => (
                    <tr key={a.id}>
                      <td>{a.title}</td>
                      <td>
                        {a.media_type === "image" && <ImageIcon size={16} />}
                        {a.media_type === "video" && <Video size={16} />}
                        {!a.media_type && "—"}
                      </td>
                      <td>{audienceLabel(a)}</td>
                      <td>{a.recipients_count ?? "—"}</td>
                      {isAdmin && <td>{a.author?.name || "—"}</td>}
                      <td dir="ltr" style={{ textAlign: "right" }}>
                        {a.published_at ? new Date(a.published_at).toLocaleDateString() : "—"}
                      </td>
                      <td>
                        <div className="row-actions">
                          <button className="btn btn-ghost btn-icon" onClick={() => openEdit(a)} aria-label="تعديل">
                            <Pencil size={16} />
                          </button>
                          <button
                            className="btn btn-ghost btn-icon danger-hover"
                            onClick={() => setDeleteTarget(a)}
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
            <Pagination currentPage={pagination.current_page} lastPage={pagination.last_page} onChange={setPage} />
          </>
        )}
      </div>

      {formOpen && (
        <AnnouncementFormModal
          announcement={editing}
          audienceOptions={audienceOptions}
          saving={saving}
          onSubmit={handleSubmit}
          onClose={() => setFormOpen(false)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`سيتم حذف الإعلان "${deleteTarget.title}" بشكل نهائي.`}
          loading={deleting}
          onConfirm={confirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
