import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from '../../contexts/ToastContext';
import { ResetPasswordPage } from './ResetPasswordPage';
import { ApiError } from '../../api/client';

const resetPasswordMock = vi.fn();
vi.mock('../../api/auth', () => ({
  createAuthApi: () => ({
    resetPassword: (...args: unknown[]) => resetPasswordMock(...args),
  }),
}));

function renderPage(token?: string): void {
  const path = token ? `/reset-password?token=${token}` : '/reset-password';
  render(
    <ToastProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/login" element={<p>ログイン画面</p>} />
        </Routes>
      </MemoryRouter>
    </ToastProvider>,
  );
}

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    resetPasswordMock.mockReset();
    resetPasswordMock.mockResolvedValue({ message: 'ok' });
  });

  describe('URLパラメータ', () => {
    it('トークンがない場合エラーメッセージを表示する', () => {
      renderPage();
      expect(screen.getByText(/リンクが無効です/)).toBeInTheDocument();
    });

    it('トークンがある場合フォームを表示する', () => {
      renderPage('valid-token');
      expect(screen.getByLabelText(/新しいパスワード/)).toBeInTheDocument();
    });
  });

  describe('バリデーション', () => {
    it('パスワード未入力でsubmitするとバリデーションエラーが表示される', async () => {
      renderPage('token');
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: /パスワードを変更/ }));

      expect(await screen.findByText('パスワードを入力してください')).toBeInTheDocument();
    });

    it('パスワード不一致の場合バリデーションエラーが表示される', async () => {
      renderPage('token');
      const user = userEvent.setup();

      await user.type(screen.getByLabelText('新しいパスワード'), 'Abcdef1!');
      await user.type(screen.getByLabelText('パスワード（確認）'), 'different');
      await user.click(screen.getByRole('button', { name: /パスワードを変更/ }));

      expect(await screen.findByText(/一致しません/)).toBeInTheDocument();
    });
  });

  describe('API連携', () => {
    it('リセット成功時に完了メッセージが表示される', async () => {
      renderPage('valid-token');
      const user = userEvent.setup();

      await user.type(screen.getByLabelText('新しいパスワード'), 'Abcdef1!');
      await user.type(screen.getByLabelText('パスワード（確認）'), 'Abcdef1!');
      await user.click(screen.getByRole('button', { name: /パスワードを変更/ }));

      await waitFor(() => {
        expect(screen.getByText(/パスワードを変更しました/)).toBeInTheDocument();
      });
      expect(resetPasswordMock).toHaveBeenCalledWith('valid-token', 'Abcdef1!');
    });

    it('トークン不正の場合エラーメッセージが表示される', async () => {
      resetPasswordMock.mockRejectedValueOnce(new ApiError('AUTH_INVALID_TOKEN', 410, 'expired'));
      renderPage('invalid-token');
      const user = userEvent.setup();

      await user.type(screen.getByLabelText('新しいパスワード'), 'Abcdef1!');
      await user.type(screen.getByLabelText('パスワード（確認）'), 'Abcdef1!');
      await user.click(screen.getByRole('button', { name: /パスワードを変更/ }));

      expect(await screen.findByText(/期限切れ/)).toBeInTheDocument();
    });

    it('送信中はボタンがdisabledになる', async () => {
      resetPasswordMock.mockReturnValue(new Promise(() => {}));
      renderPage('token');
      const user = userEvent.setup();

      await user.type(screen.getByLabelText('新しいパスワード'), 'Abcdef1!');
      await user.type(screen.getByLabelText('パスワード（確認）'), 'Abcdef1!');
      await user.click(screen.getByRole('button', { name: /パスワードを変更/ }));

      expect(screen.getByRole('button', { name: /処理中/ })).toBeDisabled();
    });
  });
});
