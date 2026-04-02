/* eslint-disable @typescript-eslint/unbound-method */
import { LoginUseCase } from './login.use-case.js';
import type { IUserRepository } from '../../domain/repositories/user.repository.js';
import type { ISessionRepository } from '../../domain/repositories/session.repository.js';
import type {
  ITokenService,
  TokenPair,
} from '../ports/token-service.interface.js';
import type { IRateLimiter } from '../ports/rate-limiter.interface.js';
import { AuthenticationService } from '../../domain/services/authentication.service.js';
import { User } from '../../domain/aggregates/user.js';
import { EmailAddress } from '../../domain/value-objects/email-address.js';
import { DisplayName } from '../../domain/value-objects/display-name.js';
import { PasswordHash } from '../../domain/value-objects/password-hash.js';
import { Role } from '../../domain/value-objects/role.js';
import { UserStatus } from '../../domain/value-objects/user-status.js';
import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error.js';
import type { LoginDto } from '../dto/login.dto.js';

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

function createMockTokenPair(): TokenPair {
  return {
    accessToken: 'access-token-123',
    refreshToken: 'refresh-token-456',
  };
}

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let sessionRepository: jest.Mocked<ISessionRepository>;
  let tokenService: jest.Mocked<ITokenService>;
  let rateLimiter: jest.Mocked<IRateLimiter>;
  let authService: AuthenticationService;

  const dto: LoginDto = {
    email: 'test@example.com',
    password: 'correct-password',
  };

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
      deleteAllByUserId: jest.fn(),
    };

    tokenService = {
      generateTokenPair: jest.fn().mockResolvedValue(createMockTokenPair()),
      verifyAccessToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
    };

    rateLimiter = {
      isRateLimited: jest.fn().mockResolvedValue(false),
      increment: jest.fn().mockResolvedValue(undefined),
      reset: jest.fn().mockResolvedValue(undefined),
    };

    const mockHasher = {
      hash: jest.fn(),
      compare: jest.fn().mockResolvedValue(true),
    };
    authService = new AuthenticationService(mockHasher);

    useCase = new LoginUseCase(
      userRepository,
      sessionRepository,
      tokenService,
      rateLimiter,
      authService,
    );
  });

  it('should return AuthResultDto on successful login', async () => {
    const user = createActiveUser();
    userRepository.findByEmail.mockResolvedValue(user);

    const result = await useCase.execute(dto);

    expect(result.accessToken).toBe('access-token-123');
    expect(result.refreshToken).toBe('refresh-token-456');
    expect(result.user.id).toBe(user.id);
    expect(result.user.email).toBe('test@example.com');
    expect(result.user.displayName).toBe('テスト');
    expect(result.user.role).toBe('GENERAL_USER');
  });

  it('should save session on successful login', async () => {
    const user = createActiveUser();
    userRepository.findByEmail.mockResolvedValue(user);

    await useCase.execute(dto);

    expect(sessionRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should update lastLoginAt and save user on success', async () => {
    const user = createActiveUser();
    userRepository.findByEmail.mockResolvedValue(user);

    await useCase.execute(dto);

    expect(userRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should reset rate limiter on successful login', async () => {
    const user = createActiveUser();
    userRepository.findByEmail.mockResolvedValue(user);

    await useCase.execute(dto);

    expect(rateLimiter.reset).toHaveBeenCalledWith(
      'login:attempts:test@example.com',
    );
  });

  it('should throw NotFoundError when user not found', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(useCase.execute(dto)).rejects.toThrow(NotFoundError);
  });

  it('should throw ValidationError when rate limited', async () => {
    rateLimiter.isRateLimited.mockResolvedValue(true);

    await expect(useCase.execute(dto)).rejects.toThrow(ValidationError);
  });

  it('should increment rate limiter and throw on invalid credentials', async () => {
    const user = createActiveUser();
    userRepository.findByEmail.mockResolvedValue(user);

    const failHasher = {
      hash: jest.fn(),
      compare: jest.fn().mockResolvedValue(false),
    };
    const failAuthService = new AuthenticationService(failHasher);
    const failUseCase = new LoginUseCase(
      userRepository,
      sessionRepository,
      tokenService,
      rateLimiter,
      failAuthService,
    );

    await expect(
      failUseCase.execute({ email: 'test@example.com', password: 'wrong' }),
    ).rejects.toThrow(ValidationError);
    expect(rateLimiter.increment).toHaveBeenCalledWith(
      'login:attempts:test@example.com',
      900,
    );
  });

  it('should check rate limit with correct parameters', async () => {
    const user = createActiveUser();
    userRepository.findByEmail.mockResolvedValue(user);

    await useCase.execute(dto);

    expect(rateLimiter.isRateLimited).toHaveBeenCalledWith(
      'login:attempts:test@example.com',
      10,
      900,
    );
  });
});
