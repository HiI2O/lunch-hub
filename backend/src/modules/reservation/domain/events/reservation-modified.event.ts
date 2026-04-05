import type { DomainEvent } from '../../../../shared/domain/domain-event.base.js';

export class ReservationModifiedEvent implements DomainEvent {
  readonly eventName = 'ReservationModified';
  readonly occurredOn: Date;

  constructor(
    readonly aggregateId: string,
    readonly userId: string,
    readonly newPaymentMethod: string,
  ) {
    this.occurredOn = new Date();
  }
}
