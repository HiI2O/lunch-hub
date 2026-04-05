import { describe, it, expect, vi } from 'vitest';
import { createTicketApi } from './ticket';
import type { ApiClient } from './client';

function mockClient(): ApiClient {
  return {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    put: vi.fn(),
  } as unknown as ApiClient;
}

describe('TicketApi', () => {
  it('getMyTickets は GET /tickets を呼ぶ', async () => {
    const client = mockClient();
    const data = [{ id: '1' }];
    vi.mocked(client.get).mockResolvedValue(data);

    const api = createTicketApi(client);
    const result = await api.getMyTickets();

    expect(client.get).toHaveBeenCalledWith('/tickets');
    expect(result).toBe(data);
  });

  it('getTicketDetail は GET /tickets/:id を呼ぶ', async () => {
    const client = mockClient();
    const data = { id: 't1' };
    vi.mocked(client.get).mockResolvedValue(data);

    const api = createTicketApi(client);
    const result = await api.getTicketDetail('t1');

    expect(client.get).toHaveBeenCalledWith('/tickets/t1');
    expect(result).toBe(data);
  });

  it('createPurchaseReservation は POST /tickets/purchase を呼ぶ', async () => {
    const client = mockClient();
    const input = { purchaseDate: '2026-04-05', quantity: 1 };
    const data = { id: 'pr1' };
    vi.mocked(client.post).mockResolvedValue(data);

    const api = createTicketApi(client);
    const result = await api.createPurchaseReservation(input);

    expect(client.post).toHaveBeenCalledWith('/tickets/purchase', input);
    expect(result).toBe(data);
  });

  it('cancelPurchaseReservation は DELETE /tickets/purchase/:id を呼ぶ', async () => {
    const client = mockClient();
    const data = { id: 'pr1', status: 'CANCELLED' };
    vi.mocked(client.delete).mockResolvedValue(data);

    const api = createTicketApi(client);
    const result = await api.cancelPurchaseReservation('pr1');

    expect(client.delete).toHaveBeenCalledWith('/tickets/purchase/pr1');
    expect(result).toBe(data);
  });
});
