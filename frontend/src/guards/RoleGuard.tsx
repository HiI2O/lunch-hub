import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../api/types';

type RoleGuardProps = {
  readonly roles: readonly UserRole[];
};

export function RoleGuard({ roles }: RoleGuardProps): React.JSX.Element {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/calendar" replace />;
  }

  return <Outlet />;
}
