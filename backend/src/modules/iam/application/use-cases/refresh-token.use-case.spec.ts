/* eslint-disable @typescript-eslint/unbound-method */
import { RefreshTokenUseCase } from './refresh-token.use-case.js';
import type { ISessionRepository } from '../../domain/repositories/session.repository.js';
import type { ITokenService } from '../ports/token-service.interface.js';
import type { IUserRepository } from '../../domain/repositories/user.repository.js';
import { Session } from '../../domain/aggregates/session.js';
import { User } from '../../domain/aggregates/user.js';
import { EmailAddress } from '../../domain/value-objects/email-address.js';
import { DisplayName } from '../../domain/value-objects/display-name.js';
import { PasswordHash } from '../../domain/value-objects/password-hash.js';
import { Role } from '../../domain/value-objects/role.js';
import { UserStatus } from '../../domain/value-objects/user-status.js';
import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';

const VALID_HASH =
  '$2b$12$LJ3m4ys3Lg4CeQxrVBMOAOjFYpl1EUW5P4m3GJjfvAY5f6km2gBHa';

function createValidSession(): Session {
  return Session.reconstruct({
    id: 'session-id-001',
    userId: 'user-id-001',
    refreshToken: 'refresh-token-abc',
    isRevoked: false,
    createdAt: new Date(),
    lastAccessedAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
}

function createActiveUser(): User {
  return User.reconstruct({
    id: 'user-id-001',
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

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;
  let sessionRepository: jest.Mocked<ISessionRepository>;
  let userRepository: jest.Mocked<IUserRepository>;
  let tokenService: jest.Mocked<ITokenService>;

  beforeEach(() => {
    sessionRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findByRefreshToken: jest.fn(),
      findByUserId: jest.fn(),
      delete: jest.fn(),
      deleteAllByUserId: jest.fn(),
    };

    userRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByInvitationToken: jest.fn(),
      existsByEmail: jest.fn(),
    };

    tokenService = {
      generateTokenPair: jest.fn().mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      }),
      verifyAccessToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
    };

    useCase = new RefreshTokenUseCase(
      sessionRepository,
      userRepository,
      tokenService,
    );
  });

  it('should return new access token on valid refresh', async () => {
    const session = createValidSession();
    const user = createActiveUser();
    sessionRepository.findByRefreshToken.mockResolvedValue(session);
    userRepository.findById.mockResolvedValue(user);

    const result = await useCase.execute('refresh-token-abc');

    expect(result.accessToken).toBe('new-access-token');
  });

  it('should update session lastAccessed and save', async () => {
    const session = createValidSession();
    const user = createActiveUser();
    sessionRepository.findByRefreshToken.mockResolvedValue(session);
    userRepository.findById.mockResolvedValue(user);

    await useCase.execute('refresh-token-abc');

    expect(sessionRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should throw ValidationError when session not found', async () => {
    sessionRepository.findByRefreshToken.mockResolvedValue(null);

    await expect(useCase.execute('invalid-token')).rejects.toThrow(
      ValidationError,
    );
  });

  it('should throw ValidationError when session is revoked', async () => {
    const session = Session.reconstruct({
      id: 'session-id-001',
      userId: 'user-id-001',
      refreshToken: 'refresh-token-abc',
      isRevoked: true,
      createdAt: new Date(),
      lastAccessedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    sessionRepository.findByRefreshToken.mockResolvedValue(session);

    await expect(useCase.execute('refresh-token-abc')).rejects.toThrow(
      ValidationError,
    );
  });

  it('should throw ValidationError when session is expired', async () => {
    const session = Session.reconstruct({
      id: 'session-id-001',
      userId: 'user-id-001',
      refreshToken: 'refresh-token-abc',
      isRevoked: false,
      createdAt: new Date(),
      lastAccessedAt: new Date(),
      expiresAt: new Date(Date.now() - 1000), // expired
    });
    sessionRepository.findByRefreshToken.mockResolvedValue(session);

    await expect(useCase.execute('refresh-token-abc')).rejects.toThrow(
      ValidationError,
    );
  });

  it('should generate token pair with correct payload', async () => {
    const session = createValidSession();
    const user = createActiveUser();
    sessionRepository.findByRefreshToken.mockResolvedValue(session);
    userRepository.findById.mockResolvedValue(user);

    await useCase.execute('refresh-token-abc');

    expect(tokenService.generateTokenPair).toHaveBeenCalledWith({
      userId: 'user-id-001',
      email: 'test@example.com',
      role: 'GENERAL_USER',
    });
  });
});
