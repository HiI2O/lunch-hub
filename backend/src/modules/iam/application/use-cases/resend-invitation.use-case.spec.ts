/* eslint-disable @typescript-eslint/unbound-method */
import { ResendInvitationUseCase } from './resend-invitation.use-case.js';
import type { IUserRepository } from '../../domain/repositories/user.repository.js';
import type { IEmailService } from '../ports/email-service.interface.js';
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

describe('ResendInvitationUseCase', () => {
  let useCase: ResendInvitationUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let emailService: jest.Mocked<IEmailService>;

  const appUrl = 'https://lunch-hub.example.com';

  beforeEach(() => {
    userRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByInvitationToken: jest.fn(),
      existsByEmail: jest.fn(),
      findAll: jest.fn(),
    };

    emailService = {
      send: jest.fn().mockResolvedValue(undefined),
    };

    useCase = new ResendInvitationUseCase(userRepository, emailService, appUrl);
  });

  it('should refresh token, save user, and send email', async () => {
    const user = createInvitedUser();
    userRepository.findById.mockResolvedValue(user);

    await useCase.execute(user.id);

    expect(userRepository.save).toHaveBeenCalledTimes(1);
    expect(emailService.send).toHaveBeenCalledTimes(1);

    const sendCall = emailService.send.mock.calls[0][0];
    expect(sendCall.to).toBe('invited@example.com');
    expect(sendCall.html).toContain(appUrl);
  });

  it('should throw NotFoundError when user not found', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent-id')).rejects.toThrow(
      NotFoundError,
    );
  });

  it('should include activation URL in email body', async () => {
    const user = createInvitedUser();
    userRepository.findById.mockResolvedValue(user);

    await useCase.execute(user.id);

    const sendCall = emailService.send.mock.calls[0][0];
    expect(sendCall.html).toContain('/activate?token=');
  });
});
