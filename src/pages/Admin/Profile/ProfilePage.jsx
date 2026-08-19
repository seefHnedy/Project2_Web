import React from "react";
import { Mail, Phone, ShieldCheck, UserRound } from "lucide-react";
import "../Dashboard/OverviewPage.css";
import "./ProfilePage.css";
import { useAuth } from "../../../context/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div>
      <div className="overview-header">
        <span className="dashboard-badge">
          <ShieldCheck size={14} /> بيانات الحساب
        </span>
        <h1>حسابي</h1>
      </div>

      <div className="profile-card">
        <div className="profile-avatar">
          {(user?.first_name?.[0] || "") + (user?.last_name?.[0] || "")}
        </div>
        <div className="profile-details">
          <h2>
            {user?.first_name} {user?.last_name}
          </h2>
          <span className="profile-username">@{user?.username}</span>

          <div className="profile-grid">
            <div className="profile-item">
              <Mail size={17} />
              <div>
                <label>البريد الإلكتروني</label>
                <span dir="ltr">{user?.email || "—"}</span>
              </div>
            </div>
            <div className="profile-item">
              <Phone size={17} />
              <div>
                <label>رقم الهاتف</label>
                <span dir="ltr">{user?.phone || "غير محدد"}</span>
              </div>
            </div>
            <div className="profile-item">
              <UserRound size={17} />
              <div>
                <label>المعرّف</label>
                <span>#{user?.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
