import { describe, it, expect, vi } from 'vitest';
import type { ApiClient } from './client';
import { createReservationApi } from './reservation';
import type {
  CalendarData,
  ReservationDetail,
  ReservationResult,
} from './types';

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

describe('ReservationApi', () => {
  const client = createMockClient();
  const api = createReservationApi(client);

  it('getMyReservations — フィルタなし', async () => {
    const mockData: ReservationResult[] = [];
    client.get.mockResolvedValue(mockData);

    const result = await api.getMyReservations();

    expect(client.get).toHaveBeenCalledWith('/reservations');
    expect(result).toBe(mockData);
  });

  it('getMyReservations — フィルタあり', async () => {
    client.get.mockResolvedValue([]);

    await api.getMyReservations({
      from: '2026-04-01',
      to: '2026-04-30',
      status: 'CONFIRMED',
    });

    expect(client.get).toHaveBeenCalledWith(
      '/reservations?from=2026-04-01&to=2026-04-30&status=CONFIRMED',
    );
  });

  it('getReservationDetail', async () => {
    const mockDetail: ReservationDetail = {
      id: 'r1',
      reservationDate: '2026-04-10',
      paymentMethod: 'CASH',
      status: 'CONFIRMED',
      ticketId: null,
      createdAt: '2026-04-08T10:00:00Z',
      updatedAt: '2026-04-08T10:00:00Z',
    };
    client.get.mockResolvedValue(mockDetail);

    const result = await api.getReservationDetail('r1');

    expect(client.get).toHaveBeenCalledWith('/reservations/r1');
    expect(result).toBe(mockDetail);
  });

  it('getCalendarData', async () => {
    const mockCalendar: CalendarData = {
      '2026-04-10': { hasReservation: true, status: 'CONFIRMED' },
    };
    client.get.mockResolvedValue(mockCalendar);

    const result = await api.getCalendarData(2026, 4);

    expect(client.get).toHaveBeenCalledWith(
      '/reservations/calendar?year=2026&month=4',
    );
    expect(result).toBe(mockCalendar);
  });

  it('createReservation — 現金', async () => {
    const mockResult: ReservationResult = {
      id: 'r2',
      reservationDate: '2026-04-10',
      paymentMethod: 'CASH',
      status: 'CONFIRMED',
      ticketId: null,
      createdAt: '2026-04-08T10:00:00Z',
    };
    client.post.mockResolvedValue(mockResult);

    const result = await api.createReservation({
      reservationDate: '2026-04-10',
      paymentMethod: 'CASH',
    });

    expect(client.post).toHaveBeenCalledWith('/reservations', {
      reservationDate: '2026-04-10',
      paymentMethod: 'CASH',
    });
    expect(result).toBe(mockResult);
  });

  it('createReservation — チケット', async () => {
    client.post.mockResolvedValue({} as ReservationResult);

    await api.createReservation({
      reservationDate: '2026-04-10',
      paymentMethod: 'TICKET',
      ticketId: 'ticket-1',
    });

    expect(client.post).toHaveBeenCalledWith('/reservations', {
      reservationDate: '2026-04-10',
      paymentMethod: 'TICKET',
      ticketId: 'ticket-1',
    });
  });

  it('modifyReservation', async () => {
    client.put.mockResolvedValue({} as ReservationResult);

    await api.modifyReservation('r1', { paymentMethod: 'TICKET', ticketId: 'tid' });

    expect(client.put).toHaveBeenCalledWith('/reservations/r1', {
      paymentMethod: 'TICKET',
      ticketId: 'tid',
    });
  });

  it('cancelReservation', async () => {
    client.delete.mockResolvedValue({ id: 'r1', status: 'CANCELLED' });

    const result = await api.cancelReservation('r1');

    expect(client.delete).toHaveBeenCalledWith('/reservations/r1');
    expect(result).toEqual({ id: 'r1', status: 'CANCELLED' });
  });
});
