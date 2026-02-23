import type { DomainEvent } from '../../../../shared/domain/domain-event.base.js';

export class UserActivatedEvent implements DomainEvent {
  readonly eventName = 'UserActivated';
  readonly occurredOn: Date;
  readonly aggregateId: string;

  constructor(aggregateId: string) {
    this.occurredOn = new Date();
    this.aggregateId = aggregateId;
  }
}
