import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../contexts/auth-context-value';
import type { AuthContextValue } from '../../contexts/auth-context-value';
import { Header } from './Header';

const noop = async (): Promise<void> => {};

function renderHeader(overrides?: Partial<AuthContextValue>): {
  logoutMock: ReturnType<typeof vi.fn>;
} {
  const logoutMock = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
  const value: AuthContextValue = {
    user: { id: '1', email: 'test@example.com', displayName: 'テストユーザー', role: 'GENERAL_USER' },
    isAuthenticated: true,
    isLoading: false,
    login: noop,
    logout: logoutMock,
    updateUser: () => {},
    ...overrides,
  };

  render(
    <AuthContext.Provider value={value}>
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    </AuthContext.Provider>,
  );

  return { logoutMock };
}

describe('Header', () => {
  it('認証済み: ユーザーの表示名が表示される', () => {
    renderHeader();
    expect(screen.getByText('テストユーザー'.charAt(0))).toBeInTheDocument();
  });

  it('認証済み: ログアウトボタンが表示される', () => {
    renderHeader();
    expect(screen.getByRole('button', { name: /ログアウト/ })).toBeInTheDocument();
  });

  it('ログアウトボタン押下: logout()が呼ばれる', async () => {
    const { logoutMock } = renderHeader();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /ログアウト/ }));

    expect(logoutMock).toHaveBeenCalled();
  });

  it('未認証: ユーザー情報が表示されない', () => {
    renderHeader({ user: null, isAuthenticated: false });
    expect(screen.queryByRole('button', { name: /ログアウト/ })).not.toBeInTheDocument();
  });
});
