import { ApiClient } from './client';
import { createAuthApi } from './auth';
import type { LoginResponse, MessageResponse, RefreshResponse, UserProfile } from './types';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('authApi', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let authApi: ReturnType<typeof createAuthApi>;

  beforeEach(() => {
    fetchMock = vi.fn();
    const client = new ApiClient({
      baseUrl: 'http://localhost:3000/api',
      fetchFn: fetchMock,
    });
    authApi = createAuthApi(client);
  });

  it('login: POST /auth/login を呼びレスポンスを返す', async () => {
    const loginData: LoginResponse = {
      accessToken: 'token-123',
      user: { id: '1', email: 'a@b.com', displayName: '田中', role: 'GENERAL_USER' },
    };
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: loginData }));

    const result = await authApi.login('a@b.com', 'password');

    expect(result).toEqual(loginData);
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://localhost:3000/api/auth/login');
    expect(JSON.parse(options.body as string)).toEqual({ email: 'a@b.com', password: 'password' });
  });

  it('logout: POST /auth/logout を呼ぶ', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: { message: 'ok' } }));

    await authApi.logout();

    expect(fetchMock.mock.calls[0]![0]).toBe('http://localhost:3000/api/auth/logout');
  });

  it('refresh: POST /auth/refresh を呼びトークンを返す', async () => {
    const refreshData: RefreshResponse = { accessToken: 'new-token' };
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: refreshData }));

    const result = await authApi.refresh();

    expect(result).toEqual(refreshData);
    expect(fetchMock.mock.calls[0]![0]).toBe('http://localhost:3000/api/auth/refresh');
  });

  it('signup: POST /auth/signup を呼ぶ', async () => {
    const msgData: MessageResponse = { message: '招待メールを送信しました' };
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: msgData }));

    const result = await authApi.signup('a@b.com', 'pin123');

    expect(result).toEqual(msgData);
    const body = JSON.parse((fetchMock.mock.calls[0]![1] as RequestInit).body as string);
    expect(body).toEqual({ email: 'a@b.com', pin: 'pin123' });
  });

  it('activate: POST /auth/activate を呼ぶ', async () => {
    const loginData: LoginResponse = {
      accessToken: 'token',
      user: { id: '1', email: 'a@b.com', displayName: '田中', role: 'GENERAL_USER' },
    };
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: loginData }));

    const result = await authApi.activate('tok', 'Pass1!aa', '田中');

    expect(result).toEqual(loginData);
    const body = JSON.parse((fetchMock.mock.calls[0]![1] as RequestInit).body as string);
    expect(body).toEqual({ token: 'tok', password: 'Pass1!aa', displayName: '田中' });
  });

  it('forgotPassword: POST /auth/forgot-password を呼ぶ', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: { message: 'ok' } }));

    await authApi.forgotPassword('a@b.com');

    const body = JSON.parse((fetchMock.mock.calls[0]![1] as RequestInit).body as string);
    expect(body).toEqual({ email: 'a@b.com' });
  });

  it('resetPassword: POST /auth/reset-password を呼ぶ', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: { message: 'ok' } }));

    await authApi.resetPassword('tok', 'NewPass1!');

    const body = JSON.parse((fetchMock.mock.calls[0]![1] as RequestInit).body as string);
    expect(body).toEqual({ token: 'tok', password: 'NewPass1!' });
  });

  it('changePassword: PUT /users/me/password を呼ぶ', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: { message: 'ok' } }));

    await authApi.changePassword('old', 'new');

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://localhost:3000/api/users/me/password');
    expect((options as RequestInit).method).toBe('PUT');
    expect(JSON.parse(options.body as string)).toEqual({ currentPassword: 'old', newPassword: 'new' });
  });

  it('getProfile: GET /users/me を呼ぶ', async () => {
    const profile: UserProfile = {
      id: '1', email: 'a@b.com', displayName: '田中',
      role: 'GENERAL_USER', status: 'ACTIVE',
      createdAt: '2026-01-01T00:00:00Z', lastLoginAt: null,
    };
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: profile }));

    const result = await authApi.getProfile();

    expect(result).toEqual(profile);
    expect(fetchMock.mock.calls[0]![0]).toBe('http://localhost:3000/api/users/me');
  });
});
