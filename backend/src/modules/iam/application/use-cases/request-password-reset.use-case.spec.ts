/* eslint-disable @typescript-eslint/unbound-method */
import { RequestPasswordResetUseCase } from './request-password-reset.use-case.js';
import type { IUserRepository } from '../../domain/repositories/user.repository.js';
import type { IPasswordResetTokenRepository } from '../../domain/repositories/password-reset-token.repository.js';
import type { IEmailService } from '../ports/email-service.interface.js';
import { User } from '../../domain/aggregates/user.js';
import { EmailAddress } from '../../domain/value-objects/email-address.js';
import { DisplayName } from '../../domain/value-objects/display-name.js';
import { PasswordHash } from '../../domain/value-objects/password-hash.js';
import { Role } from '../../domain/value-objects/role.js';
import { UserStatus } from '../../domain/value-objects/user-status.js';

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

function createDeactivatedUser(): User {
  return User.reconstruct({
    id: '550e8400-e29b-41d4-a716-446655440001',
    email: EmailAddress.create('deactivated@example.com'),
    displayName: DisplayName.create('無効ユーザー'),
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

describe('RequestPasswordResetUseCase', () => {
  let useCase: RequestPasswordResetUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let passwordResetTokenRepository: jest.Mocked<IPasswordResetTokenRepository>;
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

    passwordResetTokenRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findByToken: jest.fn(),
      deleteByUserId: jest.fn().mockResolvedValue(undefined),
    };

    emailService = {
      send: jest.fn().mockResolvedValue(undefined),
    };

    useCase = new RequestPasswordResetUseCase(
      userRepository,
      passwordResetTokenRepository,
      emailService,
      appUrl,
    );
  });

  it('should save token and send email when user is active', async () => {
    const user = createActiveUser();
    userRepository.findByEmail.mockResolvedValue(user);

    await useCase.execute('test@example.com');

    expect(passwordResetTokenRepository.save).toHaveBeenCalledTimes(1);
    expect(emailService.send).toHaveBeenCalledTimes(1);

    const sendCall = emailService.send.mock.calls[0][0];
    expect(sendCall.to).toBe('test@example.com');
    expect(sendCall.html).toContain(appUrl);
  });

  it('should silently return when user not found (security measure)', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute('nonexistent@example.com'),
    ).resolves.toBeUndefined();

    expect(passwordResetTokenRepository.save).not.toHaveBeenCalled();
    expect(emailService.send).not.toHaveBeenCalled();
  });

  it('should silently return when user is not active', async () => {
    const user = createDeactivatedUser();
    userRepository.findByEmail.mockResolvedValue(user);

    await expect(
      useCase.execute('deactivated@example.com'),
    ).resolves.toBeUndefined();

    expect(passwordResetTokenRepository.save).not.toHaveBeenCalled();
    expect(emailService.send).not.toHaveBeenCalled();
  });
});
