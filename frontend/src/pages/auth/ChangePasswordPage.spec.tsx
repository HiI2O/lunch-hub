import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../contexts/auth-context-value';
import type { AuthContextValue } from '../../contexts/auth-context-value';
import { ToastProvider } from '../../contexts/ToastContext';
import { ChangePasswordPage } from './ChangePasswordPage';
import { ApiError } from '../../api/client';

const changePasswordMock = vi.fn();
vi.mock('../../api/auth', () => ({
  createAuthApi: () => ({
    changePassword: (...args: unknown[]) => changePasswordMock(...args),
  }),
}));

const noop = async (): Promise<void> => {};

function renderPage(): void {
  const value: AuthContextValue = {
    user: { id: '1', email: 'test@example.com', displayName: 'Test', role: 'GENERAL_USER' },
    isAuthenticated: true,
    isLoading: false,
    login: noop,
    logout: noop,
    updateUser: () => {},
  };

  render(
    <AuthContext.Provider value={value}>
      <ToastProvider>
        <MemoryRouter>
          <ChangePasswordPage />
        </MemoryRouter>
      </ToastProvider>
    </AuthContext.Provider>,
  );
}

describe('ChangePasswordPage', () => {
  beforeEach(() => {
    changePasswordMock.mockReset();
    changePasswordMock.mockResolvedValue({ message: 'ok' });
  });

  describe('レンダリング', () => {
    it('現在のパスワード入力欄が表示される', () => {
      renderPage();
      expect(screen.getByLabelText('現在のパスワード')).toBeInTheDocument();
    });

    it('新しいパスワード入力欄が表示される', () => {
      renderPage();
      expect(screen.getByLabelText('新しいパスワード')).toBeInTheDocument();
    });

    it('変更ボタンが表示される', () => {
      renderPage();
      expect(screen.getByRole('button', { name: /パスワードを変更/ })).toBeInTheDocument();
    });
  });

  describe('バリデーション', () => {
    it('現在のパスワード未入力でsubmitするとバリデーションエラーが表示される', async () => {
      renderPage();
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: /パスワードを変更/ }));

      expect(await screen.findByText(/現在のパスワードを入力/)).toBeInTheDocument();
    });

    it('新しいパスワードがポリシー違反の場合バリデーションエラーが表示される', async () => {
      renderPage();
      const user = userEvent.setup();

      await user.type(screen.getByLabelText('現在のパスワード'), 'OldPass1!');
      await user.type(screen.getByLabelText('新しいパスワード'), 'short');
      await user.type(screen.getByLabelText('新しいパスワード（確認）'), 'short');
      await user.click(screen.getByRole('button', { name: /パスワードを変更/ }));

      expect(await screen.findByText(/8文字以上/)).toBeInTheDocument();
    });
  });

  describe('API連携', () => {
    it('変更成功時にトースト通知が表示される', async () => {
      renderPage();
      const user = userEvent.setup();

      await user.type(screen.getByLabelText('現在のパスワード'), 'OldPass1!');
      await user.type(screen.getByLabelText('新しいパスワード'), 'NewPass1!');
      await user.type(screen.getByLabelText('新しいパスワード（確認）'), 'NewPass1!');
      await user.click(screen.getByRole('button', { name: /パスワードを変更/ }));

      await waitFor(() => {
        expect(changePasswordMock).toHaveBeenCalledWith('OldPass1!', 'NewPass1!');
      });
      // トースト通知
      expect(screen.getByText('パスワードを変更しました')).toBeInTheDocument();
    });

    it('現在のパスワード不正時にエラーメッセージが表示される', async () => {
      changePasswordMock.mockRejectedValueOnce(
        new ApiError('AUTH_INVALID_CREDENTIALS', 401, '現在のパスワードが正しくありません'),
      );
      renderPage();
      const user = userEvent.setup();

      await user.type(screen.getByLabelText('現在のパスワード'), 'wrong');
      await user.type(screen.getByLabelText('新しいパスワード'), 'NewPass1!');
      await user.type(screen.getByLabelText('新しいパスワード（確認）'), 'NewPass1!');
      await user.click(screen.getByRole('button', { name: /パスワードを変更/ }));

      expect(await screen.findByText(/現在のパスワードが正しくありません/)).toBeInTheDocument();
    });

    it('送信中はボタンがdisabledになる', async () => {
      changePasswordMock.mockReturnValue(new Promise(() => {}));
      renderPage();
      const user = userEvent.setup();

      await user.type(screen.getByLabelText('現在のパスワード'), 'OldPass1!');
      await user.type(screen.getByLabelText('新しいパスワード'), 'NewPass1!');
      await user.type(screen.getByLabelText('新しいパスワード（確認）'), 'NewPass1!');
      await user.click(screen.getByRole('button', { name: /パスワードを変更/ }));

      expect(screen.getByRole('button', { name: /変更中/ })).toBeDisabled();
    });
  });
});
