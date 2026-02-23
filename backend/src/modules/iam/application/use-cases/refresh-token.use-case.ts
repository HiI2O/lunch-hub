import { ISessionRepository } from '../../domain/repositories/session.repository.js';
import { IUserRepository } from '../../domain/repositories/user.repository.js';
import { ITokenService } from '../ports/token-service.interface.js';
import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';

interface RefreshTokenResult {
  readonly accessToken: string;
}

export class RefreshTokenUseCase {
  constructor(
    private readonly sessionRepository: ISessionRepository,
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenService,
  ) {}

  async execute(refreshToken: string): Promise<RefreshTokenResult> {
    const session =
      await this.sessionRepository.findByRefreshToken(refreshToken);
    if (session === null) {
      throw new ValidationError('Invalid refresh token');
    }

    if (!session.isValid()) {
      throw new ValidationError('Session is no longer valid');
    }

    const user = await this.userRepository.findById(session.userId);
    if (user === null) {
      throw new ValidationError('User not found for session');
    }

    const tokenPair = await this.tokenService.generateTokenPair({
      userId: user.id,
      email: user.email.value,
      role: user.role.value,
    });

    session.updateLastAccessed();
    await this.sessionRepository.save(session);

    return {
      accessToken: tokenPair.accessToken,
    };
  }
}
