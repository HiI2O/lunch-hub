import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from '../../contexts/ToastContext';
import { SignupPage } from './SignupPage';
import { ApiError } from '../../api/client';

// createAuthApiをモックして、signup関数を制御
const signupMock = vi.fn();
vi.mock('../../api/auth', () => ({
  createAuthApi: () => ({
    signup: (...args: unknown[]) => signupMock(...args),
  }),
}));

function renderSignupPage(): void {
  render(
    <ToastProvider>
      <MemoryRouter initialEntries={['/signup']}>
        <Routes>
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<p>ログイン画面</p>} />
        </Routes>
      </MemoryRouter>
    </ToastProvider>,
  );
}

describe('SignupPage', () => {
  beforeEach(() => {
    signupMock.mockReset();
    signupMock.mockResolvedValue({ message: 'ok' });
  });

  describe('レンダリング', () => {
    it('メールアドレス入力欄が表示される', () => {
      renderSignupPage();
      expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
    });

    it('PINコード入力欄が表示される', () => {
      renderSignupPage();
      expect(screen.getByLabelText(/PIN/)).toBeInTheDocument();
    });

    it('登録ボタンが表示される', () => {
      renderSignupPage();
      expect(screen.getByRole('button', { name: /登録/ })).toBeInTheDocument();
    });

    it('ログイン画面へのリンクが表示される', () => {
      renderSignupPage();
      expect(screen.getByText(/ログイン画面/)).toBeInTheDocument();
    });
  });

  describe('バリデーション', () => {
    it('メール未入力でsubmitするとバリデーションエラーが表示される', async () => {
      renderSignupPage();
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: /登録/ }));

      expect(await screen.findByText('メールアドレスを入力してください')).toBeInTheDocument();
      expect(signupMock).not.toHaveBeenCalled();
    });

    it('不正なメール形式でsubmitするとバリデーションエラーが表示される', async () => {
      renderSignupPage();
      const user = userEvent.setup();

      await user.type(screen.getByLabelText('メールアドレス'), 'invalid');
      await user.type(screen.getByLabelText(/PIN/), 'abc123');
      await user.click(screen.getByRole('button', { name: /登録/ }));

      expect(await screen.findByText('有効なメールアドレスを入力してください')).toBeInTheDocument();
      expect(signupMock).not.toHaveBeenCalled();
    });

    it('PIN未入力でsubmitするとバリデーションエラーが表示される', async () => {
      renderSignupPage();
      const user = userEvent.setup();

      await user.type(screen.getByLabelText('メールアドレス'), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /登録/ }));

      expect(await screen.findByText('PINを入力してください')).toBeInTheDocument();
      expect(signupMock).not.toHaveBeenCalled();
    });

    it('PINが6文字未満でsubmitするとバリデーションエラーが表示される', async () => {
      renderSignupPage();
      const user = userEvent.setup();

      await user.type(screen.getByLabelText('メールアドレス'), 'test@example.com');
      await user.type(screen.getByLabelText(/PIN/), 'abc');
      await user.click(screen.getByRole('button', { name: /登録/ }));

      expect(await screen.findByText(/6文字以上/)).toBeInTheDocument();
      expect(signupMock).not.toHaveBeenCalled();
    });
  });

  describe('API連携', () => {
    it('登録成功時に完了メッセージが表示される', async () => {
      renderSignupPage();
      const user = userEvent.setup();

      await user.type(screen.getByLabelText('メールアドレス'), 'test@example.com');
      await user.type(screen.getByLabelText(/PIN/), 'abc123');
      await user.click(screen.getByRole('button', { name: /登録/ }));

      await waitFor(() => {
        expect(screen.getByText(/メールをご確認/)).toBeInTheDocument();
      });
      expect(signupMock).toHaveBeenCalledWith('test@example.com', 'abc123');
    });

    it('APIエラー時にエラーメッセージが表示される', async () => {
      signupMock.mockRejectedValueOnce(new ApiError('VALIDATION_ERROR', 400, 'PIN が正しくありません'));
      renderSignupPage();
      const user = userEvent.setup();

      await user.type(screen.getByLabelText('メールアドレス'), 'test@example.com');
      await user.type(screen.getByLabelText(/PIN/), 'abc123');
      await user.click(screen.getByRole('button', { name: /登録/ }));

      expect(await screen.findByText(/PIN が正しくありません/)).toBeInTheDocument();
    });

    it('送信中はボタンがdisabledになる', async () => {
      signupMock.mockReturnValue(new Promise(() => {})); // never resolves
      renderSignupPage();
      const user = userEvent.setup();

      await user.type(screen.getByLabelText('メールアドレス'), 'test@example.com');
      await user.type(screen.getByLabelText(/PIN/), 'abc123');
      await user.click(screen.getByRole('button', { name: /登録/ }));

      expect(screen.getByRole('button', { name: /送信中/ })).toBeDisabled();
    });
  });
});
