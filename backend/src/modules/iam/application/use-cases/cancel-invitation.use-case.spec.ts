/* eslint-disable @typescript-eslint/unbound-method */
import { CancelInvitationUseCase } from './cancel-invitation.use-case.js';
import type { IUserRepository } from '../../domain/repositories/user.repository.js';
import { User } from '../../domain/aggregates/user.js';
import { EmailAddress } from '../../domain/value-objects/email-address.js';
import { Role } from '../../domain/value-objects/role.js';
import { UserStatus } from '../../domain/value-objects/user-status.js';
import { InvitationToken } from '../../domain/value-objects/invitation-token.js';
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error.js';

function createInvitedUser(): User {
  return User.reconstruct({
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: EmailAddress.create('invited@example.com'),
    displayName: null,
    passwordHash: null,
    role: Role.create('GENERAL_USER'),
    status: UserStatus.create('INVITED'),
    invitationToken: InvitationToken.create(),
    invitedBy: 'admin-id',
    invitedAt: new Date(),
    activatedAt: null,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
  });
}

describe('CancelInvitationUseCase', () => {
  let useCase: CancelInvitationUseCase;
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

    useCase = new CancelInvitationUseCase(userRepository);
  });

  it('should cancel invitation and save user', async () => {
    const user = createInvitedUser();
    userRepository.findById.mockResolvedValue(user);

    await useCase.execute(user.id);

    expect(userRepository.save).toHaveBeenCalledTimes(1);
    expect(user.status.value).toBe('DEACTIVATED');
    expect(user.invitationToken).toBeNull();
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
