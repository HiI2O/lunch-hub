import { Link } from 'react-router-dom';

interface HeaderProps {
  title: string;
  userName: string;
}

export function Header({ title, userName }: HeaderProps) {
  return (
    <header className="header">
      <h1 className="header-title">{title}</h1>
      <div className="header-user">
        <span className="header-user-name">{userName}</span>
        <Link to="/login" className="btn btn-outline btn-sm">
          ログアウト
        </Link>
      </div>
    </header>
  );
}
