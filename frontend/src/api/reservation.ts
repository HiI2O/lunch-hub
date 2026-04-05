import type { ApiClient } from './client';
import type {
  CalendarData,
  ReservationDetail,
  ReservationResult,
  ReservationStatus,
  PaymentMethod,
} from './types';

// --- 型定義 ---

export type ReservationFilter = {
  readonly from?: string;
  readonly to?: string;
  readonly status?: ReservationStatus;
};

export type CreateReservationInput = {
  readonly reservationDate: string;
  readonly paymentMethod: PaymentMethod;
  readonly ticketId?: string;
};

export type ModifyReservationInput = {
  readonly paymentMethod: PaymentMethod;
  readonly ticketId?: string;
};

export type CancelResult = {
  readonly id: string;
  readonly status: 'CANCELLED';
};

// --- API ---

export type ReservationApi = {
  getMyReservations(filter?: ReservationFilter): Promise<ReservationResult[]>;
  getReservationDetail(id: string): Promise<ReservationDetail>;
  getCalendarData(year: number, month: number): Promise<CalendarData>;
  createReservation(input: CreateReservationInput): Promise<ReservationResult>;
  modifyReservation(id: string, input: ModifyReservationInput): Promise<ReservationResult>;
  cancelReservation(id: string): Promise<CancelResult>;
};

export function createReservationApi(client: ApiClient): ReservationApi {
  return {
    getMyReservations(filter) {
      const params = buildQuery(filter);
      return client.get<ReservationResult[]>(`/reservations${params}`);
    },
    getReservationDetail(id) {
      return client.get<ReservationDetail>(`/reservations/${id}`);
    },
    getCalendarData(year, month) {
      return client.get<CalendarData>(
        `/reservations/calendar?year=${year}&month=${month}`,
      );
    },
    createReservation(input) {
      return client.post<ReservationResult>('/reservations', input);
    },
    modifyReservation(id, input) {
      return client.put<ReservationResult>(`/reservations/${id}`, input);
    },
    cancelReservation(id) {
      return client.delete<CancelResult>(`/reservations/${id}`);
    },
  };
}

function buildQuery(filter?: ReservationFilter): string {
  if (!filter) return '';
  const entries = Object.entries(filter).filter(
    ([, v]) => v !== undefined,
  );
  if (entries.length === 0) return '';
  return '?' + entries.map(([k, v]) => `${k}=${v}`).join('&');
}
