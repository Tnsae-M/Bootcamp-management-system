import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { fetchCurrentUser } from './features/auth/authSlice';
import { getDashboardRoot } from './config/navigation';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Skeleton } from './components/ui/skeleton';

// ---------------------------------------------------------------------------
// Lazy page imports  (pages will be created in Stage 3+)
// ---------------------------------------------------------------------------
const LandingPage       = lazy(() => import('./pages/LandingPage'));
const LoginPage         = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage      = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const VerifyEmailPage   = lazy(() => import('./pages/auth/VerifyEmailPage'));

// Admin pages
const AdminDashboard    = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminDivisions    = lazy(() => import('./pages/admin/AdminDivisions'));
const AdminBootcamps    = lazy(() => import('./pages/admin/AdminBootcamps'));
const AdminUsers        = lazy(() => import('./pages/admin/AdminUsers'));
const AdminEnrollments  = lazy(() => import('./pages/admin/AdminEnrollments'));
const AdminReports      = lazy(() => import('./pages/admin/AdminReports'));
const AdminAuditLog     = lazy(() => import('./pages/admin/AdminAuditLog'));
const AdminNotifications = lazy(() => import('./pages/admin/AdminNotifications'));

// Instructor pages
const InstructorDashboard   = lazy(() => import('./pages/instructor/InstructorDashboard'));
const InstructorSessions    = lazy(() => import('./pages/instructor/InstructorSessions'));
const InstructorTasks       = lazy(() => import('./pages/instructor/InstructorTasks'));
const InstructorSubmissions = lazy(() => import('./pages/instructor/InstructorSubmissions'));
const InstructorAttendance  = lazy(() => import('./pages/instructor/InstructorAttendance'));
const InstructorGroups      = lazy(() => import('./pages/instructor/InstructorGroups'));
const InstructorResources   = lazy(() => import('./pages/instructor/InstructorResources'));
const InstructorNotifications = lazy(() => import('./pages/instructor/InstructorNotifications'));

// Student pages
const StudentDashboard    = lazy(() => import('./pages/student/StudentDashboard'));
const StudentBootcamps    = lazy(() => import('./pages/student/StudentBootcamps'));
const StudentSessions     = lazy(() => import('./pages/student/StudentSessions'));
const StudentTasks        = lazy(() => import('./pages/student/StudentTasks'));
const StudentProgress     = lazy(() => import('./pages/student/StudentProgress'));
const StudentGroups       = lazy(() => import('./pages/student/StudentGroups'));
const StudentResources    = lazy(() => import('./pages/student/StudentResources'));
const StudentNotifications = lazy(() => import('./pages/student/StudentNotifications'));

// Guest pages
const GuestDashboard    = lazy(() => import('./pages/guest/GuestDashboard'));
const GuestApplications = lazy(() => import('./pages/guest/GuestApplications'));
const GuestProfile      = lazy(() => import('./pages/guest/GuestProfile'));

// Shared
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// ---------------------------------------------------------------------------
// Full-page loading fallback
// ---------------------------------------------------------------------------
function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
      <div className="space-y-3 w-64">
        <Skeleton className="h-8 w-32 mx-auto" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Redirect from /dashboard to the user's highest-role root
// ---------------------------------------------------------------------------
function DashboardRedirect() {
  const activeRole = useAppSelector((s) => s.auth.activeRole);
  return <Navigate to={getDashboardRoot(activeRole)} replace />;
}

// ---------------------------------------------------------------------------
// App — route tree
// ---------------------------------------------------------------------------
export default function App() {
  const dispatch = useAppDispatch();
  const isInitializing = useAppSelector((s) => s.auth.isInitializing);

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  if (isInitializing) return <PageLoader />;

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/"                      element={<LandingPage />} />
        <Route path="/login"                 element={<LoginPage />} />
        <Route path="/register"              element={<RegisterPage />} />
        <Route path="/forgot-password"       element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/verify-email/:token"   element={<VerifyEmailPage />} />

        {/* Dashboard redirect */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardRedirect />
            </ProtectedRoute>
          }
        />

        {/* Admin portal */}
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="divisions"     element={<AdminDivisions />} />
          <Route path="bootcamps"     element={<AdminBootcamps />} />
          <Route path="users"         element={<AdminUsers />} />
          <Route path="enrollments"   element={<AdminEnrollments />} />
          <Route path="reports"       element={<AdminReports />} />
          <Route path="audit-log"     element={<AdminAuditLog />} />
          <Route path="notifications" element={<AdminNotifications />} />
        </Route>

        {/* Instructor portal */}
        <Route
          path="/dashboard/instructor"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<InstructorDashboard />} />
          <Route path="sessions"      element={<InstructorSessions />} />
          <Route path="tasks"         element={<InstructorTasks />} />
          <Route path="submissions"   element={<InstructorSubmissions />} />
          <Route path="attendance"    element={<InstructorAttendance />} />
          <Route path="groups"        element={<InstructorGroups />} />
          <Route path="resources"     element={<InstructorResources />} />
          <Route path="notifications" element={<InstructorNotifications />} />
        </Route>

        {/* Student portal */}
        <Route
          path="/dashboard/student"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="bootcamps"     element={<StudentBootcamps />} />
          <Route path="sessions"      element={<StudentSessions />} />
          <Route path="tasks"         element={<StudentTasks />} />
          <Route path="progress"      element={<StudentProgress />} />
          <Route path="groups"        element={<StudentGroups />} />
          <Route path="resources"     element={<StudentResources />} />
          <Route path="notifications" element={<StudentNotifications />} />
        </Route>

        {/* Guest portal */}
        <Route
          path="/dashboard/guest"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<GuestDashboard />} />
          <Route path="applications" element={<GuestApplications />} />
          <Route path="profile"      element={<GuestProfile />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

