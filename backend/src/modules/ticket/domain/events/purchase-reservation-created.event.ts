import type { DomainEvent } from '../../../../shared/domain/domain-event.base.js';

export class TicketPurchaseReservationCreatedEvent implements DomainEvent {
  readonly eventName = 'TicketPurchaseReservationCreated';
  readonly occurredOn: Date;

  constructor(
    readonly aggregateId: string,
    readonly userId: string,
    readonly quantity: number,
    readonly purchaseDate: string,
  ) {
    this.occurredOn = new Date();
  }
}
