import { useAuth } from '../../hooks/useAuth';

export function Header(): React.JSX.Element {
  const { user, logout } = useAuth();

  const handleLogout = (): void => {
    void logout();
  };

  if (!user) {
    return (
      <header className="header">
        <h1 className="header-title">Lunch Hub</h1>
      </header>
    );
  }

  return (
    <header className="header">
      <h1 className="header-title">Lunch Hub</h1>
      <div className="header-user">
        <div className="header-user-avatar">{user.displayName.charAt(0)}</div>
        <button type="button" className="btn btn-outline btn-sm" onClick={handleLogout}>
          ログアウト
        </button>
      </div>
    </header>
  );
}
