import type { DomainEvent } from '../../../../shared/domain/domain-event.base.js';

export class ReservationCancelledEvent implements DomainEvent {
  readonly eventName = 'ReservationCancelled';
  readonly occurredOn: Date;

  constructor(
    readonly aggregateId: string,
    readonly userId: string,
    readonly reservationDate: string,
  ) {
    this.occurredOn = new Date();
  }
}
