import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from '../../contexts/auth-context-value';
import type { AuthContextValue } from '../../contexts/auth-context-value';
import { ToastProvider } from '../../contexts/ToastContext';
import { LoginPage } from './LoginPage';

const noop = async (): Promise<void> => {};

function renderLoginPage(overrides?: Partial<AuthContextValue>): {
  loginMock: ReturnType<typeof vi.fn>;
} {
  const loginMock = vi.fn<(email: string, password: string) => Promise<void>>().mockResolvedValue(undefined);
  const value: AuthContextValue = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: loginMock,
    logout: noop,
    updateUser: () => {},
    ...overrides,
  };

  render(
    <AuthContext.Provider value={value}>
      <ToastProvider>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/calendar" element={<p>カレンダー画面</p>} />
            <Route path="/signup" element={<p>サインアップ画面</p>} />
            <Route path="/forgot-password" element={<p>パスワードリセット画面</p>} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </AuthContext.Provider>,
  );

  return { loginMock };
}

describe('LoginPage', () => {
  describe('レンダリング', () => {
    it('メールアドレス入力欄が表示される', () => {
      renderLoginPage();
      expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
    });

    it('パスワード入力欄が表示される', () => {
      renderLoginPage();
      expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
    });

    it('ログインボタンが表示される', () => {
      renderLoginPage();
      expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument();
    });

    it('サインアップ画面へのリンクが表示される', () => {
      renderLoginPage();
      expect(screen.getByText('新規登録はこちら')).toBeInTheDocument();
    });

    it('パスワードを忘れた場合のリンクが表示される', () => {
      renderLoginPage();
      expect(screen.getByText(/パスワードをお忘れ/)).toBeInTheDocument();
    });
  });

  describe('バリデーション', () => {
    it('メール未入力でsubmitするとバリデーションエラーが表示される', async () => {
      renderLoginPage();
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: 'ログイン' }));

      expect(await screen.findByText('メールアドレスを入力してください')).toBeInTheDocument();
    });

    it('パスワード未入力でsubmitするとバリデーションエラーが表示される', async () => {
      renderLoginPage();
      const user = userEvent.setup();

      await user.type(screen.getByLabelText('メールアドレス'), 'test@example.com');
      await user.click(screen.getByRole('button', { name: 'ログイン' }));

      expect(await screen.findByText('パスワードを入力してください')).toBeInTheDocument();
    });

    it('不正なメール形式でsubmitするとバリデーションエラーが表示される', async () => {
      renderLoginPage();
      const user = userEvent.setup();

      await user.type(screen.getByLabelText('メールアドレス'), 'invalid');
      await user.type(screen.getByLabelText('パスワード'), 'password');
      await user.click(screen.getByRole('button', { name: 'ログイン' }));

      expect(await screen.findByText('有効なメールアドレスを入力してください')).toBeInTheDocument();
    });
  });

  describe('API連携', () => {
    it('有効な認証情報でsubmitすると/calendarに遷移する', async () => {
      const { loginMock } = renderLoginPage();
      const user = userEvent.setup();

      await user.type(screen.getByLabelText('メールアドレス'), 'test@example.com');
      await user.type(screen.getByLabelText('パスワード'), 'Password1!');
      await user.click(screen.getByRole('button', { name: 'ログイン' }));

      await waitFor(() => {
        expect(loginMock).toHaveBeenCalledWith('test@example.com', 'Password1!');
      });
      expect(screen.getByText('カレンダー画面')).toBeInTheDocument();
    });

    it('AUTH_INVALID_CREDENTIALSの場合エラーメッセージが表示される', async () => {
      const { loginMock } = renderLoginPage();
      const { ApiError } = await import('../../api/client');
      loginMock.mockRejectedValueOnce(
        new ApiError('AUTH_INVALID_CREDENTIALS', 401, 'メールアドレスまたはパスワードが正しくありません'),
      );
      const user = userEvent.setup();

      await user.type(screen.getByLabelText('メールアドレス'), 'test@example.com');
      await user.type(screen.getByLabelText('パスワード'), 'wrong');
      await user.click(screen.getByRole('button', { name: 'ログイン' }));

      expect(await screen.findByText('メールアドレスまたはパスワードが正しくありません')).toBeInTheDocument();
    });

    it('AUTH_LOCKED_OUTの場合ロックメッセージが表示される', async () => {
      const { loginMock } = renderLoginPage();
      const { ApiError } = await import('../../api/client');
      loginMock.mockRejectedValueOnce(
        new ApiError('AUTH_LOCKED_OUT', 429, 'ロック中'),
      );
      const user = userEvent.setup();

      await user.type(screen.getByLabelText('メールアドレス'), 'test@example.com');
      await user.type(screen.getByLabelText('パスワード'), 'wrong');
      await user.click(screen.getByRole('button', { name: 'ログイン' }));

      expect(await screen.findByText(/ロック/)).toBeInTheDocument();
    });

    it('送信中はボタンがdisabledになる', async () => {
      const { loginMock } = renderLoginPage();
      loginMock.mockReturnValue(new Promise(() => {})); // never resolves
      const user = userEvent.setup();

      await user.type(screen.getByLabelText('メールアドレス'), 'test@example.com');
      await user.type(screen.getByLabelText('パスワード'), 'Password1!');
      await user.click(screen.getByRole('button', { name: 'ログイン' }));

      expect(screen.getByRole('button', { name: /ログイン/ })).toBeDisabled();
    });
  });
});
