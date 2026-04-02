/* eslint-disable @typescript-eslint/unbound-method */
import { DeactivateUserUseCase } from './deactivate-user.use-case.js';
import type { IUserRepository } from '../../domain/repositories/user.repository.js';
import type { ISessionRepository } from '../../domain/repositories/session.repository.js';
import { User } from '../../domain/aggregates/user.js';
import { EmailAddress } from '../../domain/value-objects/email-address.js';
import { DisplayName } from '../../domain/value-objects/display-name.js';
import { PasswordHash } from '../../domain/value-objects/password-hash.js';
import { Role } from '../../domain/value-objects/role.js';
import { UserStatus } from '../../domain/value-objects/user-status.js';
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error.js';

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

describe('DeactivateUserUseCase', () => {
  let useCase: DeactivateUserUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let sessionRepository: jest.Mocked<ISessionRepository>;

  beforeEach(() => {
    userRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByInvitationToken: jest.fn(),
      existsByEmail: jest.fn(),
      findAll: jest.fn(),
    };

    sessionRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findByRefreshToken: jest.fn(),
      findByUserId: jest.fn(),
      delete: jest.fn(),
      deleteAllByUserId: jest.fn().mockResolvedValue(undefined),
    };

    useCase = new DeactivateUserUseCase(userRepository, sessionRepository);
  });

  it('should deactivate user and delete all sessions', async () => {
    const user = createActiveUser();
    userRepository.findById.mockResolvedValue(user);

    await useCase.execute(user.id);

    expect(userRepository.save).toHaveBeenCalledTimes(1);
    expect(sessionRepository.deleteAllByUserId).toHaveBeenCalledWith(user.id);
  });

  it('should throw NotFoundError when user not found', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent-id')).rejects.toThrow(
      NotFoundError,
    );
  });

  it('should save user before deleting sessions', async () => {
    const user = createActiveUser();
    userRepository.findById.mockResolvedValue(user);

    const callOrder: string[] = [];
    userRepository.save.mockImplementation(() => {
      callOrder.push('save');
      return Promise.resolve();
    });
    sessionRepository.deleteAllByUserId.mockImplementation(() => {
      callOrder.push('deleteSessions');
      return Promise.resolve();
    });

    await useCase.execute(user.id);

    expect(callOrder).toEqual(['save', 'deleteSessions']);
  });
});
