import { PasswordResetToken } from './password-reset-token.js';
import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';

describe('PasswordResetToken', () => {
  it('should create with auto-generated token and 1h expiry', () => {
    const token = PasswordResetToken.create();
    expect(token.token).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    const expectedExpiry = Date.now() + 1 * 60 * 60 * 1000;
    expect(token.expiresAt.getTime()).toBeCloseTo(expectedExpiry, -3);
  });

  it('should create from existing token and expiry', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    const expiry = new Date('2030-01-01');
    const token = PasswordResetToken.create(uuid, expiry);
    expect(token.token).toBe(uuid);
    expect(token.expiresAt).toEqual(expiry);
  });

  it('should throw on invalid token format', () => {
    expect(() => PasswordResetToken.create('not-uuid')).toThrow(
      ValidationError,
    );
  });

  it('should detect expired token', () => {
    const pastExpiry = new Date(Date.now() - 1000);
    const token = PasswordResetToken.create(undefined, pastExpiry);
    expect(token.isExpired()).toBe(true);
  });

  it('should detect non-expired token', () => {
    const futureExpiry = new Date(Date.now() + 60 * 60 * 1000);
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    const token = PasswordResetToken.create(uuid, futureExpiry);
    expect(token.isExpired()).toBe(false);
  });

  it('should be equal when values match', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    const expiry = new Date('2030-01-01');
    const t1 = PasswordResetToken.create(uuid, expiry);
    const t2 = PasswordResetToken.create(uuid, expiry);
    expect(t1.equals(t2)).toBe(true);
  });
});
