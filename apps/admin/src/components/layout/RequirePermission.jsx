import React from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../../lib/auth-context.jsx';
import { hasPermission } from '../../lib/permissions.js';

export function RequirePermission({ permission, children }) {
  const { permissions, isLoading } = useAuth();

  if (isLoading) return null;

  if (permission && !hasPermission(permissions, permission)) {
    return <Navigate to="/403" replace />;
  }

  return children;
}
