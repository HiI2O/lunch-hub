import { AuthenticationService } from './authentication.service.js';
import type { PasswordHasher } from './password-hasher.interface.js';
import { User } from '../aggregates/user.js';
import { EmailAddress } from '../value-objects/email-address.js';
import { DisplayName } from '../value-objects/display-name.js';
import { PasswordHash } from '../value-objects/password-hash.js';
import { Role } from '../value-objects/role.js';
import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';

const VALID_HASH =
  '$2b$12$LJ3m4ys3Lg4CeQxrVBMOAOjFYpl1EUW5P4m3GJjfvAY5f6km2gBHa';

function createMockHasher(result: boolean): PasswordHasher {
  return {
    hash: jest.fn(),
    compare: jest.fn().mockResolvedValue(result),
  };
}

function createActiveUser(): User {
  const user = User.invite({
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: EmailAddress.create('test@example.com'),
    role: Role.create('GENERAL_USER'),
    invitedBy: 'admin-id',
  });
  user.activate(PasswordHash.create(VALID_HASH), DisplayName.create('テスト'));
  return user;
}

describe('AuthenticationService', () => {
  it('should return true when password matches', async () => {
    const hasher = createMockHasher(true);
    const service = new AuthenticationService(hasher);
    const user = createActiveUser();

    const result = await service.verifyCredentials(user, 'correct-password');
    expect(result).toBe(true);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(hasher.compare).toHaveBeenCalledWith('correct-password', VALID_HASH);
  });

  it('should return false when password does not match', async () => {
    const hasher = createMockHasher(false);
    const service = new AuthenticationService(hasher);
    const user = createActiveUser();

    const result = await service.verifyCredentials(user, 'wrong-password');
    expect(result).toBe(false);
  });

  it('should throw when user cannot login', async () => {
    const hasher = createMockHasher(true);
    const service = new AuthenticationService(hasher);
    const user = User.invite({
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: EmailAddress.create('test@example.com'),
      role: Role.create('GENERAL_USER'),
      invitedBy: 'admin-id',
    });

    await expect(service.verifyCredentials(user, 'password')).rejects.toThrow(
      ValidationError,
    );
  });
});
