import { ApiClient, ApiError } from './client';

// --- テスト用ヘルパー ---

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function errorResponse(code: string, message: string, status: number, fieldErrors?: Record<string, string[]>): Response {
  return jsonResponse({ error: { code, message, fieldErrors } }, status);
}

describe('ApiClient', () => {
  let client: ApiClient;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    client = new ApiClient({
      baseUrl: 'http://localhost:3000/api',
      fetchFn: fetchMock,
    });
  });

  // --- 基本動作 ---

  describe('基本リクエスト', () => {
    it('GETリクエストにベースURLを付与する', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ data: { id: '1' } }));

      await client.get('/users/me');

      expect(fetchMock).toHaveBeenCalledWith(
        'http://localhost:3000/api/users/me',
        expect.objectContaining({ method: 'GET', credentials: 'include' }),
      );
    });

    it('POSTリクエストでbodyをJSON送信する', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ data: { message: 'ok' } }));

      await client.post('/auth/login', { email: 'a@b.com', password: 'pass' });

      const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(options.method).toBe('POST');
      expect(options.headers).toEqual(expect.objectContaining({
        'Content-Type': 'application/json',
      }));
      expect(JSON.parse(options.body as string)).toEqual({
        email: 'a@b.com',
        password: 'pass',
      });
    });

    it('PUT/DELETEリクエストを送信できる', async () => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse({ data: {} }))
        .mockResolvedValueOnce(jsonResponse({ data: {} }));

      await client.put('/users/me', { displayName: 'test' });
      await client.delete('/reservations/1');

      expect(fetchMock.mock.calls[0]![1]).toEqual(expect.objectContaining({ method: 'PUT' }));
      expect(fetchMock.mock.calls[1]![1]).toEqual(expect.objectContaining({ method: 'DELETE' }));
    });

    it('bodyがない場合Content-Typeヘッダーを付与しない', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ data: {} }));

      await client.get('/test');

      const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect((options.headers as Record<string, string>)['Content-Type']).toBeUndefined();
    });

    it('レスポンスのdataフィールドを返す', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ data: { id: '1', name: 'test' } }));

      const result = await client.get<{ id: string; name: string }>('/test');

      expect(result).toEqual({ id: '1', name: 'test' });
    });
  });

  // --- accessToken ---

  describe('認証ヘッダー', () => {
    it('accessTokenが設定されている場合Authorizationヘッダーを付与する', async () => {
      client.setAccessToken('my-token');
      fetchMock.mockResolvedValueOnce(jsonResponse({ data: {} }));

      await client.get('/users/me');

      const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect((options.headers as Record<string, string>)['Authorization']).toBe('Bearer my-token');
    });

    it('accessTokenが未設定の場合Authorizationヘッダーを付与しない', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ data: {} }));

      await client.get('/auth/login');

      const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect((options.headers as Record<string, string>)['Authorization']).toBeUndefined();
    });
  });

  // --- エラーハンドリング ---

  describe('エラーハンドリング', () => {
    it('APIエラーレスポンスをApiErrorに変換する', async () => {
      fetchMock.mockResolvedValueOnce(
        errorResponse('AUTH_INVALID_CREDENTIALS', 'メールアドレスまたはパスワードが正しくありません', 401),
      );

      const error = await client.post('/auth/login', {}).catch((e: unknown) => e);

      expect(error).toBeInstanceOf(ApiError);
      expect(error).toHaveProperty('code', 'AUTH_INVALID_CREDENTIALS');
      expect(error).toHaveProperty('status', 401);
      expect(error).toHaveProperty('message', 'メールアドレスまたはパスワードが正しくありません');
    });

    it('VALIDATION_ERRORでfieldErrorsを含む', async () => {
      fetchMock.mockResolvedValueOnce(
        errorResponse('VALIDATION_ERROR', 'バリデーションエラー', 400, {
          email: ['メールアドレスの形式が不正です'],
          password: ['8文字以上必要です', '記号を含めてください'],
        }),
      );

      const error = await client.post('/auth/signup', {}).catch((e: unknown) => e) as ApiError;

      expect(error.fieldErrors).toEqual({
        email: ['メールアドレスの形式が不正です'],
        password: ['8文字以上必要です', '記号を含めてください'],
      });
    });

    it('ネットワークエラーをApiErrorに変換する', async () => {
      fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      const error = await client.get('/test').catch((e: unknown) => e);

      expect(error).toBeInstanceOf(ApiError);
      expect(error).toHaveProperty('code', 'NETWORK_ERROR');
      expect(error).toHaveProperty('status', 0);
    });

    it('レスポンスボディがJSONパース不能な場合UNKNOWN_ERRORを返す', async () => {
      fetchMock.mockResolvedValueOnce(
        new Response('Internal Server Error', { status: 500 }),
      );

      const error = await client.get('/test').catch((e: unknown) => e) as ApiError;

      expect(error).toBeInstanceOf(ApiError);
      expect(error.code).toBe('UNKNOWN_ERROR');
      expect(error.status).toBe(500);
    });
  });

  // --- トークンリフレッシュ ---

  describe('自動トークンリフレッシュ', () => {
    it('401 TOKEN_EXPIREDでリフレッシュ後にリトライする', async () => {
      client.setAccessToken('expired-token');
      client.setRefreshHandler(async () => 'new-token');

      fetchMock
        .mockResolvedValueOnce(errorResponse('AUTH_TOKEN_EXPIRED', 'トークン期限切れ', 401))
        .mockResolvedValueOnce(jsonResponse({ data: { id: '1' } }));

      const result = await client.get<{ id: string }>('/users/me');

      expect(result).toEqual({ id: '1' });
      expect(fetchMock).toHaveBeenCalledTimes(2);
      // リトライ時に新しいトークンが使われる
      const [, retryOptions] = fetchMock.mock.calls[1] as [string, RequestInit];
      expect((retryOptions.headers as Record<string, string>)['Authorization']).toBe('Bearer new-token');
    });

    it('401 TOKEN_EXPIRED以外ではリフレッシュせずエラーを返す', async () => {
      client.setAccessToken('token');
      client.setRefreshHandler(async () => 'new-token');

      fetchMock.mockResolvedValueOnce(
        errorResponse('AUTH_INVALID_CREDENTIALS', '認証失敗', 401),
      );

      const error = await client.get('/test').catch((e: unknown) => e);

      expect(error).toBeInstanceOf(ApiError);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('リフレッシュハンドラ未設定時はリフレッシュせずエラーを返す', async () => {
      client.setAccessToken('expired-token');

      fetchMock.mockResolvedValueOnce(
        errorResponse('AUTH_TOKEN_EXPIRED', 'トークン期限切れ', 401),
      );

      const error = await client.get('/test').catch((e: unknown) => e);

      expect(error).toBeInstanceOf(ApiError);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('リフレッシュ失敗時はリトライせずエラーを返す', async () => {
      client.setAccessToken('expired-token');
      client.setRefreshHandler(async () => { throw new Error('refresh failed'); });

      fetchMock.mockResolvedValueOnce(
        errorResponse('AUTH_TOKEN_EXPIRED', 'トークン期限切れ', 401),
      );

      const error = await client.get('/test').catch((e: unknown) => e);

      expect(error).toBeInstanceOf(ApiError);
      expect(error).toHaveProperty('code', 'AUTH_TOKEN_EXPIRED');
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('リトライ後の401では再リフレッシュせずエラーを返す', async () => {
      let refreshCallCount = 0;
      client.setAccessToken('expired-token');
      client.setRefreshHandler(async () => {
        refreshCallCount++;
        return 'new-token';
      });

      // 元リクエスト: 401 → リフレッシュ → リトライも401
      fetchMock
        .mockResolvedValueOnce(errorResponse('AUTH_TOKEN_EXPIRED', 'トークン期限切れ', 401))
        .mockResolvedValueOnce(errorResponse('AUTH_TOKEN_EXPIRED', 'トークン期限切れ', 401));

      const error = await client.get('/test').catch((e: unknown) => e);

      expect(error).toBeInstanceOf(ApiError);
      expect(error).toHaveProperty('code', 'AUTH_TOKEN_EXPIRED');
      expect(refreshCallCount).toBe(1);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });

  // --- リフレッシュ排他制御 ---

  describe('リフレッシュ排他制御', () => {
    it('同時に複数の401が発生してもリフレッシュは1回だけ実行される', async () => {
      let refreshCallCount = 0;
      client.setAccessToken('expired-token');
      client.setRefreshHandler(async () => {
        refreshCallCount++;
        return 'new-token';
      });

      // 3つのリクエストが同時に401を返す
      fetchMock
        .mockResolvedValueOnce(errorResponse('AUTH_TOKEN_EXPIRED', '', 401))
        .mockResolvedValueOnce(errorResponse('AUTH_TOKEN_EXPIRED', '', 401))
        .mockResolvedValueOnce(errorResponse('AUTH_TOKEN_EXPIRED', '', 401))
        // リトライ時は全て成功
        .mockResolvedValueOnce(jsonResponse({ data: { id: '1' } }))
        .mockResolvedValueOnce(jsonResponse({ data: { id: '2' } }))
        .mockResolvedValueOnce(jsonResponse({ data: { id: '3' } }));

      const results = await Promise.all([
        client.get<{ id: string }>('/a'),
        client.get<{ id: string }>('/b'),
        client.get<{ id: string }>('/c'),
      ]);

      expect(refreshCallCount).toBe(1);
      expect(results).toEqual([{ id: '1' }, { id: '2' }, { id: '3' }]);
    });
  });
});
