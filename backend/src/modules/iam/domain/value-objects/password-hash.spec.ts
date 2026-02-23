import { PasswordHash } from './password-hash.js';
import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';

describe('PasswordHash', () => {
  const validHash =
    '$2b$12$LJ3m4ys3Lg4CeQxrVBMOAOjFYpl1EUW5P4m3GJjfvAY5f6km2gBHa';

  it('should create from a valid bcrypt hash', () => {
    const hash = PasswordHash.create(validHash);
    expect(hash.value).toBe(validHash);
  });

  it('should throw on invalid hash format', () => {
    expect(() => PasswordHash.create('not-a-hash')).toThrow(ValidationError);
    expect(() => PasswordHash.create('')).toThrow(ValidationError);
    expect(() => PasswordHash.create('$2b$12$short')).toThrow(ValidationError);
  });

  it('should be equal when values match', () => {
    const h1 = PasswordHash.create(validHash);
    const h2 = PasswordHash.create(validHash);
    expect(h1.equals(h2)).toBe(true);
  });
});
