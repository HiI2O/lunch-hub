import type { DomainEvent } from '../../../../shared/domain/domain-event.base.js';

export class ReservationFinalizedEvent implements DomainEvent {
  readonly eventName = 'ReservationFinalized';
  readonly occurredOn: Date;

  constructor(
    readonly aggregateId: string,
    readonly orderId: string,
  ) {
    this.occurredOn = new Date();
  }
}
