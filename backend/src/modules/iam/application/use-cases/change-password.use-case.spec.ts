/* eslint-disable @typescript-eslint/unbound-method */
import { ChangePasswordUseCase } from './change-password.use-case.js';
import type { IUserRepository } from '../../domain/repositories/user.repository.js';
import type { PasswordHasher } from '../../domain/services/password-hasher.interface.js';
import { AuthenticationService } from '../../domain/services/authentication.service.js';
import { User } from '../../domain/aggregates/user.js';
import { EmailAddress } from '../../domain/value-objects/email-address.js';
import { DisplayName } from '../../domain/value-objects/display-name.js';
import { PasswordHash } from '../../domain/value-objects/password-hash.js';
import { Role } from '../../domain/value-objects/role.js';
import { UserStatus } from '../../domain/value-objects/user-status.js';
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error.js';
import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';

const VALID_HASH =
  '$2b$12$LJ3m4ys3Lg4CeQxrVBMOAOjFYpl1EUW5P4m3GJjfvAY5f6km2gBHa';

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
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
  });
}

describe('ChangePasswordUseCase', () => {
  let useCase: ChangePasswordUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let passwordHasher: jest.Mocked<PasswordHasher>;
  let authService: AuthenticationService;
  let mockHasherForAuth: jest.Mocked<PasswordHasher>;

  beforeEach(() => {
    userRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByInvitationToken: jest.fn(),
      existsByEmail: jest.fn(),
      findAll: jest.fn(),
    };

    passwordHasher = {
      hash: jest.fn().mockResolvedValue(VALID_HASH),
      compare: jest.fn(),
    };

    mockHasherForAuth = {
      hash: jest.fn(),
      compare: jest.fn().mockResolvedValue(true),
    };
    authService = new AuthenticationService(mockHasherForAuth);

    useCase = new ChangePasswordUseCase(
      userRepository,
      passwordHasher,
      authService,
    );
  });

  it('should change password successfully when current password is correct', async () => {
    const user = createActiveUser();
    userRepository.findById.mockResolvedValue(user);

    await useCase.execute(user.id, 'current-password', 'new-password');

    expect(passwordHasher.hash).toHaveBeenCalledWith('new-password');
    expect(userRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should throw NotFoundError when user not found', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('nonexistent-id', 'current', 'new'),
    ).rejects.toThrow(NotFoundError);
  });

  it('should throw ValidationError when current password is incorrect', async () => {
    const user = createActiveUser();
    userRepository.findById.mockResolvedValue(user);

    const failHasher: jest.Mocked<PasswordHasher> = {
      hash: jest.fn(),
      compare: jest.fn().mockResolvedValue(false),
    };
    const failAuthService = new AuthenticationService(failHasher);
    const failUseCase = new ChangePasswordUseCase(
      userRepository,
      passwordHasher,
      failAuthService,
    );

    await expect(
      failUseCase.execute(user.id, 'wrong-password', 'new-password'),
    ).rejects.toThrow(ValidationError);
  });

  it('should not save user when current password verification fails', async () => {
    const user = createActiveUser();
    userRepository.findById.mockResolvedValue(user);

    const failHasher: jest.Mocked<PasswordHasher> = {
      hash: jest.fn(),
      compare: jest.fn().mockResolvedValue(false),
    };
    const failAuthService = new AuthenticationService(failHasher);
    const failUseCase = new ChangePasswordUseCase(
      userRepository,
      passwordHasher,
      failAuthService,
    );

    await expect(
      failUseCase.execute(user.id, 'wrong', 'new'),
    ).rejects.toThrow();
    expect(userRepository.save).not.toHaveBeenCalled();
  });
});
