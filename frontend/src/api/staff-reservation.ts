import type { ApiClient } from './client';
import type {
  GuestResult,
  GuestReservationResult,
  ReservationResult,
  StaffReservationItem,
  StaffReservationsMeta,
} from './types';
import type { CancelResult, ModifyReservationInput } from './reservation';

// --- 型定義 ---

export type StaffReservationFilter = {
  readonly date?: string;
  readonly status?: string;
};

export type StaffReservationsResponse = {
  readonly data: StaffReservationItem[];
  readonly meta: StaffReservationsMeta;
};

// --- API ---

export type StaffReservationApi = {
  getAllReservations(filter?: StaffReservationFilter): Promise<StaffReservationsResponse>;
  createGuest(guestName: string): Promise<GuestResult>;
  createGuestReservation(guestId: string, reservationDate: string): Promise<GuestReservationResult>;
  modifyReservation(id: string, input: ModifyReservationInput): Promise<ReservationResult>;
  cancelReservation(id: string): Promise<CancelResult>;
};

export function createStaffReservationApi(client: ApiClient): StaffReservationApi {
  return {
    getAllReservations(filter) {
      const params = buildQuery(filter);
      return client.get<StaffReservationsResponse>(`/staff/reservations${params}`);
    },
    createGuest(guestName) {
      return client.post<GuestResult>('/staff/guests', { guestName });
    },
    createGuestReservation(guestId, reservationDate) {
      return client.post<GuestReservationResult>('/staff/reservations/guest', {
        guestId,
        reservationDate,
      });
    },
    modifyReservation(id, input) {
      return client.put<ReservationResult>(`/staff/reservations/${id}`, input);
    },
    cancelReservation(id) {
      return client.delete<CancelResult>(`/staff/reservations/${id}`);
    },
  };
}

function buildQuery(filter?: StaffReservationFilter): string {
  if (!filter) return '';
  const entries = Object.entries(filter).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return '';
  return '?' + entries.map(([k, v]) => `${k}=${v}`).join('&');
}
