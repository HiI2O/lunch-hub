import type { DomainEvent } from '../../../../shared/domain/domain-event.base.js';

export class TicketCreatedEvent implements DomainEvent {
  readonly eventName = 'TicketCreated';
  readonly occurredOn: Date;

  constructor(
    readonly aggregateId: string,
    readonly ownerId: string,
    readonly initialCount: number,
  ) {
    this.occurredOn = new Date();
  }
}
