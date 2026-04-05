import type { DomainEvent } from '../../../../shared/domain/domain-event.base.js';

export class TicketRestoredEvent implements DomainEvent {
  readonly eventName = 'TicketRestored';
  readonly occurredOn: Date;

  constructor(
    readonly aggregateId: string,
    readonly remainingCount: number,
  ) {
    this.occurredOn = new Date();
  }
}
