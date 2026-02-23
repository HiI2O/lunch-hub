/* eslint-disable @typescript-eslint/unbound-method */
import { InviteUserUseCase } from './invite-user.use-case.js';
import type { IUserRepository } from '../../domain/repositories/user.repository.js';
import type { IEmailService } from '../ports/email-service.interface.js';
import { ConflictError } from '../../../../shared/domain/errors/conflict.error.js';
import type { InviteUserDto } from '../dto/invite-user.dto.js';

describe('InviteUserUseCase', () => {
  let useCase: InviteUserUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let emailService: jest.Mocked<IEmailService>;

  const invitedBy = 'admin-user-id-001';
  const appUrl = 'https://lunch-hub.example.com';

  const dto: InviteUserDto = {
    email: 'new@example.com',
    role: 'GENERAL_USER',
  };

  beforeEach(() => {
    userRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByInvitationToken: jest.fn(),
      existsByEmail: jest.fn().mockResolvedValue(false),
    };

    emailService = {
      send: jest.fn().mockResolvedValue(undefined),
    };

    useCase = new InviteUserUseCase(userRepository, emailService, appUrl);
  });

  it('should return userId and email on successful invitation', async () => {
    const result = await useCase.execute(dto, invitedBy);

    expect(result.userId).toBeDefined();
    expect(result.email).toBe('new@example.com');
  });

  it('should save user to repository', async () => {
    await useCase.execute(dto, invitedBy);

    expect(userRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should send invitation email', async () => {
    await useCase.execute(dto, invitedBy);

    expect(emailService.send).toHaveBeenCalledTimes(1);
    const sendCall = emailService.send.mock.calls[0][0];
    expect(sendCall.to).toBe('new@example.com');
  });

  it('should throw ConflictError when email already exists', async () => {
    userRepository.existsByEmail.mockResolvedValue(true);

    await expect(useCase.execute(dto, invitedBy)).rejects.toThrow(
      ConflictError,
    );
  });

  it('should create user with correct role', async () => {
    const staffDto: InviteUserDto = {
      email: 'staff@example.com',
      role: 'STAFF',
    };

    await useCase.execute(staffDto, invitedBy);

    expect(userRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should include invitation URL in email body', async () => {
    await useCase.execute(dto, invitedBy);

    const sendCall = emailService.send.mock.calls[0][0];
    expect(sendCall.html).toContain(appUrl);
  });
});
