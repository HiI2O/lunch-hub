import { UniqueId } from './identifier.js';

describe('UniqueId', () => {
  it('should create with a random UUID', () => {
    const id = UniqueId.create();
    expect(id.value).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it('should create from an existing UUID', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    const id = UniqueId.create(uuid);
    expect(id.value).toBe(uuid);
  });

  it('should throw on invalid UUID format', () => {
    expect(() => UniqueId.create('not-a-uuid')).toThrow('Invalid UUID format');
  });

  it('should be equal when values match', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    const id1 = UniqueId.create(uuid);
    const id2 = UniqueId.create(uuid);
    expect(id1.equals(id2)).toBe(true);
  });

  it('should not be equal when values differ', () => {
    const id1 = UniqueId.create();
    const id2 = UniqueId.create();
    expect(id1.equals(id2)).toBe(false);
  });

  it('should convert to string', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    const id = UniqueId.create(uuid);
    expect(id.toString()).toBe(uuid);
  });
});
