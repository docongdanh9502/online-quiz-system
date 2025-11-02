import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ('student' | 'teacher' | 'admin')[];
  fallback?: React.ReactNode;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles, fallback = null }) => {
  const { user } = useAuth();

  if (!user) {
    return <>{fallback}</>;
  }

  if (!allowedRoles.includes(user.role as 'student' | 'teacher' | 'admin')) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default RoleGuard;