import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from '../../contexts/auth-context-value';
import type { AuthContextValue } from '../../contexts/auth-context-value';
import { ToastProvider } from '../../contexts/ToastContext';
import { ActivatePage } from './ActivatePage';
import { ApiError } from '../../api/client';

const activateMock = vi.fn();
vi.mock('../../api/auth', () => ({
  createAuthApi: () => ({
    activate: (...args: unknown[]) => activateMock(...args),
  }),
}));

const noop = async (): Promise<void> => {};

function getInput(id: string): HTMLInputElement {
  return document.getElementById(id) as HTMLInputElement;
}

function renderActivatePage(token?: string, overrides?: Partial<AuthContextValue>): {
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
  const path = token ? `/activate?token=${token}` : '/activate';

  render(
    <AuthContext.Provider value={value}>
      <ToastProvider>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="/activate" element={<ActivatePage />} />
            <Route path="/calendar" element={<p>calendar</p>} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </AuthContext.Provider>,
  );

  return { loginMock };
}

describe('ActivatePage', () => {
  beforeEach(() => {
    activateMock.mockReset();
    activateMock.mockResolvedValue({
      accessToken: 'token',
      user: { id: '1', email: 'a@b.com', displayName: 'Test', role: 'GENERAL_USER' },
    });
  });

  describe('URL parameter', () => {
    it('token missing shows error', () => {
      renderActivatePage();
      expect(screen.getByText(/invalid|無効/i)).toBeInTheDocument();
    });

    it('token present shows form', () => {
      renderActivatePage('valid-token');
      expect(getInput('displayName')).toBeInTheDocument();
      expect(getInput('password')).toBeInTheDocument();
    });
  });

  describe('validation', () => {
    it('empty displayName shows error', async () => {
      renderActivatePage('token');
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: /有効化/ }));

      await waitFor(() => {
        expect(screen.getByText(/表示名を入力/)).toBeInTheDocument();
      });
    });

    it('short password shows error', async () => {
      renderActivatePage('token');
      const user = userEvent.setup();

      await user.type(getInput('displayName'), 'Test');
      await user.type(getInput('password'), 'Ab1!');
      await user.type(getInput('passwordConfirm'), 'Ab1!');
      await user.click(screen.getByRole('button', { name: /有効化/ }));

      await waitFor(() => {
        expect(screen.getByText(/8文字以上/)).toBeInTheDocument();
      });
    });

    it('password mismatch shows error', async () => {
      renderActivatePage('token');
      const user = userEvent.setup();

      await user.type(getInput('displayName'), 'Test');
      await user.type(getInput('password'), 'Abcdef1!');
      await user.type(getInput('passwordConfirm'), 'different');
      await user.click(screen.getByRole('button', { name: /有効化/ }));

      await waitFor(() => {
        expect(screen.getByText(/一致しません/)).toBeInTheDocument();
      });
    });
  });

  describe('API', () => {
    it('successful activation calls activate and login', async () => {
      const { loginMock } = renderActivatePage('valid-token');
      const user = userEvent.setup();

      await user.type(getInput('displayName'), 'Test');
      await user.type(getInput('password'), 'Abcdef1!');
      await user.type(getInput('passwordConfirm'), 'Abcdef1!');
      await user.click(screen.getByRole('button', { name: /有効化/ }));

      await waitFor(() => {
        expect(activateMock).toHaveBeenCalledWith('valid-token', 'Abcdef1!', 'Test');
      });
      await waitFor(() => {
        expect(loginMock).toHaveBeenCalled();
      });
    });

    it('invalid token shows error message', async () => {
      activateMock.mockRejectedValueOnce(new ApiError('AUTH_INVALID_TOKEN', 404, 'not found'));
      renderActivatePage('invalid-token');
      const user = userEvent.setup();

      await user.type(getInput('displayName'), 'Test');
      await user.type(getInput('password'), 'Abcdef1!');
      await user.type(getInput('passwordConfirm'), 'Abcdef1!');
      await user.click(screen.getByRole('button', { name: /有効化/ }));

      await waitFor(() => {
        expect(screen.getByText(/期限切れ/)).toBeInTheDocument();
      });
    });

    it('submitting disables button', async () => {
      activateMock.mockReturnValue(new Promise(() => {}));
      renderActivatePage('token');
      const user = userEvent.setup();

      await user.type(getInput('displayName'), 'Test');
      await user.type(getInput('password'), 'Abcdef1!');
      await user.type(getInput('passwordConfirm'), 'Abcdef1!');
      await user.click(screen.getByRole('button', { name: /有効化/ }));

      expect(screen.getByRole('button', { name: /処理中/ })).toBeDisabled();
    });
  });
});
