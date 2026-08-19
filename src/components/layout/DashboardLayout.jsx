import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Banknote,
  Building2,
  CalendarRange,
  ClipboardList,
  Coins,
  DoorOpen,
  FileText,
  Gavel,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  PencilLine,
  Settings,
  UserCircle2,
  Users,
  UsersRound,
  X,
} from "lucide-react";
import "./styles/DashboardLayout.css";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import NotificationBell from "../common/NotificationBell";
import { initFirebaseMessaging, teardownFirebaseMessaging } from "../../services/notifications/firebaseMessaging";

const ADMIN_NAV_GROUPS = [
  {
    label: "General",
    items: [{ to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true }],
  },
  {
    label: "People",
    items: [
      { to: "/dashboard/students", label: "Students", icon: GraduationCap },
      { to: "/dashboard/teaching-staff", label: "Teaching Staff", icon: Users },
      { to: "/dashboard/users", label: "Users", icon: UsersRound },
    ],
  },
  {
    label: "Academics",
    items: [
      { to: "/dashboard/departments", label: "Departments", icon: Building2 },
      { to: "/dashboard/courses", label: "Courses", icon: GraduationCap },
      { to: "/dashboard/course-sections", label: "Course Sections", icon: CalendarRange },
      { to: "/dashboard/classrooms", label: "Classrooms", icon: DoorOpen },
      { to: "/dashboard/semesters", label: "Semesters", icon: CalendarRange },
      { to: "/dashboard/schedules", label: "Schedules", icon: CalendarRange },
    ],
  },
  {
    label: "Finance",
    items: [
      { to: "/dashboard/payments", label: "Payments", icon: Banknote },
      { to: "/dashboard/hour-purchases", label: "شراء الساعات", icon: Coins },
    ],
  },
  {
    label: "Communication",
    items: [{ to: "/dashboard/announcements", label: "الإعلانات", icon: Megaphone }],
  },
  {
    label: "System",
    items: [
      { to: "/dashboard/settings", label: "Settings", icon: Settings },
      { to: "/dashboard/profile", label: "My Account", icon: UserCircle2 },
    ],
  },
];

const MINIMAL_NAV_GROUPS = [
  {
    label: "System",
    items: [{ to: "/dashboard/profile", label: "My Account", icon: UserCircle2 }],
  },
];

function resolveNavGroups(roles) {
  if (roles.includes("admin")) return ADMIN_NAV_GROUPS;

  if (roles.includes("Examinations")) {
    return [
      {
        label: "قسم الامتحانات",
        items: [
          { to: "/dashboard/examinations/grade-components", label: "مكوّنات العلامة", icon: ClipboardList },
          { to: "/dashboard/examinations/grade-entry", label: "إدخال العلامات", icon: PencilLine },
          { to: "/dashboard/examinations/grade-appeals", label: "الاعتراضات على العلامات", icon: Gavel },
        ],
      },
      {
        label: "System",
        items: [{ to: "/dashboard/profile", label: "My Account", icon: UserCircle2 }],
      },
    ];
  }

  if (roles.includes("doctor") || roles.includes("lab_instructor")) {
    const items = [{ to: "/dashboard/instructor/my-sections", label: "شعبي الدراسية", icon: FileText }];
    // إدارة الإعلانات متاحة للدكتور فقط، وليس للمعيد المخبري — مطابقةً لصلاحيات الباك-إند
    if (roles.includes("doctor")) {
      items.push({ to: "/dashboard/announcements", label: "الإعلانات", icon: Megaphone });
    }
    return [
      { label: "الهيئة التدريسية", items },
      {
        label: "System",
        items: [{ to: "/dashboard/profile", label: "My Account", icon: UserCircle2 }],
      },
    ];
  }

  return MINIMAL_NAV_GROUPS;
}

function initials(user) {
  const a = user?.first_name?.[0] || "";
  const b = user?.last_name?.[0] || "";
  return (a + b).toUpperCase() || "U";
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const roles = user?.roles || [];
  const navGroups = resolveNavGroups(roles);

  // تفعيل إشعارات Firebase (FCM) عند دخول لوحة التحكم — يعمل بأمان حتى لو لم تُضبط
  // متغيرات Firebase بعد (انظر firebaseMessaging.js)
  useEffect(() => {
    initFirebaseMessaging((payload) => {
      const title = payload?.notification?.title || payload?.data?.title || "إشعار جديد";
      const body = payload?.notification?.body || payload?.data?.body || "";
      toast.info(body ? `${title}: ${body}` : title);
      window.dispatchEvent(new Event("unify:notification-received"));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await teardownFirebaseMessaging();
      await logout();
      toast.info("تم تسجيل الخروج");
      navigate("/login", { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="dashboard-shell">
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <GraduationCap size={22} />
          </div>
          <div>
            <strong>Unify</strong>
            <span>Student Portal</span>
          </div>
          <button className="sidebar-close" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <div className="sidebar-id-card">
          <div className="id-avatar">{initials(user)}</div>
          <div className="id-info">
            <strong>
              {user?.first_name} {user?.last_name}
            </strong>
            <span>@{user?.username}</span>
          </div>
          <div className="id-chip" aria-hidden="true" />
        </div>

        <nav className="sidebar-nav">
          {navGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <span className="nav-group-label">{group.label}</span>
              {group.items.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <button className="logout-btn" onClick={handleLogout} disabled={loggingOut}>
          {loggingOut ? <span className="spinner" /> : <LogOut size={18} />}
          <span>Log out</span>
        </button>
      </aside>

      {mobileOpen && <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />}

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <button className="menu-toggle" onClick={() => setMobileOpen(true)} aria-label="القائمة">
            <Menu size={22} />
          </button>
          <div className="topbar-title">
            <strong>{user?.first_name || ""}</strong>
          </div>
          <NotificationBell />
          <div className="topbar-avatar">{initials(user)}</div>
        </header>

        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
