import type { TicketPurchaseReservation } from '../aggregates/ticket-purchase-reservation.js';

export abstract class ITicketPurchaseReservationRepository {
  abstract save(pr: TicketPurchaseReservation): Promise<void>;
  abstract findById(id: string): Promise<TicketPurchaseReservation | null>;
  abstract findByUserId(userId: string): Promise<TicketPurchaseReservation[]>;
  abstract findByPurchaseDate(
    date: string,
  ): Promise<TicketPurchaseReservation[]>;
}
