import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthContext } from '../contexts/auth-context-value';
import type { AuthContextValue } from '../contexts/auth-context-value';
import { AuthGuard } from './AuthGuard';

const noop = async (): Promise<void> => {};

function renderWithAuth(contextValue: AuthContextValue, initialPath = '/protected'): void {
  render(
    <AuthContext.Provider value={contextValue}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/login" element={<p>ログイン画面</p>} />
          <Route element={<AuthGuard />}>
            <Route path="/protected" element={<p>保護されたページ</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('AuthGuard', () => {
  it('isLoading中はローディング表示を出す', () => {
    renderWithAuth({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      login: noop,
      logout: noop,
      updateUser: () => {},
    });

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('保護されたページ')).not.toBeInTheDocument();
    expect(screen.queryByText('ログイン画面')).not.toBeInTheDocument();
  });

  it('未認証の場合/loginにリダイレクトする', () => {
    renderWithAuth({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: noop,
      logout: noop,
      updateUser: () => {},
    });

    expect(screen.getByText('ログイン画面')).toBeInTheDocument();
    expect(screen.queryByText('保護されたページ')).not.toBeInTheDocument();
  });

  it('認証済みの場合子ルートを表示する', () => {
    renderWithAuth({
      user: { id: '1', email: 'a@b.com', displayName: 'テスト', role: 'GENERAL_USER' },
      isAuthenticated: true,
      isLoading: false,
      login: noop,
      logout: noop,
      updateUser: () => {},
    });

    expect(screen.getByText('保護されたページ')).toBeInTheDocument();
    expect(screen.queryByText('ログイン画面')).not.toBeInTheDocument();
  });
});
