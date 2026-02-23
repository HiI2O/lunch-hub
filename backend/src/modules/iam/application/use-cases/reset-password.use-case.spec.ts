/* eslint-disable @typescript-eslint/unbound-method */
import { ResetPasswordUseCase } from './reset-password.use-case.js';
import type { IUserRepository } from '../../domain/repositories/user.repository.js';
import type {
  IPasswordResetTokenRepository,
  PasswordResetTokenRecord,
} from '../../domain/repositories/password-reset-token.repository.js';
import type { ISessionRepository } from '../../domain/repositories/session.repository.js';
import type { PasswordHasher } from '../../domain/services/password-hasher.interface.js';
import { User } from '../../domain/aggregates/user.js';
import { EmailAddress } from '../../domain/value-objects/email-address.js';
import { DisplayName } from '../../domain/value-objects/display-name.js';
import { PasswordHash } from '../../domain/value-objects/password-hash.js';
import { Role } from '../../domain/value-objects/role.js';
import { UserStatus } from '../../domain/value-objects/user-status.js';
import { PasswordResetToken } from '../../domain/value-objects/password-reset-token.js';
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error.js';
import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';

const VALID_HASH =
  '$2b$12$LJ3m4ys3Lg4CeQxrVBMOAOjFYpl1EUW5P4m3GJjfvAY5f6km2gBHa';
const USER_ID = '550e8400-e29b-41d4-a716-446655440000';

function createActiveUser(): User {
  return User.reconstruct({
    id: USER_ID,
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

function createValidTokenRecord(): PasswordResetTokenRecord {
  const futureDate = new Date(Date.now() + 60 * 60 * 1000);
  return {
    id: '660e8400-e29b-41d4-a716-446655440000',
    userId: USER_ID,
    token: PasswordResetToken.create(
      'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      futureDate,
    ),
  };
}

function createExpiredTokenRecord(): PasswordResetTokenRecord {
  const pastDate = new Date(Date.now() - 60 * 60 * 1000);
  return {
    id: '660e8400-e29b-41d4-a716-446655440001',
    userId: USER_ID,
    token: PasswordResetToken.create(
      'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
      pastDate,
    ),
  };
}

describe('ResetPasswordUseCase', () => {
  let useCase: ResetPasswordUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let passwordResetTokenRepository: jest.Mocked<IPasswordResetTokenRepository>;
  let sessionRepository: jest.Mocked<ISessionRepository>;
  let passwordHasher: jest.Mocked<PasswordHasher>;

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

    sessionRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findByRefreshToken: jest.fn(),
      findByUserId: jest.fn(),
      delete: jest.fn(),
      deleteAllByUserId: jest.fn().mockResolvedValue(undefined),
    };

    passwordHasher = {
      hash: jest.fn().mockResolvedValue(VALID_HASH),
      compare: jest.fn(),
    };

    useCase = new ResetPasswordUseCase(
      userRepository,
      passwordResetTokenRepository,
      passwordHasher,
      sessionRepository,
    );
  });

  it('should reset password and invalidate all sessions', async () => {
    const record = createValidTokenRecord();
    const user = createActiveUser();
    passwordResetTokenRepository.findByToken.mockResolvedValue(record);
    userRepository.findById.mockResolvedValue(user);

    await useCase.execute(record.token.token, 'NewStr0ngP@ss');

    expect(passwordHasher.hash).toHaveBeenCalledWith('NewStr0ngP@ss');
    expect(userRepository.save).toHaveBeenCalledTimes(1);
    expect(passwordResetTokenRepository.deleteByUserId).toHaveBeenCalledWith(
      USER_ID,
    );
    expect(sessionRepository.deleteAllByUserId).toHaveBeenCalledWith(USER_ID);
  });

  it('should throw NotFoundError when token record not found', async () => {
    passwordResetTokenRepository.findByToken.mockResolvedValue(null);

    await expect(
      useCase.execute('nonexistent-token', 'NewStr0ngP@ss'),
    ).rejects.toThrow(NotFoundError);
  });

  it('should throw ValidationError when token is expired', async () => {
    const expiredRecord = createExpiredTokenRecord();
    passwordResetTokenRepository.findByToken.mockResolvedValue(expiredRecord);

    await expect(
      useCase.execute(expiredRecord.token.token, 'NewStr0ngP@ss'),
    ).rejects.toThrow(ValidationError);
  });

  it('should throw NotFoundError when user not found', async () => {
    const record = createValidTokenRecord();
    passwordResetTokenRepository.findByToken.mockResolvedValue(record);
    userRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute(record.token.token, 'NewStr0ngP@ss'),
    ).rejects.toThrow(NotFoundError);
  });
});
