import type { DomainEvent } from '../../../../shared/domain/domain-event.base.js';

export class OrderPlacedEvent implements DomainEvent {
  readonly eventName = 'OrderPlaced';
  readonly occurredOn: Date;

  constructor(
    readonly aggregateId: string,
    readonly orderDate: string,
    readonly totalCount: number,
  ) {
    this.occurredOn = new Date();
  }
}
