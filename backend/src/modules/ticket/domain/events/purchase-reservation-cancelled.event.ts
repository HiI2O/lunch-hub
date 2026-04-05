import type { DomainEvent } from '../../../../shared/domain/domain-event.base.js';

export class TicketPurchaseReservationCancelledEvent implements DomainEvent {
  readonly eventName = 'TicketPurchaseReservationCancelled';
  readonly occurredOn: Date;

  constructor(
    readonly aggregateId: string,
    readonly userId: string,
    readonly ticketId: string | null,
  ) {
    this.occurredOn = new Date();
  }
}
