import type { DomainEvent } from '../../../../shared/domain/domain-event.base.js';

export class UserDeactivatedEvent implements DomainEvent {
  readonly eventName = 'UserDeactivated';
  readonly occurredOn: Date;
  readonly aggregateId: string;

  constructor(aggregateId: string) {
    this.occurredOn = new Date();
    this.aggregateId = aggregateId;
  }
}
