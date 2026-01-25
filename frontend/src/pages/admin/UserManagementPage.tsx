export function UserManagementPage() {
  // モック用のユーザーデータ
  const mockUsers = [
    { id: '1', email: 'admin@company.com', displayName: '管理者', role: 'ADMINISTRATOR', status: 'ACTIVE', lastLogin: '2026-01-21 09:00' },
    { id: '2', email: 'staff@company.com', displayName: '山田 太郎', role: 'STAFF', status: 'ACTIVE', lastLogin: '2026-01-21 08:30' },
    { id: '3', email: 'user1@company.com', displayName: '佐藤 花子', role: 'GENERAL_USER', status: 'ACTIVE', lastLogin: '2026-01-20 12:00' },
    { id: '4', email: 'user2@company.com', displayName: '鈴木 一郎', role: 'GENERAL_USER', status: 'ACTIVE', lastLogin: '2026-01-19 15:30' },
    { id: '5', email: 'invited@company.com', displayName: '-', role: 'GENERAL_USER', status: 'INVITED', lastLogin: '-' },
    { id: '6', email: 'disabled@company.com', displayName: '退職者', role: 'GENERAL_USER', status: 'DEACTIVATED', lastLogin: '2025-12-01 10:00' },
  ];

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMINISTRATOR':
        return <span className="badge badge-danger">管理者</span>;
      case 'STAFF':
        return <span className="badge badge-warning">係</span>;
      case 'GENERAL_USER':
        return <span className="badge badge-info">一般</span>;
      default:
        return <span className="badge">{role}</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="badge badge-success">有効</span>;
      case 'INVITED':
        return <span className="badge badge-warning">招待中</span>;
      case 'DEACTIVATED':
        return <span className="badge badge-danger">無効</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">アクティブユーザー</div>
          <div className="stat-value success">4</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">招待中</div>
          <div className="stat-value warning">1</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">無効</div>
          <div className="stat-value">1</div>
        </div>
      </div>

      <div className="card">
        <div className="flex-between mb-2">
          <h3 className="card-title mb-0">ユーザー招待</h3>
        </div>
        <form className="flex gap-1">
          <input
            type="email"
            className="form-input"
            placeholder="email@company.com"
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary">
            招待を送信
          </button>
        </form>
      </div>

      <div className="card">
        <h3 className="card-title">ユーザー一覧</h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>表示名</th>
                <th>メール</th>
                <th>ロール</th>
                <th>ステータス</th>
                <th>最終ログイン</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {mockUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.displayName}</td>
                  <td className="text-secondary text-sm">{user.email}</td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td>{getStatusBadge(user.status)}</td>
                  <td className="text-secondary text-sm">{user.lastLogin}</td>
                  <td>
                    <div className="flex gap-1">
                      <button className="btn btn-outline btn-sm">編集</button>
                      {user.status === 'ACTIVE' && (
                        <button className="btn btn-danger btn-sm">無効化</button>
                      )}
                      {user.status === 'DEACTIVATED' && (
                        <button className="btn btn-success btn-sm">有効化</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
