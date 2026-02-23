import { Entity } from './entity.base.js';

class TestEntity extends Entity<string> {
  constructor(id: string) {
    super(id);
  }
}

class AnotherEntity extends Entity<string> {
  constructor(id: string) {
    super(id);
  }
}

describe('Entity', () => {
  it('should expose id', () => {
    const entity = new TestEntity('123');
    expect(entity.id).toBe('123');
  });

  it('should be equal when ids match and same type', () => {
    const e1 = new TestEntity('123');
    const e2 = new TestEntity('123');
    expect(e1.equals(e2)).toBe(true);
  });

  it('should not be equal when ids differ', () => {
    const e1 = new TestEntity('123');
    const e2 = new TestEntity('456');
    expect(e1.equals(e2)).toBe(false);
  });

  it('should not be equal to null or undefined', () => {
    const entity = new TestEntity('123');
    expect(entity.equals(null)).toBe(false);
    expect(entity.equals(undefined)).toBe(false);
  });

  it('should not be equal to different entity type', () => {
    const e1 = new TestEntity('123');
    const e2 = new AnotherEntity('123');
    expect(e1.equals(e2)).toBe(false);
  });

  it('should be equal to itself', () => {
    const entity = new TestEntity('123');
    expect(entity.equals(entity)).toBe(true);
  });
});
