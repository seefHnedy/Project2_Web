import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Banknote,
  Building2,
  CalendarRange,
  DoorOpen,
  GraduationCap,
  Settings,
  ShieldCheck,
  Users,
  UsersRound,
} from "lucide-react";
import "./OverviewPage.css";
import { useAuth } from "../../../context/AuthContext";
import { fetchStudents } from "../../../services/admin/studentService";
import { fetchDepartments } from "../../../services/admin/departmentService";
import { fetchCourses } from "../../../services/admin/courseService";
import { fetchCourseSections } from "../../../services/admin/courseSectionService";
import { fetchTeachingStaff } from "../../../services/admin/teachingStaffService";

const QUICK_LINKS = [
  { to: "/dashboard/classrooms", label: "القاعات", icon: DoorOpen },
  { to: "/dashboard/semesters", label: "الفصول الدراسية", icon: CalendarRange },
  { to: "/dashboard/schedules", label: "الجدول الزمني", icon: CalendarRange },
  { to: "/dashboard/payments", label: "الدفعات المالية", icon: Banknote },
  { to: "/dashboard/users", label: "المستخدمون", icon: UsersRound },
  { to: "/dashboard/settings", label: "إعدادات النظام", icon: Settings },
];

export default function OverviewPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    students: null,
    departments: null,
    courses: null,
    sections: null,
    staff: null,
  });
  const [recentStudents, setRecentStudents] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const [studentsPage, departments, courses, sections, staff] = await Promise.all([
          fetchStudents(1),
          fetchDepartments(),
          fetchCourses(),
          fetchCourseSections(),
          fetchTeachingStaff(),
        ]);
        if (cancelled) return;

        setStats({
          students: studentsPage?.total ?? studentsPage?.data?.length ?? 0,
          departments: Array.isArray(departments) ? departments.length : 0,
          courses: Array.isArray(courses) ? courses.length : 0,
          sections: Array.isArray(sections) ? sections.length : 0,
          staff: Array.isArray(staff) ? staff.length : 0,
        });
        setRecentStudents((studentsPage?.data || []).slice(0, 5));
      } catch (err) {
        if (!cancelled) setError(err.message || "تعذّر تحميل البيانات");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <div className="overview-header">
        <span className="dashboard-badge">
          <ShieldCheck size={14} /> لوحة التحكم
        </span>
        <h1>
          أهلاً بك، {user?.first_name} {user?.last_name}
        </h1>
        <p>
          نظرة شاملة على الطلاب، الهيئة التدريسية، والبنية الأكاديمية الكاملة في نظام{" "}
          <strong>Unify</strong>.
        </p>
      </div>

      {error && <div className="overview-error">{error}</div>}

      <div className="stats-grid">
        <StatCard
          icon={<GraduationCap size={22} />}
          label="إجمالي الطلاب"
          value={loading ? null : stats.students}
          to="/dashboard/students"
        />
        <StatCard
          icon={<Building2 size={22} />}
          label="الأقسام الأكاديمية"
          value={loading ? null : stats.departments}
          to="/dashboard/departments"
        />
        <StatCard
          icon={<GraduationCap size={22} />}
          label="المقررات الدراسية"
          value={loading ? null : stats.courses}
          to="/dashboard/courses"
        />
        <StatCard
          icon={<CalendarRange size={22} />}
          label="شعب المقررات"
          value={loading ? null : stats.sections}
          to="/dashboard/course-sections"
        />
        <StatCard
          icon={<Users size={22} />}
          label="الهيئة التدريسية"
          value={loading ? null : stats.staff}
          to="/dashboard/teaching-staff"
        />
      </div>

      <div className="quick-links">
        {QUICK_LINKS.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} className="quick-link-card">
            <Icon size={19} />
            <span>{label}</span>
          </Link>
        ))}
      </div>

      <div className="dashboard-table-card">
        <div className="table-header">
          <h2>أحدث الطلاب المسجّلين</h2>
          <Link to="/dashboard/students" className="link-button">
            عرض الكل
          </Link>
        </div>

        {loading ? (
          <div className="overview-loading">
            <span className="spinner dark" /> جارِ التحميل...
          </div>
        ) : recentStudents.length === 0 ? (
          <div className="empty-state">
            <GraduationCap size={30} />
            <p>لا يوجد طلاب مسجّلون بعد</p>
          </div>
        ) : (
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>الرقم الجامعي</th>
                  <th>القسم</th>
                  <th>NFC</th>
                </tr>
              </thead>
              <tbody>
                {recentStudents.map((s) => (
                  <tr key={s.id}>
                    <td>
                      {s.user?.first_name} {s.user?.last_name}
                    </td>
                    <td>{s.student_number}</td>
                    <td>{s.department?.name || "—"}</td>
                    <td>
                      <span className={`status ${s.nfc_uid ? "success" : "pending"}`}>
                        {s.nfc_uid ? "مفعّلة" : "غير مفعّلة"}
                      </span>
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

function StatCard({ icon, label, value, to }) {
  const content = (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div>
        <h2>{value === null || value === undefined ? <span className="skeleton-line" /> : value}</h2>
        <p>{label}</p>
      </div>
    </div>
  );
  return to ? (
    <Link to={to} className="stat-card-link">
      {content}
    </Link>
  ) : (
    content
  );
}
