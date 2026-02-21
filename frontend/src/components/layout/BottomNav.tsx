import { NavLink } from 'react-router-dom';

export function BottomNav() {
    return (
        <nav className="bottom-nav">
            <NavLink to="/calendar" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
                <span>📅</span>
                <span>予約</span>
            </NavLink>
            <NavLink to="/history" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
                <span>🕒</span>
                <span>履歴</span>
            </NavLink>
            <NavLink to="/tickets" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
                <span>🎟️</span>
                <span>チケット</span>
            </NavLink>
            <NavLink to="/admin" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
                <span>⚙️</span>
                <span>管理</span>
            </NavLink>
        </nav>
    );
}
