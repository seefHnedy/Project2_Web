import React, { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, UsersRound } from "lucide-react";
import "../Dashboard/OverviewPage.css";
import "../Students/StudentsPage.css";
import "../../../components/common/styles/controls.css";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import UserFormModal from "./UserFormModal";
import { useToast } from "../../../context/ToastContext";
import {
  createUser,
  deleteUser,
  fetchAllUsers,
  fetchRoles,
  updateUser,
} from "../../../services/admin/userAdminService";

export default function UsersPage() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const list = await fetchAllUsers();
      setRows(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.message || "تعذّر تحميل المستخدمين");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    fetchRoles()
      .then((list) => setRoles(Array.isArray(list) ? list : []))
      .catch(() => setRoles([]));
  }, []);

  const openCreate = () => {
    setEditingUser(null);
    setFormOpen(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setFormOpen(true);
  };

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      if (editingUser) {
        await updateUser(editingUser.id, values);
        toast.success("تم تحديث بيانات المستخدم");
      } else {
        await createUser(values);
        toast.success("تم إضافة المستخدم بنجاح");
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
      await deleteUser(deleteTarget.id);
      toast.success("تم حذف المستخدم");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.message || "تعذّر حذف المستخدم");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="page-toolbar">
        <div>
          <h1>المستخدمون</h1>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} /> إضافة مستخدم
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
            <UsersRound size={30} />
            <p>لا يوجد مستخدمون بعد. أضف أول مستخدم.</p>
          </div>
        ) : (
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>اسم المستخدم</th>
                  <th>البريد الإلكتروني</th>
                  <th>الهاتف</th>
                  <th>الدور</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.id}>
                    <td>
                      {u.first_name} {u.last_name}
                    </td>
                    <td dir="ltr" style={{ textAlign: "right" }}>
                      {u.username}
                    </td>
                    <td dir="ltr" style={{ textAlign: "right" }}>
                      {u.email}
                    </td>
                    <td dir="ltr" style={{ textAlign: "right" }}>
                      {u.phone || "—"}
                    </td>
                    <td>
                      {(u.roles || []).map((r) => (
                        <span key={r} className="status pending" style={{ marginInlineEnd: 4 }}>
                          {r}
                        </span>
                      ))}
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className="btn btn-ghost btn-icon" onClick={() => openEdit(u)} aria-label="تعديل">
                          <Pencil size={16} />
                        </button>
                        <button
                          className="btn btn-ghost btn-icon danger-hover"
                          onClick={() => setDeleteTarget(u)}
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
        <UserFormModal
          user={editingUser}
          roles={roles}
          saving={saving}
          onSubmit={handleSubmit}
          onClose={() => setFormOpen(false)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`سيتم حذف المستخدم "${deleteTarget.first_name} ${deleteTarget.last_name}" بشكل نهائي.`}
          loading={deleting}
          onConfirm={confirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
