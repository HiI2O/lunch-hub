import type { Ticket } from '../aggregates/ticket.js';

export abstract class ITicketRepository {
  abstract save(ticket: Ticket): Promise<void>;
  abstract findById(id: string): Promise<Ticket | null>;
  abstract findByOwnerId(ownerId: string): Promise<Ticket[]>;
}
