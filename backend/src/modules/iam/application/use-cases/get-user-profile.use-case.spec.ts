import { GetUserProfileUseCase } from './get-user-profile.use-case.js';
import type { IUserRepository } from '../../domain/repositories/user.repository.js';
import { User } from '../../domain/aggregates/user.js';
import { EmailAddress } from '../../domain/value-objects/email-address.js';
import { DisplayName } from '../../domain/value-objects/display-name.js';
import { PasswordHash } from '../../domain/value-objects/password-hash.js';
import { Role } from '../../domain/value-objects/role.js';
import { UserStatus } from '../../domain/value-objects/user-status.js';
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error.js';

const VALID_HASH =
  '$2b$12$LJ3m4ys3Lg4CeQxrVBMOAOjFYpl1EUW5P4m3GJjfvAY5f6km2gBHa';

const now = new Date();
const lastLogin = new Date('2025-12-01T10:00:00Z');

function createActiveUser(): User {
  return User.reconstruct({
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: EmailAddress.create('test@example.com'),
    displayName: DisplayName.create('テスト'),
    passwordHash: PasswordHash.create(VALID_HASH),
    role: Role.create('GENERAL_USER'),
    status: UserStatus.create('ACTIVE'),
    invitationToken: null,
    invitedBy: null,
    invitedAt: new Date(),
    activatedAt: new Date(),
    lastLoginAt: lastLogin,
    createdAt: now,
    updatedAt: now,
    version: 1,
  });
}

function createUserWithoutDisplayName(): User {
  return User.reconstruct({
    id: '550e8400-e29b-41d4-a716-446655440001',
    email: EmailAddress.create('nodisplay@example.com'),
    displayName: null,
    passwordHash: PasswordHash.create(VALID_HASH),
    role: Role.create('STAFF'),
    status: UserStatus.create('ACTIVE'),
    invitationToken: null,
    invitedBy: null,
    invitedAt: new Date(),
    activatedAt: new Date(),
    lastLoginAt: null,
    createdAt: now,
    updatedAt: now,
    version: 1,
  });
}

describe('GetUserProfileUseCase', () => {
  let useCase: GetUserProfileUseCase;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    userRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByInvitationToken: jest.fn(),
      existsByEmail: jest.fn(),
      findAll: jest.fn(),
    };

    useCase = new GetUserProfileUseCase(userRepository);
  });

  it('should return UserProfileDto for an active user', async () => {
    const user = createActiveUser();
    userRepository.findById.mockResolvedValue(user);

    const result = await useCase.execute(user.id);

    expect(result.id).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(result.email).toBe('test@example.com');
    expect(result.displayName).toBe('テスト');
    expect(result.role).toBe('GENERAL_USER');
    expect(result.status).toBe('ACTIVE');
    expect(result.lastLoginAt).toBe(lastLogin);
    expect(result.createdAt).toBe(now);
  });

  it('should throw NotFoundError when user not found', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent-id')).rejects.toThrow(
      NotFoundError,
    );
  });

  it('should return null displayName when user has no display name', async () => {
    const user = createUserWithoutDisplayName();
    userRepository.findById.mockResolvedValue(user);

    const result = await useCase.execute(user.id);

    expect(result.displayName).toBeNull();
  });
});
