import { IUserRepository } from '../../domain/repositories/user.repository.js';
import { ISessionRepository } from '../../domain/repositories/session.repository.js';
import { ITokenService } from '../ports/token-service.interface.js';
import { IRateLimiter } from '../ports/rate-limiter.interface.js';
import { AuthenticationService } from '../../domain/services/authentication.service.js';
import { Session } from '../../domain/aggregates/session.js';
import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error.js';
import type { LoginDto } from '../dto/login.dto.js';
import type { AuthResultDto } from '../dto/auth-result.dto.js';

const MAX_ATTEMPTS = 10;
const WINDOW_SECONDS = 900; // 15 minutes
const SESSION_EXPIRY_DAYS = 7;

export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly sessionRepository: ISessionRepository,
    private readonly tokenService: ITokenService,
    private readonly rateLimiter: IRateLimiter,
    private readonly authenticationService: AuthenticationService,
  ) {}

  async execute(dto: LoginDto): Promise<AuthResultDto> {
    const rateLimitKey = `login:attempts:${dto.email}`;

    const isLimited = await this.rateLimiter.isRateLimited(
      rateLimitKey,
      MAX_ATTEMPTS,
      WINDOW_SECONDS,
    );
    if (isLimited) {
      throw new ValidationError(
        'Too many login attempts. Please try again later.',
      );
    }

    const user = await this.userRepository.findByEmail(dto.email);
    if (user === null) {
      throw new NotFoundError('User', dto.email);
    }

    const isValid = await this.authenticationService.verifyCredentials(
      user,
      dto.password,
    );
    if (!isValid) {
      await this.rateLimiter.increment(rateLimitKey, WINDOW_SECONDS);
      throw new ValidationError('Invalid credentials');
    }

    await this.rateLimiter.reset(rateLimitKey);

    const tokenPair = await this.tokenService.generateTokenPair({
      userId: user.id,
      email: user.email.value,
      role: user.role.value,
    });

    const expiresAt = new Date(
      Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    );
    const session = Session.create({
      id: crypto.randomUUID(),
      userId: user.id,
      refreshToken: tokenPair.refreshToken,
      expiresAt,
    });
    await this.sessionRepository.save(session);

    user.updateLastLogin();
    await this.userRepository.save(user);

    return {
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      user: {
        id: user.id,
        email: user.email.value,
        displayName: user.displayName?.value ?? '',
        role: user.role.value,
      },
    };
  }
}
