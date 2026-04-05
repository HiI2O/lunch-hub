import type { ApiErrorResponse, ApiResponse } from './types';

// --- ApiError ---

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly fieldErrors?: Record<string, string[]>;

  constructor(code: string, status: number, message: string, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

// --- ApiClient ---

type RefreshHandler = () => Promise<string>;

export type ApiClientConfig = {
  readonly baseUrl: string;
  readonly fetchFn?: typeof fetch;
};

export class ApiClient {
  private readonly baseUrl: string;
  private readonly fetchFn: typeof fetch;
  private accessToken: string | null = null;
  private refreshHandler: RefreshHandler | null = null;
  private refreshPromise: Promise<string> | null = null;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl;
    this.fetchFn = config.fetchFn ?? fetch.bind(globalThis);
  }

  setAccessToken(token: string | null): void {
    this.accessToken = token;
  }

  setRefreshHandler(handler: RefreshHandler | null): void {
    this.refreshHandler = handler;
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>('GET', path);
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('POST', path, body);
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('PUT', path, body);
  }

  async delete<T>(path: string): Promise<T> {
    return this.request<T>('DELETE', path);
  }

  private async request<T>(method: string, path: string, body?: unknown, isRetry = false): Promise<T> {
    const headers: Record<string, string> = {};

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    let response: Response;
    try {
      response = await this.fetchFn(`${this.baseUrl}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        credentials: 'include',
      });
    } catch {
      throw new ApiError('NETWORK_ERROR', 0, 'サーバーに接続できません。ネットワーク接続を確認してください。');
    }

    if (!response.ok) {
      const apiError = await this.parseErrorResponse(response);

      if (!isRetry && apiError.code === 'AUTH_TOKEN_EXPIRED' && this.refreshHandler) {
        return this.handleTokenRefresh<T>(method, path, body, apiError);
      }

      throw apiError;
    }

    const json = (await response.json()) as ApiResponse<T>;
    return json.data;
  }

  private async handleTokenRefresh<T>(
    method: string,
    path: string,
    body: unknown,
    originalError: ApiError,
  ): Promise<T> {
    try {
      const newToken = await this.refreshAccessToken();
      this.accessToken = newToken;
      return this.request<T>(method, path, body, true);
    } catch {
      throw originalError;
    }
  }

  private async refreshAccessToken(): Promise<string> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.refreshHandler!().finally(() => {
      this.refreshPromise = null;
    });

    return this.refreshPromise;
  }

  private async parseErrorResponse(response: Response): Promise<ApiError> {
    try {
      const json = (await response.json()) as ApiErrorResponse;
      return new ApiError(
        json.error.code,
        response.status,
        json.error.message,
        json.error.fieldErrors,
      );
    } catch {
      return new ApiError('UNKNOWN_ERROR', response.status, `HTTP ${response.status}`);
    }
  }
}
