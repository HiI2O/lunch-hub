import { NavLink } from 'react-router-dom';

interface SidebarProps {
  userRole: 'ADMINISTRATOR' | 'STAFF' | 'GENERAL_USER';
}

export function Sidebar({ userRole }: SidebarProps) {
  const isStaffOrAdmin = userRole === 'ADMINISTRATOR' || userRole === 'STAFF';
  const isAdmin = userRole === 'ADMINISTRATOR';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">Lunch Hub</div>
      <nav>
        <ul className="sidebar-nav">
          <li>
            <NavLink to="/calendar" className={({ isActive }) => isActive ? 'active' : ''}>
              予約カレンダー
            </NavLink>
          </li>
          <li>
            <NavLink to="/history" className={({ isActive }) => isActive ? 'active' : ''}>
              予約履歴
            </NavLink>
          </li>
          <li>
            <NavLink to="/tickets" className={({ isActive }) => isActive ? 'active' : ''}>
              チケット管理
            </NavLink>
          </li>

          {isStaffOrAdmin && (
            <>
              <li className="sidebar-section">管理機能</li>
              <li>
                <NavLink to="/admin/orders" className={({ isActive }) => isActive ? 'active' : ''}>
                  注文管理
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/guest" className={({ isActive }) => isActive ? 'active' : ''}>
                  ゲスト予約
                </NavLink>
              </li>
            </>
          )}

          {isAdmin && (
            <>
              <li className="sidebar-section">システム管理</li>
              <li>
                <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'active' : ''}>
                  ユーザー管理
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>
    </aside>
  );
}
