import type { ApiClient } from './client';
import type { LoginResponse, MessageResponse, RefreshResponse, UserProfile } from './types';

export type AuthApi = {
  login(email: string, password: string): Promise<LoginResponse>;
  logout(): Promise<MessageResponse>;
  refresh(): Promise<RefreshResponse>;
  signup(email: string, pin: string): Promise<MessageResponse>;
  activate(token: string, password: string, displayName: string): Promise<LoginResponse>;
  forgotPassword(email: string): Promise<MessageResponse>;
  resetPassword(token: string, password: string): Promise<MessageResponse>;
  changePassword(currentPassword: string, newPassword: string): Promise<MessageResponse>;
  getProfile(): Promise<UserProfile>;
};

export function createAuthApi(client: ApiClient): AuthApi {
  return {
    login(email, password) {
      return client.post<LoginResponse>('/auth/login', { email, password });
    },
    logout() {
      return client.post<MessageResponse>('/auth/logout');
    },
    refresh() {
      return client.post<RefreshResponse>('/auth/refresh');
    },
    signup(email, pin) {
      return client.post<MessageResponse>('/auth/signup', { email, pin });
    },
    activate(token, password, displayName) {
      return client.post<LoginResponse>('/auth/activate', { token, password, displayName });
    },
    forgotPassword(email) {
      return client.post<MessageResponse>('/auth/forgot-password', { email });
    },
    resetPassword(token, password) {
      return client.post<MessageResponse>('/auth/reset-password', { token, password });
    },
    changePassword(currentPassword, newPassword) {
      return client.put<MessageResponse>('/users/me/password', { currentPassword, newPassword });
    },
    getProfile() {
      return client.get<UserProfile>('/users/me');
    },
  };
}
