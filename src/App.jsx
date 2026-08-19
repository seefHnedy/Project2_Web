import React from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import LoginPage from "./pages/Auth/LoginPage.jsx";
import DashboardLayout from "./components/layout/DashboardLayout.jsx";
import OverviewPage from "./pages/Admin/Dashboard/OverviewPage.jsx";
import StudentsPage from "./pages/Admin/Students/StudentsPage.jsx";
import DepartmentsPage from "./pages/Admin/Departments/DepartmentsPage.jsx";
import ProfilePage from "./pages/Admin/Profile/ProfilePage.jsx";
import TeachingStaffPage from "./pages/Admin/TeachingStaff/TeachingStaffPage.jsx";
import UsersPage from "./pages/Admin/Users/UsersPage.jsx";
import CoursesPage from "./pages/Admin/Courses/CoursesPage.jsx";
import CourseSectionsPage from "./pages/Admin/CourseSections/CourseSectionsPage.jsx";
import ClassroomsPage from "./pages/Admin/Classrooms/ClassroomsPage.jsx";
import SemestersPage from "./pages/Admin/Semesters/SemestersPage.jsx";
import SchedulesPage from "./pages/Admin/Schedules/SchedulesPage.jsx";
import PaymentsPage from "./pages/Admin/Payments/PaymentsPage.jsx";
import SettingsPage from "./pages/Admin/Settings/SettingsPage.jsx";
import GradeComponentsPage from "./pages/Examinations/GradeComponents/GradeComponentsPage.jsx";
import GradeEntryPage from "./pages/Examinations/GradeEntry/GradeEntryPage.jsx";
import GradeAppealsPage from "./pages/Examinations/GradeAppeals/GradeAppealsPage.jsx";
import HourPurchasesPage from "./pages/Finance/HourPurchases/HourPurchasesPage.jsx";
import MyCourseSectionsPage from "./pages/Instructor/MyCourseSections/MyCourseSectionsPage.jsx";
import AnnouncementsPage from "./pages/Announcements/AnnouncementsPage.jsx";
import { useAuth } from "./context/AuthContext.jsx";

function FullScreenLoader() {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg)" }}>
      <span className="spinner dark" style={{ width: 32, height: 32, borderWidth: 4 }} />
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, checkingSession } = useAuth();
  const location = useLocation();
  if (checkingSession) return <FullScreenLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}

function GuestRoute({ children }) {
  const { isAuthenticated, checkingSession } = useAuth();
  if (checkingSession) return <FullScreenLoader />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

function RoleRoute({ roles, children }) {
  const { user } = useAuth();
  const userRoles = user?.roles || [];
  const allowed = roles.some((r) => userRoles.includes(r));
  if (!allowed) return <Navigate to="/dashboard" replace />;
  return children;
}

function DashboardIndex() {
  const { user } = useAuth();
  const userRoles = user?.roles || [];
  if (userRoles.includes("admin")) return <OverviewPage />;
  if (userRoles.includes("Examinations")) return <Navigate to="/dashboard/examinations/grade-entry" replace />;
  if (userRoles.includes("doctor") || userRoles.includes("lab_instructor")) return <Navigate to="/dashboard/instructor/my-sections" replace />;
  return <Navigate to="/dashboard/profile" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardIndex />} />

        {/* شاشات الإدمن */}
        <Route path="students" element={<RoleRoute roles={["admin"]}><StudentsPage /></RoleRoute>} />
        <Route path="teaching-staff" element={<RoleRoute roles={["admin"]}><TeachingStaffPage /></RoleRoute>} />
        <Route path="users" element={<RoleRoute roles={["admin"]}><UsersPage /></RoleRoute>} />
        <Route path="departments" element={<RoleRoute roles={["admin"]}><DepartmentsPage /></RoleRoute>} />
        <Route path="courses" element={<RoleRoute roles={["admin"]}><CoursesPage /></RoleRoute>} />
        <Route path="course-sections" element={<RoleRoute roles={["admin"]}><CourseSectionsPage /></RoleRoute>} />
        <Route path="classrooms" element={<RoleRoute roles={["admin"]}><ClassroomsPage /></RoleRoute>} />
        <Route path="semesters" element={<RoleRoute roles={["admin"]}><SemestersPage /></RoleRoute>} />
        <Route path="schedules" element={<RoleRoute roles={["admin"]}><SchedulesPage /></RoleRoute>} />
        <Route path="payments" element={<RoleRoute roles={["admin"]}><PaymentsPage /></RoleRoute>} />
        <Route path="settings" element={<RoleRoute roles={["admin"]}><SettingsPage /></RoleRoute>} />
        <Route path="hour-purchases" element={<RoleRoute roles={["admin"]}><HourPurchasesPage /></RoleRoute>} />

        {/* شاشات قسم الامتحانات */}
        <Route
          path="examinations/grade-components"
          element={
            <RoleRoute roles={["admin", "Examinations"]}>
              <GradeComponentsPage />
            </RoleRoute>
          }
        />
        <Route
          path="examinations/grade-entry"
          element={
            <RoleRoute roles={["admin", "Examinations"]}>
              <GradeEntryPage />
            </RoleRoute>
          }
        />
        <Route
          path="examinations/grade-appeals"
          element={
            <RoleRoute roles={["Examinations"]}>
              <GradeAppealsPage />
            </RoleRoute>
          }
        />

        {/* بوابة الهيئة التدريسية (دكتور / معيد) */}
        <Route
          path="instructor/my-sections"
          element={
            <RoleRoute roles={["doctor", "lab_instructor"]}>
              <MyCourseSectionsPage />
            </RoleRoute>
          }
        />

        {/* الإعلانات — للأدمن ولدكتور فقط (وليس المعيد المخبري)د */}
        <Route
          path="announcements"
          element={
            <RoleRoute roles={["admin", "doctor"]}>
              <AnnouncementsPage />
            </RoleRoute>
          }
        />

        {/* متاحة لأي مستخدم مسجّل دخول بغض النظر عن دوره */}
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
