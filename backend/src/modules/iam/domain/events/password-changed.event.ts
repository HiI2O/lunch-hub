import type { DomainEvent } from '../../../../shared/domain/domain-event.base.js';

export class PasswordChangedEvent implements DomainEvent {
  readonly eventName = 'PasswordChanged';
  readonly occurredOn: Date;
  readonly aggregateId: string;

  constructor(aggregateId: string) {
    this.occurredOn = new Date();
    this.aggregateId = aggregateId;
  }
}
