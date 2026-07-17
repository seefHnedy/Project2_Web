import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Banknote,
  Building2,
  CalendarRange,
  DoorOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  UserCircle2,
  Users,
  UsersRound,
  X,
} from "lucide-react";
import "./styles/DashboardLayout.css";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

const NAV_GROUPS = [
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
    items: [{ to: "/dashboard/payments", label: "Payments", icon: Banknote }],
  },
  {
    label: "System",
    items: [
      { to: "/dashboard/settings", label: "Settings", icon: Settings },
      { to: "/dashboard/profile", label: "My Account", icon: UserCircle2 },
    ],
  },
];

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

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
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
          {NAV_GROUPS.map((group) => (
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
          <div className="topbar-avatar">{initials(user)}</div>
        </header>

        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
