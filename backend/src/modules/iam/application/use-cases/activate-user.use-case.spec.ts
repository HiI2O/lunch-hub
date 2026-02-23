/* eslint-disable @typescript-eslint/unbound-method */
import { ActivateUserUseCase } from './activate-user.use-case.js';
import type { IUserRepository } from '../../domain/repositories/user.repository.js';
import type { ISessionRepository } from '../../domain/repositories/session.repository.js';
import type { ITokenService } from '../ports/token-service.interface.js';
import type { PasswordHasher } from '../../domain/services/password-hasher.interface.js';
import { InvitationService } from '../../domain/services/invitation.service.js';
import { User } from '../../domain/aggregates/user.js';
import { EmailAddress } from '../../domain/value-objects/email-address.js';
import { Role } from '../../domain/value-objects/role.js';
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error.js';
import type { ActivateUserDto } from '../dto/activate-user.dto.js';

const VALID_HASH =
  '$2b$12$LJ3m4ys3Lg4CeQxrVBMOAOjFYpl1EUW5P4m3GJjfvAY5f6km2gBHa';

function createInvitedUser(): User {
  return User.invite({
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: EmailAddress.create('test@example.com'),
    role: Role.create('GENERAL_USER'),
    invitedBy: 'admin-id',
  });
}

describe('ActivateUserUseCase', () => {
  let useCase: ActivateUserUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let sessionRepository: jest.Mocked<ISessionRepository>;
  let tokenService: jest.Mocked<ITokenService>;
  let passwordHasher: jest.Mocked<PasswordHasher>;
  let invitationService: InvitationService;

  beforeEach(() => {
    userRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByInvitationToken: jest.fn(),
      existsByEmail: jest.fn(),
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
      generateTokenPair: jest.fn().mockResolvedValue({
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
      }),
      verifyAccessToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
    };

    passwordHasher = {
      hash: jest.fn().mockResolvedValue(VALID_HASH),
      compare: jest.fn(),
    };

    invitationService = new InvitationService();

    useCase = new ActivateUserUseCase(
      userRepository,
      sessionRepository,
      tokenService,
      passwordHasher,
      invitationService,
    );
  });

  it('should return AuthResultDto on successful activation', async () => {
    const user = createInvitedUser();
    const token = user.invitationToken!.token;
    userRepository.findByInvitationToken.mockResolvedValue(user);

    const dto: ActivateUserDto = {
      token,
      password: 'StrongP@ss1',
      displayName: 'テストユーザー',
    };

    const result = await useCase.execute(dto);

    expect(result.accessToken).toBe('access-token-123');
    expect(result.refreshToken).toBe('refresh-token-456');
    expect(result.user.id).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(result.user.email).toBe('test@example.com');
    expect(result.user.displayName).toBe('テストユーザー');
    expect(result.user.role).toBe('GENERAL_USER');
  });

  it('should save activated user', async () => {
    const user = createInvitedUser();
    const token = user.invitationToken!.token;
    userRepository.findByInvitationToken.mockResolvedValue(user);

    await useCase.execute({
      token,
      password: 'StrongP@ss1',
      displayName: 'テストユーザー',
    });

    expect(userRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should create session on activation (auto-login)', async () => {
    const user = createInvitedUser();
    const token = user.invitationToken!.token;
    userRepository.findByInvitationToken.mockResolvedValue(user);

    await useCase.execute({
      token,
      password: 'StrongP@ss1',
      displayName: 'テストユーザー',
    });

    expect(sessionRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should hash the password', async () => {
    const user = createInvitedUser();
    const token = user.invitationToken!.token;
    userRepository.findByInvitationToken.mockResolvedValue(user);

    await useCase.execute({
      token,
      password: 'StrongP@ss1',
      displayName: 'テストユーザー',
    });

    expect(passwordHasher.hash).toHaveBeenCalledWith('StrongP@ss1');
  });

  it('should throw NotFoundError when user not found by invitation token', async () => {
    userRepository.findByInvitationToken.mockResolvedValue(null);

    await expect(
      useCase.execute({
        token: 'nonexistent-token',
        password: 'StrongP@ss1',
        displayName: 'テスト',
      }),
    ).rejects.toThrow(NotFoundError);
  });

  it('should generate token pair with correct payload', async () => {
    const user = createInvitedUser();
    const token = user.invitationToken!.token;
    userRepository.findByInvitationToken.mockResolvedValue(user);

    await useCase.execute({
      token,
      password: 'StrongP@ss1',
      displayName: 'テストユーザー',
    });

    expect(tokenService.generateTokenPair).toHaveBeenCalledWith({
      userId: '550e8400-e29b-41d4-a716-446655440000',
      email: 'test@example.com',
      role: 'GENERAL_USER',
    });
  });
});
