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
import { useAuth } from "./context/AuthContext.jsx";

function FullScreenLoader() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "var(--bg)",
      }}
    >
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
        <Route index element={<OverviewPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="teaching-staff" element={<TeachingStaffPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="departments" element={<DepartmentsPage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="course-sections" element={<CourseSectionsPage />} />
        <Route path="classrooms" element={<ClassroomsPage />} />
        <Route path="semesters" element={<SemestersPage />} />
        <Route path="schedules" element={<SchedulesPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
