import type { DomainEvent } from '../../../../shared/domain/domain-event.base.js';

export class UserReactivatedEvent implements DomainEvent {
  readonly eventName = 'UserReactivated';
  readonly occurredOn: Date;
  readonly aggregateId: string;

  constructor(aggregateId: string) {
    this.occurredOn = new Date();
    this.aggregateId = aggregateId;
  }
}
