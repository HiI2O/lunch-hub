import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from '../../contexts/ToastContext';
import { ForgotPasswordPage } from './ForgotPasswordPage';

const forgotPasswordMock = vi.fn();
vi.mock('../../api/auth', () => ({
  createAuthApi: () => ({
    forgotPassword: (...args: unknown[]) => forgotPasswordMock(...args),
  }),
}));

function renderPage(): void {
  render(
    <ToastProvider>
      <MemoryRouter initialEntries={['/forgot-password']}>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/login" element={<p>ログイン画面</p>} />
        </Routes>
      </MemoryRouter>
    </ToastProvider>,
  );
}

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    forgotPasswordMock.mockReset();
    forgotPasswordMock.mockResolvedValue({ message: 'ok' });
  });

  describe('レンダリング', () => {
    it('メールアドレス入力欄が表示される', () => {
      renderPage();
      expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
    });

    it('送信ボタンが表示される', () => {
      renderPage();
      expect(screen.getByRole('button', { name: /リセットメール/ })).toBeInTheDocument();
    });

    it('ログイン画面へのリンクが表示される', () => {
      renderPage();
      expect(screen.getByText(/ログイン画面/)).toBeInTheDocument();
    });
  });

  describe('バリデーション', () => {
    it('メール未入力でsubmitするとバリデーションエラーが表示される', async () => {
      renderPage();
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: /リセットメール/ }));

      expect(await screen.findByText('メールアドレスを入力してください')).toBeInTheDocument();
      expect(forgotPasswordMock).not.toHaveBeenCalled();
    });

    it('不正なメール形式でsubmitするとバリデーションエラーが表示される', async () => {
      renderPage();
      const user = userEvent.setup();

      await user.type(screen.getByLabelText('メールアドレス'), 'invalid');
      await user.click(screen.getByRole('button', { name: /リセットメール/ }));

      expect(await screen.findByText('有効なメールアドレスを入力してください')).toBeInTheDocument();
    });
  });

  describe('API連携', () => {
    it('送信成功時に完了メッセージが表示される', async () => {
      renderPage();
      const user = userEvent.setup();

      await user.type(screen.getByLabelText('メールアドレス'), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /リセットメール/ }));

      await waitFor(() => {
        expect(screen.getByText(/メールをご確認/)).toBeInTheDocument();
      });
      expect(forgotPasswordMock).toHaveBeenCalledWith('test@example.com');
    });

    it('送信中はボタンがdisabledになる', async () => {
      forgotPasswordMock.mockReturnValue(new Promise(() => {}));
      renderPage();
      const user = userEvent.setup();

      await user.type(screen.getByLabelText('メールアドレス'), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /リセットメール/ }));

      expect(screen.getByRole('button', { name: /送信中/ })).toBeDisabled();
    });
  });
});
