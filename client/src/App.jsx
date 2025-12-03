import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from './features/auth/authSlice';

// Layouts
import MainLayout from './components/layout/MainLayout';
import ErrorBoundary from './components/common/ErrorBoundary';
import { Toaster } from 'react-hot-toast';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import VerifyResetOTP from './pages/VerifyResetOTP';
import ResetPassword from './pages/ResetPassword';

// Main Pages
import Dashboard from './pages/Dashboard';
import WorkspaceList from './pages/WorkspaceList';
import ProjectList from './pages/ProjectList';
import ProjectDetail from './pages/ProjectDetail';
import TaskList from './pages/TaskList';
import KanbanOverview from './pages/KanbanOverview';
import KanbanBoard from './pages/KanbanBoard';
import Team from './pages/Team';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import InvitationPage from './pages/InvitationPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import WorkspaceActivity from './components/dashboard/WorkspaceActivity';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-reset-otp" element={<VerifyResetOTP />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Routes with Layout */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/workspaces" element={<WorkspaceList />} />
            <Route path="/workspaces/:workspaceId" element={<WorkspaceList />} />
            <Route path="/projects" element={<ProjectList />} />
            <Route path="/projects/:projectId" element={<ProjectDetail />} />
            <Route path="/projects/:projectId/kanban" element={<KanbanBoard />} />
            <Route path="/tasks" element={<TaskList />} />
            <Route path="/kanban" element={<KanbanOverview />} />
            <Route path="/team" element={<Team />} />
            <Route path="/workspaces/:workspaceId/team" element={<Team />} />
            <Route path="/workspaces/:workspaceId/activity" element={<WorkspaceActivity />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
          </Route>

          {/* Invitation Route - Handles its own auth check */}
          <Route path="/invitations/:token" element={<InvitationPage />} />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toaster />
      </Router>
    </ErrorBoundary>
  );
}

export default App;
