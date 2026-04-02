/* eslint-disable @typescript-eslint/unbound-method */
import { ReactivateUserUseCase } from './reactivate-user.use-case.js';
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

function createDeactivatedUser(): User {
  return User.reconstruct({
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: EmailAddress.create('test@example.com'),
    displayName: DisplayName.create('テスト'),
    passwordHash: PasswordHash.create(VALID_HASH),
    role: Role.create('GENERAL_USER'),
    status: UserStatus.create('DEACTIVATED'),
    invitationToken: null,
    invitedBy: null,
    invitedAt: new Date(),
    activatedAt: new Date(),
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
  });
}

describe('ReactivateUserUseCase', () => {
  let useCase: ReactivateUserUseCase;
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

    useCase = new ReactivateUserUseCase(userRepository);
  });

  it('should reactivate a deactivated user and save', async () => {
    const user = createDeactivatedUser();
    userRepository.findById.mockResolvedValue(user);

    await useCase.execute(user.id);

    expect(userRepository.save).toHaveBeenCalledTimes(1);
    expect(user.status.value).toBe('ACTIVE');
  });

  it('should throw NotFoundError when user not found', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent-id')).rejects.toThrow(
      NotFoundError,
    );
  });

  it('should not save when user is not found', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent-id')).rejects.toThrow();
    expect(userRepository.save).not.toHaveBeenCalled();
  });
});
