import type { ApiClient } from './client';
import type { AdminUserProfile, InviteResult, MessageResponse, UserRole } from './types';

// --- API ---

export type AdminUserApi = {
  getUsers(): Promise<AdminUserProfile[]>;
  inviteUser(email: string, role?: UserRole): Promise<InviteResult>;
  resendInvitation(userId: string): Promise<MessageResponse>;
  cancelInvitation(userId: string): Promise<MessageResponse>;
  deactivateUser(userId: string): Promise<MessageResponse>;
  reactivateUser(userId: string): Promise<MessageResponse>;
  changeRole(userId: string, role: UserRole): Promise<MessageResponse>;
  forceLogout(userId: string): Promise<MessageResponse>;
};

export function createAdminUserApi(client: ApiClient): AdminUserApi {
  return {
    getUsers() {
      return client.get<AdminUserProfile[]>('/admin/users');
    },
    inviteUser(email, role = 'GENERAL_USER') {
      return client.post<InviteResult>('/admin/users/invite', { email, role });
    },
    resendInvitation(userId) {
      return client.post<MessageResponse>(`/admin/users/${userId}/resend-invitation`);
    },
    cancelInvitation(userId) {
      return client.delete<MessageResponse>(`/admin/users/${userId}/invitation`);
    },
    deactivateUser(userId) {
      return client.put<MessageResponse>(`/admin/users/${userId}/deactivate`);
    },
    reactivateUser(userId) {
      return client.put<MessageResponse>(`/admin/users/${userId}/reactivate`);
    },
    changeRole(userId, role) {
      return client.put<MessageResponse>(`/admin/users/${userId}/role`, { role });
    },
    forceLogout(userId) {
      return client.post<MessageResponse>(`/admin/users/${userId}/force-logout`);
    },
  };
}
