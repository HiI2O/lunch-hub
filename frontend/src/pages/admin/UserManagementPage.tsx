import { useState, useEffect, useCallback } from 'react';
import type { AdminUserApi } from '../../api/admin-user';
import type { AdminUserProfile, UserRole } from '../../api/types';

type UserManagementPageProps = {
  readonly adminUserApi: AdminUserApi;
};

export function UserManagementPage({ adminUserApi }: UserManagementPageProps) {
  const [users, setUsers] = useState<AdminUserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');

  const loadUsers = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminUserApi.getUsers();
      setUsers(data);
    } catch {
      setError('ユーザー一覧の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, [adminUserApi]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const activeCount = users.filter((u) => u.status === 'ACTIVE').length;
  const invitedCount = users.filter((u) => u.status === 'INVITED').length;
  const deactivatedCount = users.filter((u) => u.status === 'DEACTIVATED').length;

  const handleInvite = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    try {
      await adminUserApi.inviteUser(inviteEmail.trim(), 'GENERAL_USER');
      setInviteEmail('');
      await loadUsers();
    } catch {
      setError('招待の送信に失敗しました');
    }
  };

  const handleDeactivate = async (userId: string): Promise<void> => {
    try {
      await adminUserApi.deactivateUser(userId);
      await loadUsers();
    } catch {
      setError('無効化に失敗しました');
    }
  };

  const handleReactivate = async (userId: string): Promise<void> => {
    try {
      await adminUserApi.reactivateUser(userId);
      await loadUsers();
    } catch {
      setError('有効化に失敗しました');
    }
  };

  const handleChangeRole = async (userId: string, role: UserRole): Promise<void> => {
    try {
      await adminUserApi.changeRole(userId, role);
      await loadUsers();
    } catch {
      setError('ロール変更に失敗しました');
    }
  };

  const getRoleBadge = (role: string): JSX.Element => {
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

  const getStatusBadge = (status: string): JSX.Element => {
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

  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (error) {
    return <div className="text-danger">{error}</div>;
  }

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">アクティブユーザー</div>
          <div className="stat-value success">{activeCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">招待中</div>
          <div className="stat-value warning">{invitedCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">無効</div>
          <div className="stat-value">{deactivatedCount}</div>
        </div>
      </div>

      <div className="card">
        <div className="flex-between mb-2">
          <h3 className="card-title mb-0">ユーザー招待</h3>
        </div>
        <form className="flex gap-1" onSubmit={(e) => void handleInvite(e)}>
          <input
            type="email"
            className="form-input"
            placeholder="email@company.com"
            style={{ flex: 1 }}
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
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
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.displayName ?? '-'}</td>
                  <td className="text-secondary text-sm">{user.email}</td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td>{getStatusBadge(user.status)}</td>
                  <td>
                    <div className="flex gap-1">
                      {user.status === 'ACTIVE' && user.role !== 'ADMINISTRATOR' && (
                        <>
                          <select
                            className="form-input btn-sm"
                            value={user.role}
                            onChange={(e) => void handleChangeRole(user.id, e.target.value as UserRole)}
                          >
                            <option value="GENERAL_USER">一般</option>
                            <option value="STAFF">係</option>
                          </select>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => void handleDeactivate(user.id)}
                          >
                            無効化
                          </button>
                        </>
                      )}
                      {user.status === 'DEACTIVATED' && (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => void handleReactivate(user.id)}
                        >
                          有効化
                        </button>
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
