import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { useAuth } from './hooks/useAuth';
import ErrorBoundary from './components/ui/error-boundary';
import LoadingScreen from './components/ui/loading-screen';

// Import layouts
import AdminLayout from './layouts/AdminLayout';

// Import pages
import LoginPage from './pages/Login';
import DashboardSelector from './pages/Index';

// Dashboard imports
import AdminDashboard from './pages/admin/Dashboard';
import StudentsDashboard from './pages/admin/Students';
import StaffDashboard from './pages/admin/Staff';
import TransportDashboard from './pages/admin/Transport';
import AnalyticsDashboard from './pages/admin/Analytics';
import ReportsDashboard from './pages/admin/Reports';
import NotificationsDashboard from './pages/admin/Notifications';
import SettingsDashboard from './pages/admin/Settings';
import ParentDashboard from './pages/parent/Dashboard';
import TeacherDashboard from './pages/teacher/Dashboard';
import DriverDashboard from './pages/driver/Dashboard';

// Protected Route wrapper
function ProtectedRoute({ children, requiredRole = null }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingScreen message="Initializing your dashboard..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppRoutes() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingScreen message="Loading your dashboard..." />;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/login" 
        element={
          user ? <Navigate to="/" replace /> : <LoginPage />
        } 
      />
      
      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardSelector />
          </ProtectedRoute>
        }
      />

      {/* Admin routes with layout */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="students" element={<StudentsDashboard />} />
        <Route path="staff" element={<StaffDashboard />} />
        <Route path="transport" element={<TransportDashboard />} />
        <Route path="analytics" element={<AnalyticsDashboard />} />
        <Route path="reports" element={<ReportsDashboard />} />
        <Route path="notifications" element={<NotificationsDashboard />} />
        <Route path="settings" element={<SettingsDashboard />} />
      </Route>

      {/* Accounts routes (same as admin but with accounts role) */}
      <Route
        path="/accounts/*"
        element={
          <ProtectedRoute requiredRole="accounts">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="students" element={<StudentsDashboard />} />
        <Route path="staff" element={<StaffDashboard />} />
        <Route path="transport" element={<TransportDashboard />} />
        <Route path="analytics" element={<AnalyticsDashboard />} />
        <Route path="reports" element={<ReportsDashboard />} />
        <Route path="notifications" element={<NotificationsDashboard />} />
        <Route path="settings" element={<SettingsDashboard />} />
      </Route>

      {/* Parent routes */}
      <Route
        path="/parent/*"
        element={
          <ProtectedRoute requiredRole="parent">
            <ParentDashboard />
          </ProtectedRoute>
        }
      />

      {/* Teacher routes */}
      <Route
        path="/teacher/*"
        element={
          <ProtectedRoute requiredRole="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />

      {/* Driver routes */}
      <Route
        path="/driver/*"
        element={
          <ProtectedRoute requiredRole="driver">
            <DriverDashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <div className="App">
            <AppRoutes />
          </div>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
