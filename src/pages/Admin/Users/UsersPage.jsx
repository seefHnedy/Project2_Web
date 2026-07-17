import React, { useEffect, useState } from "react";
import { UsersRound } from "lucide-react";
import "../Dashboard/OverviewPage.css";
import "../Students/StudentsPage.css";
import { fetchAllUsers } from "../../../services/admin/userAdminService";

export default function UsersPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAllUsers()
      .then((list) => setRows(Array.isArray(list) ? list : []))
      .catch((err) => setError(err.message || "تعذّر تحميل المستخدمين"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-toolbar">
        <div>
          <h1>المستخدمون</h1>
          <p>جميع حسابات المستخدمين بالنظام — عرض فقط حالياً (الإضافة/التعديل غير مُفعّلة بعد بالباك-إند)</p>
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
            <UsersRound size={30} />
            <p>لا يوجد مستخدمون.</p>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
