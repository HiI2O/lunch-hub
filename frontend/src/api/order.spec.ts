import { describe, it, expect, vi } from 'vitest';
import { createOrderApi } from './order';
import type { ApiClient } from './client';

function mockClient(): ApiClient {
  return {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    put: vi.fn(),
  } as unknown as ApiClient;
}

describe('OrderApi', () => {
  it('getOrders は GET /orders?from=&to= を呼ぶ', async () => {
    const client = mockClient();
    const data = [{ id: 'o1' }];
    vi.mocked(client.get).mockResolvedValue(data);

    const api = createOrderApi(client);
    const result = await api.getOrders({ from: '2026-04-01', to: '2026-04-30' });

    expect(client.get).toHaveBeenCalledWith('/orders?from=2026-04-01&to=2026-04-30');
    expect(result).toBe(data);
  });

  it('placeOrder は POST /orders/:id/place を呼ぶ', async () => {
    const client = mockClient();
    const data = { id: 'o1', status: 'PLACED' };
    vi.mocked(client.post).mockResolvedValue(data);

    const api = createOrderApi(client);
    const result = await api.placeOrder('o1');

    expect(client.post).toHaveBeenCalledWith('/orders/o1/place');
    expect(result).toBe(data);
  });
});
