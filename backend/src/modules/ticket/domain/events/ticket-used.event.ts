import type { DomainEvent } from '../../../../shared/domain/domain-event.base.js';

export class TicketUsedEvent implements DomainEvent {
  readonly eventName = 'TicketUsed';
  readonly occurredOn: Date;

  constructor(
    readonly aggregateId: string,
    readonly remainingCount: number,
  ) {
    this.occurredOn = new Date();
  }
}
