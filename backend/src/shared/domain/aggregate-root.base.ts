import type { DomainEvent } from './domain-event.base.js';
import { Entity } from './entity.base.js';

export abstract class AggregateRoot<
  T extends string | number,
> extends Entity<T> {
  private _domainEvents: DomainEvent[] = [];

  protected constructor(id: T) {
    super(id);
  }

  getDomainEvents(): readonly DomainEvent[] {
    return [...this._domainEvents];
  }

  clearDomainEvents(): void {
    this._domainEvents = [];
  }

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }
}
