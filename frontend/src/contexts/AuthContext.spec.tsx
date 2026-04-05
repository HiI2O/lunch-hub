import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from './AuthContext';
import { useAuth } from '../hooks/useAuth';
import { ApiClient } from '../api/client';
import type { LoginResponse, RefreshResponse, UserProfile } from '../api/types';

// --- テスト用ヘルパー ---

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function errorResponse(code: string, message: string, status: number): Response {
  return jsonResponse({ error: { code, message } }, status);
}

const mockUser = {
  id: '1',
  email: 'test@example.com',
  displayName: 'テストユーザー',
  role: 'GENERAL_USER' as const,
};

const mockProfile: UserProfile = {
  ...mockUser,
  status: 'ACTIVE',
  createdAt: '2026-01-01T00:00:00Z',
  lastLoginAt: null,
};

function AuthConsumer(): React.JSX.Element {
  const { user, isAuthenticated, isLoading, login, logout, updateUser } = useAuth();
  return (
    <div>
      <p data-testid="loading">{String(isLoading)}</p>
      <p data-testid="authenticated">{String(isAuthenticated)}</p>
      <p data-testid="user">{user ? user.displayName : 'null'}</p>
      <p data-testid="role">{user ? user.role : 'null'}</p>
      <button onClick={() => login('a@b.com', 'pass')}>ログイン</button>
      <button onClick={() => logout()}>ログアウト</button>
      <button onClick={() => updateUser({ ...mockUser, displayName: '更新済み' })}>更新</button>
    </div>
  );
}

function createTestClient(fetchMock: ReturnType<typeof vi.fn>): ApiClient {
  return new ApiClient({
    baseUrl: 'http://localhost:3000/api',
    fetchFn: fetchMock,
  });
}

