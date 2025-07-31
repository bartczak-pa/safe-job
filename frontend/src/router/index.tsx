import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from '../components/layout';
import { HomePage, LoginPage, RegisterPage, DashboardPage, UnauthorizedPage } from '../pages';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        <RegisterPage />
      </PublicRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
  // Candidate-only routes
  {
    path: '/jobs',
    element: (
      <ProtectedRoute requiredRole="candidate">
        <div>Jobs Page - Coming Soon</div>
      </ProtectedRoute>
    ),
  },
  {
    path: '/applications',
    element: (
      <ProtectedRoute requiredRole="candidate">
        <div>Applications Page - Coming Soon</div>
      </ProtectedRoute>
    ),
  },
  // Employer-only routes
  {
    path: '/post-job',
    element: (
      <ProtectedRoute requiredRole="employer">
        <div>Post Job Page - Coming Soon</div>
      </ProtectedRoute>
    ),
  },
  {
    path: '/manage-jobs',
    element: (
      <ProtectedRoute requiredRole="employer">
        <div>Manage Jobs Page - Coming Soon</div>
      </ProtectedRoute>
    ),
  },
  // Admin-only routes
  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRole="admin">
        <div>Admin Panel - Coming Soon</div>
      </ProtectedRoute>
    ),
  },
  // Catch all - redirect to home
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
