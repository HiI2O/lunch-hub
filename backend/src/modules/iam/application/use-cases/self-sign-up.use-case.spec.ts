/* eslint-disable @typescript-eslint/unbound-method */
import { SelfSignUpUseCase } from './self-sign-up.use-case.js';
import type { IUserRepository } from '../../domain/repositories/user.repository.js';
import type { IEmailService } from '../ports/email-service.interface.js';
import type { IRateLimiter } from '../ports/rate-limiter.interface.js';
import { ConflictError } from '../../../../shared/domain/errors/conflict.error.js';
import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';

describe('SelfSignUpUseCase', () => {
  let useCase: SelfSignUpUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let emailService: jest.Mocked<IEmailService>;
  let rateLimiter: jest.Mocked<IRateLimiter>;

  const companyPin = 'LUNCH2024';
  const appUrl = 'https://lunch-hub.example.com';

  beforeEach(() => {
    userRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByInvitationToken: jest.fn(),
      existsByEmail: jest.fn().mockResolvedValue(false),
      findAll: jest.fn(),
    };

    emailService = {
      send: jest.fn().mockResolvedValue(undefined),
    };

    rateLimiter = {
      isRateLimited: jest.fn().mockResolvedValue(false),
      increment: jest.fn().mockResolvedValue(undefined),
      reset: jest.fn().mockResolvedValue(undefined),
    };

    useCase = new SelfSignUpUseCase(
      userRepository,
      emailService,
      rateLimiter,
      companyPin,
      appUrl,
    );
  });

  it('should return success message on valid signup', async () => {
    const result = await useCase.execute({
      email: 'new@example.com',
      pin: companyPin,
    });

    expect(result.message).toBe('Invitation email sent');
  });

  it('should save user to repository', async () => {
    await useCase.execute({
      email: 'new@example.com',
      pin: companyPin,
    });

    expect(userRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should send invitation email', async () => {
    await useCase.execute({
      email: 'new@example.com',
      pin: companyPin,
    });

    expect(emailService.send).toHaveBeenCalledTimes(1);
    const sendCall = emailService.send.mock.calls[0][0];
    expect(sendCall.to).toBe('new@example.com');
  });

  it('should throw ValidationError when rate limited', async () => {
    rateLimiter.isRateLimited.mockResolvedValue(true);

    await expect(
      useCase.execute({ email: 'new@example.com', pin: companyPin }),
    ).rejects.toThrow(ValidationError);
  });

  it('should throw ValidationError when PIN is invalid', async () => {
    await expect(
      useCase.execute({ email: 'new@example.com', pin: 'WRONG_PIN' }),
    ).rejects.toThrow(ValidationError);
  });

  it('should throw ConflictError when email already exists', async () => {
    userRepository.existsByEmail.mockResolvedValue(true);

    await expect(
      useCase.execute({ email: 'existing@example.com', pin: companyPin }),
    ).rejects.toThrow(ConflictError);
  });

  it('should check rate limit with correct parameters', async () => {
    await useCase.execute({
      email: 'new@example.com',
      pin: companyPin,
    });

    expect(rateLimiter.isRateLimited).toHaveBeenCalledWith(
      'signup:attempts:new@example.com',
      10,
      900,
    );
  });

  it('should increment rate limiter before PIN validation', async () => {
    await expect(
      useCase.execute({ email: 'new@example.com', pin: 'WRONG' }),
    ).rejects.toThrow(ValidationError);

    expect(rateLimiter.increment).toHaveBeenCalledWith(
      'signup:attempts:new@example.com',
      900,
    );
  });
});
