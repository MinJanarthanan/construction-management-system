import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Tasks from './pages/Tasks';
import Materials from './pages/Materials';
import Resources from './pages/Resources';
import Finance from './pages/Finance';
import Contractors from './pages/Contractors';
import Users from './pages/Users';
import Reports from './pages/Reports';
import SiteForms from './pages/SiteForms';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token, loading, userRole } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Verifying session...</p>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole) && userRole !== 'Admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

const App = () => {
  const { token } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={token ? <Navigate to="/" replace /> : <Login />}
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="materials" element={<Materials />} />
        <Route path="resources" element={<Resources />} />
        <Route path="finance" element={<Finance />} />
        <Route path="contractors" element={<Contractors />} />
        <Route path="forms" element={<SiteForms />} />
        <Route
          path="users"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route path="reports" element={<Reports />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
