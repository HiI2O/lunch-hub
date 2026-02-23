import { AggregateRoot } from './aggregate-root.base.js';

class TestAggregate extends AggregateRoot<string> {
  constructor(id: string) {
    super(id);
  }

  doSomething(): void {
    this.addDomainEvent({
      eventName: 'TestEvent',
      occurredOn: new Date(),
      aggregateId: this.id,
    });
  }
}

describe('AggregateRoot', () => {
  it('should start with no domain events', () => {
    const aggregate = new TestAggregate('1');
    expect(aggregate.getDomainEvents()).toHaveLength(0);
  });

  it('should collect domain events', () => {
    const aggregate = new TestAggregate('1');
    aggregate.doSomething();
    const events = aggregate.getDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]?.eventName).toBe('TestEvent');
    expect(events[0]?.aggregateId).toBe('1');
  });

  it('should clear domain events', () => {
    const aggregate = new TestAggregate('1');
    aggregate.doSomething();
    aggregate.doSomething();
    expect(aggregate.getDomainEvents()).toHaveLength(2);

    aggregate.clearDomainEvents();
    expect(aggregate.getDomainEvents()).toHaveLength(0);
  });

  it('should return a copy of domain events', () => {
    const aggregate = new TestAggregate('1');
    aggregate.doSomething();
    const events1 = aggregate.getDomainEvents();
    const events2 = aggregate.getDomainEvents();
    expect(events1).not.toBe(events2);
    expect(events1).toEqual(events2);
  });

  it('should inherit Entity behavior', () => {
    const a1 = new TestAggregate('1');
    const a2 = new TestAggregate('1');
    expect(a1.equals(a2)).toBe(true);
    expect(a1.id).toBe('1');
  });
});
