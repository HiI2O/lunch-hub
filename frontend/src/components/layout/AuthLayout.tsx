import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="auth-logo">Lunch Hub</div>
        <Outlet />
      </div>
    </div>
  );
}
