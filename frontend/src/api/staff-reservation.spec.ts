import { describe, it, expect, vi } from 'vitest';
import type { ApiClient } from './client';
import { createStaffReservationApi } from './staff-reservation';
import type { GuestResult, GuestReservationResult, StaffReservationItem, StaffReservationsMeta } from './types';

function createMockClient(): {
  [K in 'get' | 'post' | 'put' | 'delete']: ReturnType<typeof vi.fn>;
} & ApiClient {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    setAccessToken: vi.fn(),
    setRefreshHandler: vi.fn(),
  } as unknown as ReturnType<typeof createMockClient>;
}

describe('StaffReservationApi', () => {
  const client = createMockClient();
  const api = createStaffReservationApi(client);

  it('getAllReservations — 日付指定', async () => {
    const mockData = {
      data: [] as StaffReservationItem[],
      meta: { total: 0, cashCount: 0, ticketCount: 0 } as StaffReservationsMeta,
    };
    client.get.mockResolvedValue(mockData);

    const result = await api.getAllReservations({ date: '2026-04-10' });

    expect(client.get).toHaveBeenCalledWith(
      '/staff/reservations?date=2026-04-10',
    );
    expect(result).toBe(mockData);
  });

  it('createGuest', async () => {
    const mockGuest: GuestResult = {
      id: 'g1',
      guestName: '来客A様',
      createdAt: '2026-04-08T10:00:00Z',
    };
    client.post.mockResolvedValue(mockGuest);

    const result = await api.createGuest('来客A様');

    expect(client.post).toHaveBeenCalledWith('/staff/guests', {
      guestName: '来客A様',
    });
    expect(result).toBe(mockGuest);
  });

  it('createGuestReservation', async () => {
    const mockResult: GuestReservationResult = {
      id: 'r1',
      guest: { id: 'g1', guestName: '来客A様' },
      reservationDate: '2026-04-10',
      paymentMethod: 'CASH',
      status: 'CONFIRMED',
    };
    client.post.mockResolvedValue(mockResult);

    const result = await api.createGuestReservation('g1', '2026-04-10');

    expect(client.post).toHaveBeenCalledWith('/staff/reservations/guest', {
      guestId: 'g1',
      reservationDate: '2026-04-10',
    });
    expect(result).toBe(mockResult);
  });

  it('modifyReservation', async () => {
    client.put.mockResolvedValue({});

    await api.modifyReservation('r1', { paymentMethod: 'CASH' });

    expect(client.put).toHaveBeenCalledWith('/staff/reservations/r1', {
      paymentMethod: 'CASH',
    });
  });

  it('cancelReservation', async () => {
    client.delete.mockResolvedValue({ id: 'r1', status: 'CANCELLED' });

    const result = await api.cancelReservation('r1');

    expect(client.delete).toHaveBeenCalledWith('/staff/reservations/r1');
    expect(result).toEqual({ id: 'r1', status: 'CANCELLED' });
  });
});
