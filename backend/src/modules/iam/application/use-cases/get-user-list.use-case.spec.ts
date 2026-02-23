import { GetUserListUseCase } from './get-user-list.use-case.js';
import type { IUserRepository } from '../../domain/repositories/user.repository.js';
import { User } from '../../domain/aggregates/user.js';
import { EmailAddress } from '../../domain/value-objects/email-address.js';
import { DisplayName } from '../../domain/value-objects/display-name.js';
import { PasswordHash } from '../../domain/value-objects/password-hash.js';
import { Role } from '../../domain/value-objects/role.js';
import { UserStatus } from '../../domain/value-objects/user-status.js';

const VALID_HASH =
  '$2b$12$LJ3m4ys3Lg4CeQxrVBMOAOjFYpl1EUW5P4m3GJjfvAY5f6km2gBHa';

const now = new Date();

function createUser(
  id: string,
  email: string,
  displayName: string | null,
  role: string,
  status: string,
): User {
  return User.reconstruct({
    id,
    email: EmailAddress.create(email),
    displayName: displayName !== null ? DisplayName.create(displayName) : null,
    passwordHash: PasswordHash.create(VALID_HASH),
    role: Role.create(role),
    status: UserStatus.create(status),
    invitationToken: null,
    invitedBy: null,
    invitedAt: new Date(),
    activatedAt: new Date(),
    lastLoginAt: null,
    createdAt: now,
    updatedAt: now,
    version: 1,
  });
}

describe('GetUserListUseCase', () => {
  let useCase: GetUserListUseCase;
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

    useCase = new GetUserListUseCase(userRepository);
  });

  it('should return list of UserProfileDto', async () => {
    const users = [
      createUser(
        '550e8400-e29b-41d4-a716-446655440000',
        'user1@example.com',
        'ユーザー1',
        'GENERAL_USER',
        'ACTIVE',
      ),
      createUser(
        '550e8400-e29b-41d4-a716-446655440001',
        'user2@example.com',
        'ユーザー2',
        'STAFF',
        'ACTIVE',
      ),
    ];
    userRepository.findAll.mockResolvedValue(users);

    const result = await useCase.execute();

    expect(result).toHaveLength(2);
    expect(result[0].email).toBe('user1@example.com');
    expect(result[0].displayName).toBe('ユーザー1');
    expect(result[1].email).toBe('user2@example.com');
    expect(result[1].role).toBe('STAFF');
  });

  it('should return empty array when no users exist', async () => {
    userRepository.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toHaveLength(0);
  });

  it('should map null displayName correctly', async () => {
    const users = [
      createUser(
        '550e8400-e29b-41d4-a716-446655440000',
        'nodisplay@example.com',
        null,
        'GENERAL_USER',
        'ACTIVE',
      ),
    ];
    userRepository.findAll.mockResolvedValue(users);

    const result = await useCase.execute();

    expect(result[0].displayName).toBeNull();
  });
});
