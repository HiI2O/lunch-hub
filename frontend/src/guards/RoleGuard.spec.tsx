import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthContext } from '../contexts/auth-context-value';
import type { AuthContextValue } from '../contexts/auth-context-value';
import type { UserRole } from '../api/types';
import { RoleGuard } from './RoleGuard';

const noop = async (): Promise<void> => {};

function makeAuthValue(role: UserRole): AuthContextValue {
  return {
    user: { id: '1', email: 'a@b.com', displayName: 'テスト', role },
    isAuthenticated: true,
    isLoading: false,
    login: noop,
    logout: noop,
    updateUser: () => {},
  };
}

function renderWithRole(
  role: UserRole,
  allowedRoles: readonly UserRole[],
): void {
  render(
    <AuthContext.Provider value={makeAuthValue(role)}>
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/calendar" element={<p>カレンダー</p>} />
          <Route element={<RoleGuard roles={allowedRoles} />}>
            <Route path="/admin" element={<p>管理画面</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('RoleGuard', () => {
  it('許可された役割の場合、子ルートを表示する', () => {
    renderWithRole('ADMINISTRATOR', ['STAFF', 'ADMINISTRATOR']);

    expect(screen.getByText('管理画面')).toBeInTheDocument();
  });

  it('STAFFもSTAFF許可ルートにアクセスできる', () => {
    renderWithRole('STAFF', ['STAFF', 'ADMINISTRATOR']);

    expect(screen.getByText('管理画面')).toBeInTheDocument();
  });

  it('権限不足の場合/calendarにリダイレクトする', () => {
    renderWithRole('GENERAL_USER', ['STAFF', 'ADMINISTRATOR']);

    expect(screen.getByText('カレンダー')).toBeInTheDocument();
    expect(screen.queryByText('管理画面')).not.toBeInTheDocument();
  });

  it('ADMINISTRATOR専用ルートにSTAFFはアクセスできない', () => {
    renderWithRole('STAFF', ['ADMINISTRATOR']);

    expect(screen.getByText('カレンダー')).toBeInTheDocument();
    expect(screen.queryByText('管理画面')).not.toBeInTheDocument();
  });

  it('user=nullの場合/calendarにリダイレクトする', () => {
    const nullUserValue: AuthContextValue = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: noop,
      logout: noop,
      updateUser: () => {},
    };

    render(
      <AuthContext.Provider value={nullUserValue}>
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route path="/calendar" element={<p>カレンダー</p>} />
            <Route element={<RoleGuard roles={['ADMINISTRATOR']} />}>
              <Route path="/admin" element={<p>管理画面</p>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>,
    );

    expect(screen.getByText('カレンダー')).toBeInTheDocument();
    expect(screen.queryByText('管理画面')).not.toBeInTheDocument();
  });
});
