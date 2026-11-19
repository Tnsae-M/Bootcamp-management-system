import * as React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  /** If set, user must have this role (or be SUPER_ADMIN) */
  requiredRole?: string;
}

function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const location = useLocation();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const activeRole = useAppSelector((s) => s.auth.activeRole);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole) {
    const role = activeRole?.toUpperCase();
    const required = requiredRole.toUpperCase();
    if (role !== required && role !== 'SUPER_ADMIN') {
      // Redirect to their own dashboard root
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}

export { ProtectedRoute };

