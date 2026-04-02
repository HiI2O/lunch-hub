/* eslint-disable @typescript-eslint/unbound-method */
import { ConfigService } from '@nestjs/config';
import { AdminSeedService } from './admin-seed.service.js';
import { IUserRepository } from '../../domain/repositories/user.repository.js';
import { PasswordHasher } from '../../domain/services/password-hasher.interface.js';

describe('AdminSeedService', () => {
  let service: AdminSeedService;
  let userRepository: jest.Mocked<IUserRepository>;
  let passwordHasher: jest.Mocked<PasswordHasher>;
  let configService: jest.Mocked<ConfigService>;

  const ADMIN_EMAIL = 'admin@company.com';
  const ADMIN_PASSWORD = 'Admin123!';
  const ADMIN_DISPLAY_NAME = 'System Admin';
  const BCRYPT_HASH =
    '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

  beforeEach(() => {
    userRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByInvitationToken: jest.fn(),
      existsByEmail: jest.fn(),
      findAll: jest.fn(),
    } as unknown as jest.Mocked<IUserRepository>;

    passwordHasher = {
      hash: jest.fn().mockResolvedValue(BCRYPT_HASH),
      compare: jest.fn(),
    } as unknown as jest.Mocked<PasswordHasher>;

    configService = {
      get: jest.fn(),
    } as unknown as jest.Mocked<ConfigService>;

    service = new AdminSeedService(
      userRepository,
      passwordHasher,
      configService,
    );
  });

  describe('onApplicationBootstrap', () => {
    it('should create admin user when env vars are set and user does not exist', async () => {
      configService.get.mockImplementation(
        (key: string): string | undefined => {
          const map: Record<string, string> = {
            ADMIN_EMAIL,
            ADMIN_PASSWORD,
            ADMIN_DISPLAY_NAME,
          };
          return map[key];
        },
      );
      userRepository.existsByEmail.mockResolvedValue(false);

      await service.onApplicationBootstrap();

      expect(userRepository.existsByEmail).toHaveBeenCalledWith(ADMIN_EMAIL);
      expect(passwordHasher.hash).toHaveBeenCalledWith(ADMIN_PASSWORD);
      expect(userRepository.save).toHaveBeenCalledTimes(1);

      const savedUser = userRepository.save.mock.calls[0][0];
      expect(savedUser.email.value).toBe(ADMIN_EMAIL);
      expect(savedUser.role.value).toBe('ADMINISTRATOR');
      expect(savedUser.displayName?.value).toBe(ADMIN_DISPLAY_NAME);
      expect(savedUser.status.value).toBe('ACTIVE');
      expect(savedUser.getDomainEvents()).toHaveLength(0);
    });

    it('should skip seed when admin user already exists', async () => {
      configService.get.mockImplementation(
        (key: string): string | undefined => {
          const map: Record<string, string> = {
            ADMIN_EMAIL,
            ADMIN_PASSWORD,
            ADMIN_DISPLAY_NAME,
          };
          return map[key];
        },
      );
      userRepository.existsByEmail.mockResolvedValue(true);

      await service.onApplicationBootstrap();

      expect(userRepository.existsByEmail).toHaveBeenCalledWith(ADMIN_EMAIL);
      expect(passwordHasher.hash).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should skip seed when ADMIN_EMAIL is not set', async () => {
      configService.get.mockImplementation(
        (key: string): string | undefined => {
          const map: Record<string, string> = {
            ADMIN_PASSWORD,
            ADMIN_DISPLAY_NAME,
          };
          return map[key];
        },
      );

      await service.onApplicationBootstrap();

      expect(userRepository.existsByEmail).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should skip seed when ADMIN_PASSWORD is not set', async () => {
      configService.get.mockImplementation(
        (key: string): string | undefined => {
          const map: Record<string, string> = {
            ADMIN_EMAIL,
            ADMIN_DISPLAY_NAME,
          };
          return map[key];
        },
      );

      await service.onApplicationBootstrap();

      expect(userRepository.existsByEmail).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should skip seed when ADMIN_DISPLAY_NAME is not set', async () => {
      configService.get.mockImplementation(
        (key: string): string | undefined => {
          const map: Record<string, string> = {
            ADMIN_EMAIL,
            ADMIN_PASSWORD,
          };
          return map[key];
        },
      );

      await service.onApplicationBootstrap();

      expect(userRepository.existsByEmail).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should skip seed when all env vars are missing', async () => {
      configService.get.mockReturnValue(undefined);

      await service.onApplicationBootstrap();

      expect(userRepository.existsByEmail).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });
});