describe('AuthContext', () => {
  // --- 初期化 ---

  describe('初期化', () => {
    it('初期化中はisLoading=trueを返す', () => {
      const fetchMock = vi.fn().mockReturnValue(new Promise(() => {})); // never resolves
      const client = createTestClient(fetchMock);

      render(
        <AuthProvider client={client}>
          <AuthConsumer />
        </AuthProvider>,
      );

      expect(screen.getByTestId('loading')).toHaveTextContent('true');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });

    it('リフレッシュ成功時に認証済み状態になる', async () => {
      const fetchMock = vi.fn();
      // refresh → accessToken取得
      fetchMock.mockResolvedValueOnce(
        jsonResponse({ data: { accessToken: 'new-token' } satisfies RefreshResponse }),
      );
      // getProfile → ユーザー情報取得
      fetchMock.mockResolvedValueOnce(
        jsonResponse({ data: mockProfile }),
      );
      const client = createTestClient(fetchMock);

      render(
        <AuthProvider client={client}>
          <AuthConsumer />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('user')).toHaveTextContent('テストユーザー');
    });

    it('リフレッシュ失敗時に未認証状態になる', async () => {
      const fetchMock = vi.fn();
      fetchMock.mockResolvedValueOnce(
        errorResponse('AUTH_INVALID_TOKEN', '無効なトークン', 401),
      );
      const client = createTestClient(fetchMock);

      render(
        <AuthProvider client={client}>
          <AuthConsumer />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('user')).toHaveTextContent('null');
    });
  });

  // --- ログイン ---

  describe('ログイン', () => {
    it('ログイン成功時に認証済み状態になる', async () => {
      const fetchMock = vi.fn();
      // 初期化: リフレッシュ失敗
      fetchMock.mockResolvedValueOnce(
        errorResponse('AUTH_INVALID_TOKEN', '', 401),
      );
      const client = createTestClient(fetchMock);
      const user = userEvent.setup();

      render(
        <AuthProvider client={client}>
          <AuthConsumer />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      // ログインAPI
      const loginData: LoginResponse = { accessToken: 'token-123', user: mockUser };
      fetchMock.mockResolvedValueOnce(jsonResponse({ data: loginData }));

      await user.click(screen.getByText('ログイン'));

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      });
      expect(screen.getByTestId('user')).toHaveTextContent('テストユーザー');
    });

    it('ログイン失敗時はエラーをthrowする', async () => {
      const fetchMock = vi.fn();
      // 初期化: リフレッシュ失敗
      fetchMock.mockResolvedValueOnce(
        errorResponse('AUTH_INVALID_TOKEN', '', 401),
      );
      const client = createTestClient(fetchMock);

      // エラーをキャッチするコンポーネント
      let loginError: Error | null = null;
      function ErrorCatcher(): React.JSX.Element {
        const { isLoading, login } = useAuth();
        return (
          <div>
            <p data-testid="loading">{String(isLoading)}</p>
            <button onClick={async () => {
              try { await login('a@b.com', 'wrong'); } catch (e) { loginError = e as Error; }
            }}>ログイン</button>
          </div>
        );
      }

      const userEv = userEvent.setup();
      render(
        <AuthProvider client={client}>
          <ErrorCatcher />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      fetchMock.mockResolvedValueOnce(
        errorResponse('AUTH_INVALID_CREDENTIALS', '認証失敗', 401),
      );

      await userEv.click(screen.getByText('ログイン'));

      await waitFor(() => {
        expect(loginError).not.toBeNull();
      });
      expect(loginError!.message).toBe('認証失敗');
    });
  });

  // --- ログアウト ---

  describe('ログアウト', () => {
    it('ログアウト後に未認証状態になる', async () => {
      const fetchMock = vi.fn();
      // 初期化: リフレッシュ成功
      fetchMock.mockResolvedValueOnce(
        jsonResponse({ data: { accessToken: 'token' } satisfies RefreshResponse }),
      );
      fetchMock.mockResolvedValueOnce(
        jsonResponse({ data: mockProfile }),
      );
      const client = createTestClient(fetchMock);
      const user = userEvent.setup();

      render(
        <AuthProvider client={client}>
          <AuthConsumer />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      });

      // ログアウトAPI
      fetchMock.mockResolvedValueOnce(jsonResponse({ data: { message: 'ok' } }));

      await user.click(screen.getByText('ログアウト'));

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
      });
      expect(screen.getByTestId('user')).toHaveTextContent('null');
    });
  });

  // --- updateUser ---

  describe('updateUser', () => {
    it('ユーザー情報を更新できる', async () => {
      const fetchMock = vi.fn();
      // 初期化: リフレッシュ成功
      fetchMock.mockResolvedValueOnce(
        jsonResponse({ data: { accessToken: 'token' } satisfies RefreshResponse }),
      );
      fetchMock.mockResolvedValueOnce(
        jsonResponse({ data: mockProfile }),
      );
      const client = createTestClient(fetchMock);
      const user = userEvent.setup();

      render(
        <AuthProvider client={client}>
          <AuthConsumer />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('テストユーザー');
      });

      await user.click(screen.getByText('更新'));

      expect(screen.getByTestId('user')).toHaveTextContent('更新済み');
    });
  });

  // --- ログアウト（API失敗時） ---

  describe('ログアウト（API失敗時）', () => {
    it('logout APIが失敗しても未認証状態になる', async () => {
      const fetchMock = vi.fn();
      // 初期化: リフレッシュ成功
      fetchMock.mockResolvedValueOnce(
        jsonResponse({ data: { accessToken: 'token' } satisfies RefreshResponse }),
      );
      fetchMock.mockResolvedValueOnce(
        jsonResponse({ data: mockProfile }),
      );
      const client = createTestClient(fetchMock);

      // logoutのrejectをキャッチするコンポーネント
      function LogoutErrorCatcher(): React.JSX.Element {
        const { isAuthenticated, isLoading, logout, user: authUser } = useAuth();
        return (
          <div>
            <p data-testid="loading">{String(isLoading)}</p>
            <p data-testid="authenticated">{String(isAuthenticated)}</p>
            <p data-testid="user">{authUser ? authUser.displayName : 'null'}</p>
            <button onClick={() => { logout().catch(() => {}); }}>ログアウト</button>
          </div>
        );
      }

      const user = userEvent.setup();

      render(
        <AuthProvider client={client}>
          <LogoutErrorCatcher />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      });

      // ログアウトAPIがネットワークエラーで失敗
      fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await user.click(screen.getByText('ログアウト'));

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
      });
      expect(screen.getByTestId('user')).toHaveTextContent('null');
    });
  });

  // --- useAuthのProvider外使用 ---

  describe('useAuth', () => {
    it('AuthProvider外で使用するとエラーをthrowする', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<AuthConsumer />);
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleSpy.mockRestore();
    });
  });

  // --- リフレッシュハンドラ ---

  describe('トークンリフレッシュ連携', () => {
    it('clientにリフレッシュハンドラが設定される', async () => {
      const fetchMock = vi.fn();
      // 初期化: リフレッシュ失敗
      fetchMock.mockResolvedValueOnce(
        errorResponse('AUTH_INVALID_TOKEN', '', 401),
      );
      const client = createTestClient(fetchMock);

      render(
        <AuthProvider client={client}>
          <AuthConsumer />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      // ログインしてトークンを設定
      const loginData: LoginResponse = { accessToken: 'token-1', user: mockUser };
      fetchMock.mockResolvedValueOnce(jsonResponse({ data: loginData }));

      await act(async () => {
        screen.getByText('ログイン').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      });

      // 401 → 自動リフレッシュ → リトライが機能することを確認
      fetchMock
        .mockResolvedValueOnce(errorResponse('AUTH_TOKEN_EXPIRED', '', 401))  // 元リクエスト失敗
        .mockResolvedValueOnce(jsonResponse({ data: { accessToken: 'token-2' } satisfies RefreshResponse }))  // リフレッシュ
        .mockResolvedValueOnce(jsonResponse({ data: mockProfile }));  // リトライ成功

      const profile = await client.get<UserProfile>('/users/me');
      expect(profile.displayName).toBe('テストユーザー');
    });
  });
});
