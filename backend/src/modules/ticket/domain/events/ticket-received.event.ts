import type { DomainEvent } from '../../../../shared/domain/domain-event.base.js';

export class TicketReceivedEvent implements DomainEvent {
  readonly eventName = 'TicketReceived';
  readonly occurredOn: Date;

  constructor(readonly aggregateId: string) {
    this.occurredOn = new Date();
  }
}
