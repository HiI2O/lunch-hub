import type { DomainEvent } from '../../../../shared/domain/domain-event.base.js';

export class ReservationCreatedEvent implements DomainEvent {
  readonly eventName = 'ReservationCreated';
  readonly occurredOn: Date;

  constructor(
    readonly aggregateId: string,
    readonly userId: string,
    readonly reservationDate: string,
    readonly paymentMethod: string,
  ) {
    this.occurredOn = new Date();
  }
}
