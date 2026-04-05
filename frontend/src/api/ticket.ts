import type { ApiClient } from './client';
import type { TicketResult, PurchaseReservationResult } from './types';

// --- 型定義 ---

export type CreatePurchaseInput = {
  readonly purchaseDate: string;
  readonly quantity: number;
};

// --- API ---

export type TicketApi = {
  getMyTickets(): Promise<TicketResult[]>;
  getTicketDetail(id: string): Promise<TicketResult>;
  createPurchaseReservation(input: CreatePurchaseInput): Promise<PurchaseReservationResult>;
  cancelPurchaseReservation(id: string): Promise<PurchaseReservationResult>;
};

export function createTicketApi(client: ApiClient): TicketApi {
  return {
    getMyTickets() {
      return client.get<TicketResult[]>('/tickets');
    },
    getTicketDetail(id) {
      return client.get<TicketResult>(`/tickets/${id}`);
    },
    createPurchaseReservation(input) {
      return client.post<PurchaseReservationResult>('/tickets/purchase', input);
    },
    cancelPurchaseReservation(id) {
      return client.delete<PurchaseReservationResult>(`/tickets/purchase/${id}`);
    },
  };
}
