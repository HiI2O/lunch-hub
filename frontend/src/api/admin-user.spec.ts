import { describe, it, expect, vi } from 'vitest';
import { createAdminUserApi } from './admin-user';
import type { ApiClient } from './client';

function mockClient(): ApiClient {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  } as unknown as ApiClient;
}

describe('AdminUserApi', () => {
  it('getUsers は GET /admin/users を呼ぶ', async () => {
    const client = mockClient();
    const data = [{ id: 'u1' }];
    vi.mocked(client.get).mockResolvedValue(data);

    const api = createAdminUserApi(client);
    const result = await api.getUsers();

    expect(client.get).toHaveBeenCalledWith('/admin/users');
    expect(result).toBe(data);
  });

  it('inviteUser は POST /admin/users/invite を呼ぶ', async () => {
    const client = mockClient();
    const data = { userId: 'u1', email: 'test@co.com' };
    vi.mocked(client.post).mockResolvedValue(data);

    const api = createAdminUserApi(client);
    const result = await api.inviteUser('test@co.com');

    expect(client.post).toHaveBeenCalledWith('/admin/users/invite', { email: 'test@co.com', role: 'GENERAL_USER' });
    expect(result).toBe(data);
  });

  it('deactivateUser は PUT /admin/users/:id/deactivate を呼ぶ', async () => {
    const client = mockClient();
    vi.mocked(client.put).mockResolvedValue({ message: 'ok' });

    const api = createAdminUserApi(client);
    await api.deactivateUser('u1');

    expect(client.put).toHaveBeenCalledWith('/admin/users/u1/deactivate');
  });

  it('reactivateUser は PUT /admin/users/:id/reactivate を呼ぶ', async () => {
    const client = mockClient();
    vi.mocked(client.put).mockResolvedValue({ message: 'ok' });

    const api = createAdminUserApi(client);
    await api.reactivateUser('u1');

    expect(client.put).toHaveBeenCalledWith('/admin/users/u1/reactivate');
  });

  it('changeRole は PUT /admin/users/:id/role を呼ぶ', async () => {
    const client = mockClient();
    vi.mocked(client.put).mockResolvedValue({ message: 'ok' });

    const api = createAdminUserApi(client);
    await api.changeRole('u1', 'STAFF');

    expect(client.put).toHaveBeenCalledWith('/admin/users/u1/role', { role: 'STAFF' });
  });

  it('forceLogout は POST /admin/users/:id/force-logout を呼ぶ', async () => {
    const client = mockClient();
    vi.mocked(client.post).mockResolvedValue({ message: 'ok' });

    const api = createAdminUserApi(client);
    await api.forceLogout('u1');

    expect(client.post).toHaveBeenCalledWith('/admin/users/u1/force-logout');
  });
});
