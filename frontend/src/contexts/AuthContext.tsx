import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { ApiClient } from '../api/client';
import { createAuthApi } from '../api/auth';
import type { User } from '../api/types';
import { AuthContext } from './auth-context-value';
import type { AuthContextValue } from './auth-context-value';

type AuthProviderProps = {
  readonly client: ApiClient;
  readonly children: ReactNode;
};

export function AuthProvider({ client, children }: AuthProviderProps): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const authApi = useMemo(() => createAuthApi(client), [client]);

  // リフレッシュハンドラをclientに登録
  useEffect(() => {
    client.setRefreshHandler(async () => {
      const { accessToken } = await authApi.refresh();
      client.setAccessToken(accessToken);
      return accessToken;
    });

    return () => {
      client.setRefreshHandler(null);
    };
  }, [client, authApi]);

  // 初期化: リフレッシュトークンでセッション復元を試みる
  useEffect(() => {
    let cancelled = false;

    async function initialize(): Promise<void> {
      try {
        const { accessToken } = await authApi.refresh();
        client.setAccessToken(accessToken);
        const profile = await authApi.getProfile();
        if (!cancelled) {
          setUser(profile);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          client.setAccessToken(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void initialize();

    return () => {
      cancelled = true;
    };
  }, [client, authApi]);

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    const { accessToken, user: loggedInUser } = await authApi.login(email, password);
    client.setAccessToken(accessToken);
    setUser(loggedInUser);
  }, [client, authApi]);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authApi.logout();
    } finally {
      client.setAccessToken(null);
      setUser(null);
    }
  }, [client, authApi]);

  const updateUser = useCallback((updatedUser: User): void => {
    setUser(updatedUser);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: user !== null,
    isLoading,
    login,
    logout,
    updateUser,
  }), [user, isLoading, login, logout, updateUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
