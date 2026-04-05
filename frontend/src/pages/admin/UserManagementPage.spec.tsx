import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserManagementPage } from './UserManagementPage';
import type { AdminUserApi } from '../../api/admin-user';
import type { AdminUserProfile } from '../../api/types';

const mockUsers: AdminUserProfile[] = [
  { id: 'u1', email: 'admin@co.com', displayName: '管理者', role: 'ADMINISTRATOR', status: 'ACTIVE', lastLoginAt: '2026-04-05T09:00:00Z', createdAt: '2026-01-01T00:00:00Z' },
  { id: 'u2', email: 'staff@co.com', displayName: '山田 太郎', role: 'STAFF', status: 'ACTIVE', lastLoginAt: '2026-04-04T08:30:00Z', createdAt: '2026-01-01T00:00:00Z' },
  { id: 'u3', email: 'user1@co.com', displayName: '佐藤 花子', role: 'GENERAL_USER', status: 'ACTIVE', lastLoginAt: null, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'u4', email: 'invited@co.com', displayName: null, role: 'GENERAL_USER', status: 'INVITED', lastLoginAt: null, createdAt: '2026-04-01T00:00:00Z' },
  { id: 'u5', email: 'disabled@co.com', displayName: '退職者', role: 'GENERAL_USER', status: 'DEACTIVATED', lastLoginAt: null, createdAt: '2026-01-01T00:00:00Z' },
];

function createMockApi(overrides?: Partial<AdminUserApi>): AdminUserApi {
  return {
    getUsers: vi.fn<() => Promise<AdminUserProfile[]>>().mockResolvedValue(mockUsers),
    inviteUser: vi.fn().mockResolvedValue({ userId: 'new1', email: 'new@co.com' }),
    resendInvitation: vi.fn().mockResolvedValue({ message: 'ok' }),
    cancelInvitation: vi.fn().mockResolvedValue({ message: 'ok' }),
    deactivateUser: vi.fn().mockResolvedValue({ message: 'ok' }),
    reactivateUser: vi.fn().mockResolvedValue({ message: 'ok' }),
    changeRole: vi.fn().mockResolvedValue({ message: 'ok' }),
    forceLogout: vi.fn().mockResolvedValue({ message: 'ok' }),
    ...overrides,
  };
}

describe('UserManagementPage', () => {
  let api: AdminUserApi;

  beforeEach(() => {
    api = createMockApi();
  });

  it('ユーザー一覧を表示する', async () => {
    render(<UserManagementPage adminUserApi={api} />);

    await waitFor(() => {
      expect(screen.getByText('ユーザー一覧')).toBeInTheDocument();
    });
    expect(screen.getByText('admin@co.com')).toBeInTheDocument();
    expect(screen.getByText('山田 太郎')).toBeInTheDocument();
    expect(api.getUsers).toHaveBeenCalled();
  });

  it('ユーザー招待フォームで招待を送信できる', async () => {
    const user = userEvent.setup();
    render(<UserManagementPage adminUserApi={api} />);

    await waitFor(() => {
      expect(screen.getByText('ユーザー一覧')).toBeInTheDocument();
    });

    const emailInput = screen.getByPlaceholderText('email@company.com');
    await user.type(emailInput, 'new@co.com');
    await user.click(screen.getByText('招待を送信'));

    await waitFor(() => {
      expect(api.inviteUser).toHaveBeenCalledWith('new@co.com', 'GENERAL_USER');
    });
  });

  it('ACTIVEユーザーに「無効化」ボタンが表示される', async () => {
    render(<UserManagementPage adminUserApi={api} />);

    await waitFor(() => {
      expect(screen.getByText('ユーザー一覧')).toBeInTheDocument();
    });

    const deactivateButtons = screen.getAllByText('無効化');
    expect(deactivateButtons.length).toBeGreaterThan(0);
  });

  it('DEACTIVATEDユーザーに「有効化」ボタンが表示される', async () => {
    render(<UserManagementPage adminUserApi={api} />);

    await waitFor(() => {
      expect(screen.getByText('ユーザー一覧')).toBeInTheDocument();
    });

    expect(screen.getByText('有効化')).toBeInTheDocument();
  });

  it('無効化ボタンでユーザーを無効化できる', async () => {
    const user = userEvent.setup();
    render(<UserManagementPage adminUserApi={api} />);

    await waitFor(() => {
      expect(screen.getByText('ユーザー一覧')).toBeInTheDocument();
    });

    // 最初の「無効化」ボタンをクリック（ADMINISTRATORは自分なので除外 → staffが最初のACTIVE）
    const deactivateButtons = screen.getAllByText('無効化');
    await user.click(deactivateButtons[0]);

    await waitFor(() => {
      expect(api.deactivateUser).toHaveBeenCalled();
    });
  });

  it('ローディング中はローディング表示する', () => {
    const slowApi = createMockApi({
      getUsers: vi.fn<() => Promise<AdminUserProfile[]>>().mockReturnValue(new Promise(() => {})),
    });

    render(<UserManagementPage adminUserApi={slowApi} />);

    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });
});
