import { EmailAddress } from './email-address.js';
import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';

describe('EmailAddress', () => {
  it('should create a valid email address', () => {
    const email = EmailAddress.create('user@example.com');
    expect(email.value).toBe('user@example.com');
  });

  it('should normalize to lowercase', () => {
    const email = EmailAddress.create('User@Example.COM');
    expect(email.value).toBe('user@example.com');
  });

  it('should trim whitespace', () => {
    const email = EmailAddress.create('  user@example.com  ');
    expect(email.value).toBe('user@example.com');
  });

  it('should throw on invalid email format', () => {
    expect(() => EmailAddress.create('invalid')).toThrow(ValidationError);
    expect(() => EmailAddress.create('missing@')).toThrow(ValidationError);
    expect(() => EmailAddress.create('@domain.com')).toThrow(ValidationError);
    expect(() => EmailAddress.create('')).toThrow(ValidationError);
  });

  it('should be equal when values match', () => {
    const e1 = EmailAddress.create('user@example.com');
    const e2 = EmailAddress.create('user@example.com');
    expect(e1.equals(e2)).toBe(true);
  });

  it('should not be equal when values differ', () => {
    const e1 = EmailAddress.create('user1@example.com');
    const e2 = EmailAddress.create('user2@example.com');
    expect(e1.equals(e2)).toBe(false);
  });
});
